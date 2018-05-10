import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import googleMapsLoadWhenReady from 'tools/googleMapsLoadWhenReady'
import { getBoundaryPolygons } from 'tools/googleMapsUtils'
import { fetchAttackObjectives } from './attackObjective'
import { fetchAttackObjectiveNotifications } from './attackObjectiveNotification'
import { ICapture, fetchCaptures } from './capture'
import { fetchCaptureNotifications } from './captureNotification'
import { IChokePoint, fetchChokePoints } from './chokePoint'
import { fetchChokePointLinks } from './chokePointLink'
import { fetchChokePointMarkers } from './chokePointMarker'
import { fetchChokePointStates } from './chokePointState'
import { fetchDeaths } from './death'
import { IFacility, fetchFacilities } from './facility'
import { fetchFacilityStates, IFacilityStateMap } from './facilityState'
import { fetchFireBases } from './fireBase'
import { fetchFireBaseMarkers } from './fireBaseMarker'
import { fetchLatLng } from './latlng'
import { fetchWiretapMeta } from './meta'
import { INotification, INotificationMap } from './notification'
import { fetchUnits } from './unit'
import { fetchUnitLocations } from './unitLocation'
import { fetchUnitMoves } from './unitMove'

export enum SIDE {
  NO_SIDE = '0',
  ALLIED = '1',
  AXIS = '2',
  NEUTRAL = '3',
}

export enum COUNTRY {
  NO_COUNTRY = '0',
  ENGLAND = '1',
  USA = '2',
  FRANCE = '3',
  GERMANY = '4',
  ITALY = '5',
  JAPAN = '6',
  COMMONWEALTH = '7',
  CHINA = '8',
  RUSSIA = '9',
}

export enum BRANCH {
  NO_BRANCH = '0',
  LAND = '1',
  AIR = '2',
  SEA = '3',
}

export enum UNITLEVEL {
  COMMAND = '3',
  CORPS = '4',
  DIVISION = '5',
  BRIGADE = '6',
}

export interface IWiretapApi {
  DEFAULT_ZOOM: number
  HOST: string
  TIMEOUT: number
  XML: string
  XMLQUERY: string
  MESSAGE_DELAY: number
  MIN_ZOOM: number
  MAX_ZOOM: number
  store: any | null
  init: (store: any) => void
  checkResultsForFails: (results: any) => any[]
}

interface IFacilityType extends IFacility {
  side: SIDE
  country: COUNTRY
}

interface IFacilityFeatureMap {
  airbase: any[]
  armybase: any[]
  default: any[]
  depot: any[]
  firebase: any[]
  industrial: any[]
  navalbase: any[]
}

export interface IFactory extends IFacility {
  country: COUNTRY
  side: SIDE
}

interface IWindow {
  wwii_get_side: (id: number) => number
}

const windowClone: IWindow & any = window

// We split between factories and facilities
// a factory is still a facility and can be capped
// but is singled out as an industrial complex
const factoryRegEx = new RegExp('Production Facility')

const HOST = 'http://wiretap.wwiionline.com'
const XML = `${HOST}/xml`
const XMLQUERY = `${HOST}/xmlquery`
const MESSAGE_DELAY = 250
const MAX_ZOOM = 9
const MIN_ZOOM = 7
const DEFAULT_ZOOM = 7

let STORE: any | null = null

