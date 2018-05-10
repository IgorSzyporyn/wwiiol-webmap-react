import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import { wiretap, COUNTRY, SIDE } from '.'
import { IPosition } from './latlng'

export interface IFireBaseMarker {
  country: COUNTRY
  id: string
  position: IPosition
  markerType: string
  side: SIDE
  size: number
  title: string
  type: string
}

export interface IFireBaseMarkerMap {
  [key: string]: IFireBaseMarker
}

export const fetchFireBaseMarkers = (store: any) =>
  new Promise((resolve) => {
    const state: IRootState = store.getState()
    const fireBaseMarkers: IFireBaseMarker[] = []
    const fireBaseMarkerMap: IFireBaseMarkerMap = {}

    state.wiretap.fireBases.forEach((fb) => {
      const marker: IFireBaseMarker = {
        country: fb.ctry,
        id: fb.id,
        markerType: 'fb',
        position: fb.position,
        side: fb.side,
        size: 1,
        title: fb.name,
        type: 'single',
      }
      fireBaseMarkers.push(marker)
      fireBaseMarkerMap[marker.id] = marker
    })

    store.dispatch(actions.wiretapStageEventMessage('Created FB overlays'))
    resolve({ fireBaseMarkers, fireBaseMarkerMap })
  })
