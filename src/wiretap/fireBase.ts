import request from 'then-request'
import { parseString } from 'xml2js'
import * as actions from 'action/wiretap'
import { wiretap, COUNTRY, SIDE } from './index'
import { IPosition } from './latlng'
import { IRootState } from 'reducer/state'

export interface IFireBaseResponse {
  $: IFireBaseRaw
}

export interface IFireBaseRaw {
  'orig-country': COUNTRY
  'orig-side': SIDE
  absx: string
  absy: string
  cp: string
  ctry: COUNTRY
  position: IPosition
  id: string
  lat: number
  lng: number
  name: string
  side: SIDE
  type: string
  x: string
  y: string
}

export interface IFireBase extends IFireBaseRaw {
  isFrontLine: boolean
}

export interface IFireBaseMap {
  [key: string]: IFireBase
}

export interface IFetchFireBases {
  fireBases: IFireBase[]
  fireBaseMap: IFireBaseMap
}

export const fetchFireBases = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XMLQUERY}/facilities.xml?fbs=all`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading FB data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const state: IRootState = store.getState()

          const fireBases: IFireBase[] = []
          const fireBaseMap: IFireBaseMap = {}

          result.facilities.fac.forEach((f$: IFireBaseResponse) => {
            const fbRaw = f$.$
            const fbId = fbRaw.id

            const fb: IFireBase = {
              ...fbRaw,
              ...state.wiretap.facilityMap[fbId],
              isFrontLine: wiretap.isFrontLineFb(fbId),
            }

            fireBases.push(fb)
            fireBaseMap[fbId] = fb
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded FireBase data'))
          resolve({ fireBases, fireBaseMap })
        })
      }
    })
  })