export const wiretap = {
  DEFAULT_ZOOM,
  HOST,
  MAX_ZOOM,
  MESSAGE_DELAY,
  MIN_ZOOM,
  TIMEOUT: 5000,
  XML,
  XMLQUERY,

  checkResultsForFails: (results: any) => results.some((result: any) => result === false),

  getStore: () => STORE,

  init: (store: any) => {
    STORE = store

    store.dispatch(actions.wiretapLoading(true))
    store.dispatch(actions.wiretapStageMessage('Loading Static & Meta Data'))

    // Start the promise chain - we use a promise chain since
    // some data is very static and the foundation for other loaded
    // data - data loaded later which is still static, but relies on
    // foundation data (like latitude and longitude etc...)

    // Load foundation data for each city, facility, unit,
    // and the links between cities
    Promise.all([fetchWiretapMeta(store), fetchLatLng(store)]).then((results) => {
      const loadingFailed = wiretap.checkResultsForFails(results)

      if (loadingFailed) {
        store.dispatch(actions.wiretapLoading(false))
        store.dispatch(actions.wiretapOffline(true))
      } else {
        Promise.all([
          fetchChokePoints(store),
          fetchFacilities(store),
          fetchUnits(store),
          fetchChokePointLinks(store),
        ]).then((staticResults) => {
          const staticFailed = wiretap.checkResultsForFails(staticResults)

          if (staticFailed) {
            store.dispatch(actions.wiretapLoading(false))
            store.dispatch(actions.wiretapOffline(true))
          } else {
            // Dispatch the returned foundation data for cities,
            // facilities, units and links.
            wiretap.dispatchPromise(staticResults, actions.wiretapStaticData)
            store.dispatch(actions.wiretapStageMessage('Fetching Dynamic Data'))

            // Load dynamic data - data that can change over time
            // based on user interactions in the game, such as
            // attack objectives, status/ownership of cities and
            // unit locations
            Promise.all([
              fetchAttackObjectives(store),
              fetchCaptures(store),
              fetchChokePointStates(store),
              // fetchUnitLocations(store),
              fetchUnitMoves(store),
            ]).then((dynamicResults) => {
              const dynamicFailed = wiretap.checkResultsForFails(dynamicResults)

              if (dynamicFailed) {
                store.dispatch(actions.wiretapLoading(false))
                store.dispatch(actions.wiretapOffline(true))
              } else {
                // Dispatch the returned dynamic data about attack objectives,
                // ownership status of cities/facilities and unit locations
                wiretap.dispatchPromise(dynamicResults, actions.wiretapDynamicData)
                store.dispatch(actions.wiretapStageMessage('Fetching Marker Data'))

                Promise.all([fetchFireBases(store), fetchUnitLocations(store)]).then(
                  (middlewareList) => {
                    const middlewareListFailed = wiretap.checkResultsForFails(middlewareList)

                    if (middlewareListFailed) {
                      store.dispatch(actions.wiretapOffline(true))
                      store.dispatch(actions.wiretapLoading(false))
                    } else {
                      wiretap.dispatchPromise(middlewareList, actions.wiretapUpdate)
                      store.dispatch(actions.wiretapStageMessage('Waiting for Google Maps'))
                      // Since we heavily use Google Maps - we want to be sure
                      // that it is loaded before we expose the next data to redux
                      // and the application will start rendering them.

                      googleMapsLoadWhenReady(() => {
                        store.dispatch(actions.wiretapStageMessage('Creating Markers'))
                        // Load data we have created for use in our application
                        // using the wiretap data available
                        // Such as our marker list for cities, captures, unit
                        // movements RDP information and so on...
                        Promise.all([
                          // fetchUnitLocations(store),
                          fetchFireBaseMarkers(store),
                          fetchChokePointMarkers(store),
                        ]).then((overlayResults) => {
                          const overlayFailed = wiretap.checkResultsForFails(overlayResults)

                          if (overlayFailed) {
                            store.dispatch(actions.wiretapOffline(true))
                            store.dispatch(actions.wiretapLoading(false))
                          } else {
                            wiretap.dispatchPromise(overlayResults, actions.wiretapMarkerData)

                            setTimeout(() => {
                              store.dispatch(actions.wiretapStageMessage('Successfully Loaded'))
                              store.dispatch(actions.wiretapInitialized(true))
                              store.dispatch(actions.wiretapLoading(false))
                              // wiretap.updateOwnershipBoundaries()

                              // Set the interval to look for live changes on the
                              // map to every 30 seconds
                              setInterval(() => {
                                if (store.getState().filter.hotload) {
                                  // wiretap.updateNotification()
                                  // wiretap.updateOwnershipBoundaries()
                                }
                              }, 25000)
                            }, 1500)
                          }
                        })
                      })
                    }
                  },
                )
              }
            })
          }
        })
      }
    })
  },

  updateOwnershipBoundaries: () => {
    const store = wiretap.getStore()
    const alliedChokePoints = wiretap.getChokePointsBySide(SIDE.ALLIED)
    const axisChokePoints = wiretap.getChokePointsBySide(SIDE.AXIS)

    function removeOffline(coord: IChokePoint) {
      return !/\b(?:offline|training|fort|camp)\b/i.test(coord.name)
    }

    const boundariesAllies = getBoundaryPolygons(
      alliedChokePoints.filter(removeOffline).map((coord) => {
        return coord.position
      }),
    )

    const boundariesAxis = getBoundaryPolygons(
      axisChokePoints.filter(removeOffline).map((coord) => {
        return coord.position
      }),
    )

    store.dispatch(actions.wiretapUpdate({ boundariesAllies, boundariesAxis }))
  },

  getChokePointsBySide: (sideId: SIDE) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const { chokePointStates, chokePointMap } = state.wiretap
    const chokePoints: IChokePoint[] = []

    chokePointStates.forEach((cp) => {
      if (cp.owner === sideId) {
        const chokePoint = chokePointMap[cp.id]
        chokePoints.push(chokePoint)
      }
    })

    return chokePoints
  },

  updateFull: () => {
    const store = wiretap.getStore()

    Promise.all([
      fetchAttackObjectives(store),
      fetchChokePointStates(store),
      fetchFacilityStates(store),
      fetchUnitLocations(store),
      fetchCaptures(store),
    ]).then((dataResults) => {
      wiretap.dispatchPromise(dataResults, actions.wiretapUpdate)

      Promise.all([fetchChokePointMarkers(store)]).then((markerResults) => {
        wiretap.dispatchPromise(markerResults, actions.wiretapUpdate)
      })
    })
  },

  updateDeathList: () => {
    fetchDeaths().then((result) => {
      wiretap.dispatchPromise([result], actions.wiretapUpdate)
    })
  },

  updateNotification: () => {
    const store = wiretap.getStore()

    Promise.all([fetchAttackObjectiveNotifications(store), fetchCaptureNotifications(store)]).then(
      (results: any) => {
        let list: INotification[] = []
        let map: INotificationMap = {}

        if (results && results.length) {
          results.forEach((result: any) => {
            if (result.notifications.length) {
              list = [...list, ...result.notifications]
              map = { ...map, ...result.notificationMap }
            }
          })
        }

        if (list.length) {
          // Keep track of the notificationCount as well
          const state: IRootState = store.getState()
          const count: number = state.wiretap.notificationCount + list.length

          wiretap.dispatchPromise(
            [
              {
                notificationCount: count,
                notificationMap: map,
                notifications: list,
              },
            ],
            actions.wiretapNotification,
          )

          wiretap.updateFull()
        }
      },
    )
  },

  updateCp: (id: string) => {
    const store = wiretap.getStore()
    // @todo - also get cpState in here ofc

    Promise.all([fetchFacilityStates(store, id)]).then((results) => {
      wiretap.dispatchPromise(results, actions.wiretapUpdate)
    })
  },

  dispatchPromise: (results: any[] = [], action: any) => {
    const store = wiretap.getStore()
    const toDispatch = {}

    results.forEach((result: any) => {
      Object.assign(toDispatch, result || {})
    })

    if (store) {
      store.dispatch(action(toDispatch))
    }
  },

  cpHasAo: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    return !!state.wiretap.attackObjectiveMap[id]
  },

  cpHasFactories: (id: string) => !!wiretap.getFactoriesArrayFromCp(id).length,

  getFacilityFeatureMap: (cpId: string, facilityStateMap: IFacilityStateMap) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const facilityMap = state.wiretap.facilityMap

    const facilityTypeMap: IFacilityFeatureMap = {
      airbase: [], // 8
      armybase: [], // 9
      default: [], // 0 (undefined) & 5 (OMT)
      depot: [], // 4 & 1 (city) & 2 (factory) && 6 (shipyard)
      firebase: [], // 7
      industrial: [], // 2
      navalbase: [], // 10
    }

    const list = wiretap.getFacilitiesArrayFromCp(cpId)

    if (list && list.length) {
      list.forEach((id) => {
        const stateMap = facilityStateMap[id]
        const { side, ctry } = stateMap

        const facility: IFacilityType = {
          ...facilityMap[id],
          country: ctry,
          side,
        }

        // @todo - find another way
        // Special case for factories that are considered
        // industrial complexes
        // Only way to check if it is a factory in this iteration
        // directly - very ugly hack
        if (factoryRegEx.test(facility.name)) {
          facilityTypeMap.industrial.push(facility)
        } else {
          switch (facility.type) {
            case '8':
              facilityTypeMap.airbase.push(facility)
              break

            case '9':
              facilityTypeMap.armybase.push(facility)
              break

            case '0':
            case '5':
              facilityTypeMap.default.push(facility)
              break

            case '1':
            case '2':
            case '4':
            case '6':
              facilityTypeMap.depot.push(facility)
              break

            case '7':
              facilityTypeMap.firebase.push(facility)
              break

            case '10':
              facilityTypeMap.navalbase.push(facility)
              break

            default:
              facilityTypeMap.default.push(facility)
              break
          }
        }
      })
    }

    return facilityTypeMap
  },

  getUnitChildren: (unitId: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const units = state.wiretap.units

    const foundUnits = units.filter((unit) => unit.parent === unitId)

    return foundUnits
  },

  getFactoriesFromCp: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const facilities = state.wiretap.facilities
    const facilityMap = state.wiretap.facilityMap
    const facilityStateMap = state.wiretap.facilityStateMap
    const returnList: IFactory[] = []

    facilities.forEach((fac) => {
      const stateMap = facilityStateMap[fac.id]

      const factory: IFactory = {
        ...facilityMap[id],
        country: stateMap.ctry,
        side: stateMap.side,
      }

      returnList.push(factory)
    })

    return returnList
  },

  getFactoriesArrayFromCp: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const facilities = state.wiretap.facilities
    const returnList: string[] = []

    facilities.forEach((facility) => {
      if (facility.cp === id && factoryRegEx.test(facility.name)) {
        returnList.push(facility.id)
      }
    })

    return returnList
  },

  getFacilitiesArrayFromCp: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const facilities = state.wiretap.facilities
    const returnList: string[] = []

    facilities.forEach((facility) => {
      if (facility.cp === id) {
        returnList.push(facility.id)
      }
    })

    return returnList
  },

  // @TODO should get the captures on its own and just take the ID as argument
  getFacilityCapturesFromCp: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const captures = state.wiretap.captures
    const cpFacilities = wiretap.getFacilitiesArrayFromCp(id)
    const returnList: ICapture[] = []

    captures.forEach((cap) => {
      // Check if this captured facility is in cp
      if (cpFacilities.indexOf(cap.fac) > -1) {
        const capture = { ...cap }

        returnList.push(capture)
      }
    })

    return returnList
  },

  getSideFromCountry: (country: COUNTRY): any => {
    const countryId = +country
    const sideId: string = `${windowClone.wwii_get_side(countryId)}`

    // Since ALL data and ID's and everything from
    // wiretap are strings - we keep in line
    return sideId
  },

  isFrontLineCp: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const chokePointStateMap = state.wiretap.chokePointStateMap
    const linkList = state.wiretap.chokePointLinks
    let isFrontLine = false

    const status = chokePointStateMap[id]

    if (status) {
      linkList.forEach((item: any) => {
        if (item.lcp === id) {
          const opposingStatus = chokePointStateMap[item.rcp]
          if (opposingStatus && opposingStatus.owner !== status.owner) {
            isFrontLine = true
          }
        }
      })
    }

    return isFrontLine
  },

  getCpById: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const { chokePointMap } = state.wiretap

    return chokePointMap[id]
  },

  isFrontLineFb: (id: string) => {
    const store = wiretap.getStore()
    const state: IRootState = store.getState()
    const { chokePointLinks, chokePointStateMap } = state.wiretap
    let isFrontLine: boolean = false
    let foundLink: any

    chokePointLinks.some((item: any) => {
      if (item.fb === id) {
        foundLink = item
      }
      return item.fb === id
    })

    if (
      foundLink &&
      chokePointStateMap[foundLink.lcp].owner !== chokePointStateMap[foundLink.rcp].owner
    ) {
      isFrontLine = true
    }

    return isFrontLine
  },
}

windowClone.wiretap = wiretap
