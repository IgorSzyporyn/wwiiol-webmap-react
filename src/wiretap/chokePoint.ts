import { parseString } from 'xml2js'
import request from 'then-request'
import { wiretap, COUNTRY, SIDE } from './index'
import * as actions from 'action/wiretap'
import { IPosition } from './latlng'

export interface IChokePointRaw {
  id: string
  name: string
  type: string
  'orig-country': COUNTRY
  'orig-side': SIDE
  links: string
  x: string
  y: string
  absx: string
  absy: string
}

export interface IChokePoint extends IChokePointRaw {
  lat: number
  lng: number
  position: IPosition
}

export interface IChokePointMap {
  [key: string]: IChokePoint
}

const windowClone: any = window

export const fetchChokePoints = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XML}/cplist.citys.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading city data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          // Run through the cps from XML and build our own
          // chokePoint & chokePointMap and dispatch them
          const chokePoints: IChokePoint[] = []
          const chokePointMap: IChokePointMap = {}

          result.cplist.cp.forEach(($cp: any) => {
            const cpRaw = $cp.$
            const cpId = cpRaw.id
            const { glat, glon } = windowClone.getLatLonFromOctetXY(cpRaw.x, cpRaw.y)
            const position: IPosition = { lat: glat, lng: glon }

            const cp: IChokePoint = {
              ...cpRaw,
              lat: glat,
              lng: glon,
              position,
            }

            chokePoints.push(cp)
            chokePointMap[cpId] = cp
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded city data'))
          resolve({ chokePoints, chokePointMap })
        })
      }
    })
  })
