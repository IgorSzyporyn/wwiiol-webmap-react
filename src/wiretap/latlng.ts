import load from 'load-script'
import { wiretap } from './index'
import * as actions from 'action/wiretap'

export interface IPosition {
  lat: number
  lng: number
}

export const fetchLatLng = (store: any) =>
  new Promise((resolve) => {
    load(`${wiretap.HOST}/wwiiol-latlon.js`, (err: any) => {
      if (err) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading google functionality'))
        resolve(false)
      } else {
        store.dispatch(actions.wiretapStageEventMessage('Loaded google functionality from CRS'))
        resolve(true)
      }
    })
  })
