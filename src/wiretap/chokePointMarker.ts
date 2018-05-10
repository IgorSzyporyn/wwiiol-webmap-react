import { wiretap, COUNTRY, UNITLEVEL } from './index'
import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import { IPosition } from './latlng'

export interface IChokePointMarkerFeatures {
  airfield: boolean
  ao: boolean
  contention: boolean
  frontline: boolean
  hq: boolean
  industry: boolean
  navalbase: boolean
  paratroopers: boolean
  unit: boolean
  units: boolean
}

export interface IChokePointMarker {
  ao: string
  allow?: boolean
  country: COUNTRY
  facilities: string[]
  factories: string[]
  features: IChokePointMarkerFeatures
  id: string
  markerType: string
  position: IPosition
  size: number
  title: string
  units: string[]
}

export interface IChokePointMarkerMap {
  [key: string]: IChokePointMarker
}

const factoryRegEx = new RegExp('Production Facility')

export const fetchChokePointMarkers = (store: any) =>
  new Promise((resolve) => {
    const state: IRootState = store.getState()
    const chokePointMarkers: IChokePointMarker[] = []
    const chokePointMarkerMap: IChokePointMarkerMap = {}

    // Iterate the chokePoint - attach relevant info
    // hcunits, ao's etc, and add to chokePointMarker
    state.wiretap.chokePoints.forEach((chokePoint) => {
      const features: IChokePointMarkerFeatures = {
        airfield: false,
        ao: false,
        contention: false,
        frontline: wiretap.isFrontLineCp(chokePoint.id),
        hq: false,
        industry: false,
        navalbase: false,
        paratroopers: false,
        unit: false,
        units: false,
      }

      const marker: IChokePointMarker = {
        ao: '',
        country: state.wiretap.chokePointStateMap[chokePoint.id].controller,
        facilities: [],
        factories: [],
        features,
        id: chokePoint.id,
        markerType: 'cp',
        position: chokePoint.position,
        size: 1,
        title: chokePoint.name,
        units: [],
      }

      state.wiretap.facilities.forEach((facility) => {
        if (facility.cp === chokePoint.id) {
          // @todo - find another way
          // Only way to check if it is a factory in this iteration
          // directly - very ugly hack
          if (factoryRegEx.test(facility.name)) {
            marker.factories.push(facility.id)
            marker.features.industry = true
          } else {
            marker.facilities.push(facility.id)
          }

          // Check if facility is an airfield or a navalbase
          // and set features accordingly
          switch (facility.type) {
            case '8':
              marker.features.airfield = true
              break
            case '6':
            case '10':
              marker.features.navalbase = true
              break
            default:
              break
          }
        }
      })

      marker.size = marker.facilities.length

      // Attach any possible AO
      state.wiretap.attackObjectives.forEach((ao) => {
        if (ao.id === marker.id) {
          marker.ao = ao.id
          // Add ao and contention status to features
          marker.features.ao = true
          marker.features.contention = !!ao.contention
        }
      })

      // Attach any possible units
      state.wiretap.units.forEach((unit) => {
        // Bypass if not located in this cp
        if (state.wiretap.unitLocationMap[unit.id].cp === chokePoint.id) {
          marker.units.push(unit.id)

          // Add units and hq status to features
          marker.features.unit = true
          if (unit.level === UNITLEVEL.CORPS || unit.level === UNITLEVEL.COMMAND) {
            marker.features.hq = true
          }
        }
      })

      // Add units status to features now we have a count to check
      if (marker.units.length) {
        marker.features.units = true
      }

      chokePointMarkers.push(marker)
      chokePointMarkerMap[marker.id] = marker
    })

    store.dispatch(actions.wiretapStageEventMessage('Processing city overlays'))
    resolve({ chokePointMarkers, chokePointMarkerMap })
  })
