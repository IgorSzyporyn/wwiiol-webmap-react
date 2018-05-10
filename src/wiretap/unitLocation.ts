import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import request from 'then-request'
import { getDistance } from 'tools/googleMapsUtils'
import { parseString } from 'xml2js'
import { IChokePoint } from './chokePoint'
import { UNITLEVEL, wiretap, BRANCH } from './index'
import { IPosition } from './latlng'
import { FACILITY } from './facility'

export interface IUnitLocationResponse {
  $: IUnitLocation
}

export interface IUnitLocation {
  by: string
  cp: string
  id: string
  nxtmv: string
}

export interface IUnitLocationMap {
  [key: string]: IUnitLocation
}

const MIN_CORPS_FACILITIES = 6
const MIN_CORPS_DISTANCE = 40000

const MIN_COMMAND_FACILITIES = 14
const MIN_COMMAND_DISTANCE = 15000

export const fetchUnitLocations = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XMLQUERY}/hclocationsext.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading HC unit location data'))
        resolve(false)
      } else {
        const body = res.getBody()
        const state: IRootState = store.getState()
        const { chokePoints, chokePointStateMap } = state.wiretap

        parseString(body, (err, result) => {
          const unitLocations: IUnitLocation[] = []
          const unitLocationMap: IUnitLocationMap = {}
          const corpsLocations: IUnitLocation[] = []
          const commandLocations: IUnitLocation[] = []

          result['hc-locations'].unit.forEach((loc: IUnitLocationResponse) => {
            const unitLocation = loc.$
            const unit = state.wiretap.unitMap[unitLocation.id]

            if (unitLocation.cp !== '0') {
              unitLocations.push(unitLocation)
              unitLocationMap[unitLocation.id] = unitLocation
            } else {
              if (unit.level === UNITLEVEL.CORPS) {
                corpsLocations.push(unitLocation)
              }

              if (unit.level === UNITLEVEL.COMMAND) {
                commandLocations.push(unitLocation)
              }
            }
          })

          corpsLocations.forEach((unitLocation) => {
            const unit = state.wiretap.unitMap[unitLocation.id]
            let cp: string = ''

            if (unit.level === UNITLEVEL.CORPS) {
              // Find all Divisions in Corps and get a median position - then
              // find nearest city owned by same side with minimum 10 facilities
              // and place Corps there
              const divisions = wiretap.getUnitChildren(unit.id)

              if (divisions && divisions.length) {
                // Map the given back divisions to positions only via CP
                const divisionPositions: IPosition[] = divisions
                  .filter((division) => {
                    const unit = unitLocationMap[division.id]
                    const cpId = unit.cp
                    const cp = state.wiretap.chokePointMap[cpId]
                    return !!cp
                  })
                  .map((division) => {
                    const unit = unitLocationMap[division.id]
                    const cpId = unit.cp
                    const cp = state.wiretap.chokePointMap[cpId]
                    return cp.position
                  })

                // Get a list of all cities to look for a potential candidate in
                // Criteria for all are minimum 10 facilities and 20km from the frontline
                // and the units it represents - and owned by same side
                // For air units - the candidate must also have an airfield, and for sea
                // it must have a navy facility
                const fallbacks: IChokePoint[] = []
                const candidates = chokePoints.filter((chokePoint) => {
                  let isCandidate = false
                  let isFallback = true
                  const chokePointState = chokePointStateMap[chokePoint.id]

                  if (!chokePointState) {
                    return false
                  }

                  // Criteria 1 - Has to be same side
                  if (unit.side === chokePointState.owner) {
                    isCandidate = true
                  } else {
                    isFallback = false
                  }

                  // Criteria 2 - Has to have AF if air, has to have DOCKS if sea
                  if (isCandidate && unit.branch === BRANCH.AIR) {
                    isFallback = false
                    let hasAirField = false

                    state.wiretap.facilities.some((facility) => {
                      let found = false

                      if (facility.cp === chokePoint.id && facility.type === FACILITY.AIRFIELD) {
                        hasAirField = true
                        isFallback = true
                        found = true
                      }

                      return found
                    })

                    isCandidate = hasAirField
                  }

                  if (isCandidate && unit.branch === BRANCH.SEA) {
                    isFallback = false
                    let hasNavalBase = false

                    state.wiretap.facilities.some((facility) => {
                      let found = false

                      if (facility.cp === chokePoint.id && facility.type === FACILITY.NAVALBASE) {
                        hasNavalBase = true
                        isFallback = true
                        found = true
                      }

                      return found
                    })

                    isCandidate = hasNavalBase
                  }

                  // Criteria 3 - Has to have at least xx facilities (be a large town)
                  if (isCandidate) {
                    const facilities = wiretap.getFacilitiesArrayFromCp(chokePoint.id)
                    const factories = wiretap.getFactoriesArrayFromCp(chokePoint.id)
                    isCandidate = facilities.length + factories.length >= MIN_CORPS_FACILITIES
                  }

                  // Criteria 4 - Has to be minimum 40km away from frontline and children
                  let distanceAllow = true
                  if (isCandidate) {
                    divisionPositions.forEach((position) => {
                      const distance = getDistance(position, chokePoint.position)
                      if (distance < MIN_CORPS_DISTANCE) {
                        distanceAllow = false
                      }
                    })

                    if (!distanceAllow) {
                      isCandidate = false
                    }
                  }

                  if (isFallback) {
                    fallbacks.push(chokePoint)
                  }

                  return isCandidate
                })

                // If no suitable candidates found - then use fallback
                const shortList = candidates.length ? candidates : fallbacks

                // Find the town on the shortList closest to the avg pos in division
                let lat = 0
                let lng = 0

                divisionPositions.forEach((pos) => {
                  lat += pos.lat
                  lng += pos.lng
                })

                const avgPosition = {
                  lat: lat / divisionPositions.length,
                  lng: lng / divisionPositions.length,
                }

                let foundDistance = 0

                shortList.forEach((chokePoint, index) => {
                  const dist = getDistance(chokePoint.position, avgPosition)
                  foundDistance = !index ? dist : dist < foundDistance ? dist : foundDistance

                  if (foundDistance === dist) {
                    cp = chokePoint.id
                  }
                })
              }

              unitLocation.cp = cp
              unitLocations.push(unitLocation)
              unitLocationMap[unitLocation.id] = unitLocation
            }
          })

          commandLocations.forEach((unitLocation) => {
            const unit = state.wiretap.unitMap[unitLocation.id]
            let cp: string = ''

            if (unit.level === UNITLEVEL.COMMAND) {
              // Find all Corps in Command and get a median position - then
              // find nearest city owned by same side with minimum xx facilities
              // and place Corps there
              const corps = wiretap.getUnitChildren(unit.id)

              if (corps && corps.length) {
                // Map the given back corps to positions only via CP
                const corpsPositions: IPosition[] = corps
                  .filter((corps) => {
                    const unit = unitLocationMap[corps.id]
                    const cpId = unit.cp
                    const cp = state.wiretap.chokePointMap[cpId]
                    return !!cp
                  })
                  .map((corps) => {
                    const unit = unitLocationMap[corps.id]
                    const cpId = unit.cp
                    const cp = state.wiretap.chokePointMap[cpId]
                    return cp.position
                  })

                // Get a list of all cities to look for a potential candidate in
                // Criteria for all are minimum 10 facilities and 20km from the frontline
                // and the units it represents - and owned by same side
                // For air units - the candidate must also have an airfield, and for sea
                // it must have a navy facility
                const fallbacks: IChokePoint[] = []
                const candidates = chokePoints.filter((chokePoint) => {
                  let isCandidate = false
                  let isFallback = true
                  const chokePointState = chokePointStateMap[chokePoint.id]

                  if (!chokePointState) {
                    return false
                  }

                  // Criteria 1 - Has to be same side
                  if (unit.side === chokePointState.owner) {
                    isCandidate = true
                  } else {
                    isFallback = false
                  }

                  // Criteria 2 - Has to have AF if air, has to have DOCKS if sea
                  if (isCandidate && unit.branch === BRANCH.AIR) {
                    isFallback = false
                    let hasAirField = false

                    state.wiretap.facilities.some((facility) => {
                      let found = false

                      if (facility.cp === chokePoint.id && facility.type === FACILITY.AIRFIELD) {
                        hasAirField = true
                        isFallback = true
                        found = true
                      }

                      return found
                    })

                    isCandidate = hasAirField
                  }

                  if (isCandidate && unit.branch === BRANCH.SEA) {
                    isFallback = false
                    let hasNavalBase = false

                    state.wiretap.facilities.some((facility) => {
                      let found = false

                      if (facility.cp === chokePoint.id && facility.type === FACILITY.NAVALBASE) {
                        hasNavalBase = true
                        isFallback = true
                        found = true
                      }

                      return found
                    })

                    isCandidate = hasNavalBase
                  }

                  // Criteria 3 - Has to have at least xx facilities (be a large town)
                  if (isCandidate) {
                    const facilities = wiretap.getFacilitiesArrayFromCp(chokePoint.id)
                    const factories = wiretap.getFactoriesArrayFromCp(chokePoint.id)
                    isCandidate = facilities.length + factories.length >= MIN_COMMAND_FACILITIES
                  }

                  // Criteria 4 - Has to be minimum 40km away from frontline and children
                  let distanceAllow = true
                  if (isCandidate) {
                    corpsPositions.forEach((position) => {
                      const distance = getDistance(position, chokePoint.position)
                      if (distance < MIN_COMMAND_DISTANCE) {
                        distanceAllow = false
                      }
                    })

                    if (!distanceAllow) {
                      isCandidate = false
                    }
                  }

                  if (isFallback) {
                    fallbacks.push(chokePoint)
                  }

                  return isCandidate
                })

                // If no suitable candidates found - then use fallback
                const shortList = candidates.length ? candidates : fallbacks

                // Find the town on the shortList closest to the avg pos in division
                let lat = 0
                let lng = 0

                corpsPositions.forEach((pos) => {
                  lat += pos.lat
                  lng += pos.lng
                })

                const avgPosition = {
                  lat: lat / corpsPositions.length,
                  lng: lng / corpsPositions.length,
                }

                let foundDistance = 0

                shortList.forEach((chokePoint, index) => {
                  const dist = getDistance(chokePoint.position, avgPosition)
                  foundDistance = !index ? dist : dist < foundDistance ? dist : foundDistance

                  if (foundDistance === dist) {
                    cp = chokePoint.id
                  }
                })
              }

              unitLocation.cp = cp
              unitLocations.push(unitLocation)
              unitLocationMap[unitLocation.id] = unitLocation
            }
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded HC unit location data'))
          resolve({ unitLocations, unitLocationMap })
        })
      }
    })
  })
