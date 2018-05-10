import { parseString } from 'xml2js'
import request from 'then-request'
import * as actions from 'action/wiretap'
import { wiretap, COUNTRY, SIDE } from './index'
import { IPosition } from './latlng'

export enum FACILITY {
  CITY = '1',
  PRODUCTION = '2',
  FLAKBATTERY = '3',
  CP = '4',
  OFFLINE = '6',
  TRAINING = '7',
  AIRFIELD = '8',
  ARMYBASE = '9',
  NAVALBASE = '10',
}

export interface IFacilityResponse {
  $: IFacilityRaw
}

export interface IFacilityRaw {
  id: string
  name: string
  cp: string
  type: string
  'orig-country': COUNTRY
  'orig-side': SIDE
  x: string
  y: string
  absx: string
  absy: string
}

export interface IFacility extends IFacilityRaw {
  lat: number
  lng: number
  position: IPosition
}

export interface IFacilityMap {
  [key: string]: IFacility
}

const windowClone: any = window

export const fetchFacilities = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XML}/facilitylist.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading facility data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          // Run through the cps from XML and build our own
          // chokePoint & chokePointMap and dispatch them
          const facilities: IFacility[] = []
          const facilityMap: IFacilityMap = {}

          result.facilitylist.fac.forEach(($fac: IFacilityResponse) => {
            const facRaw = $fac.$
            const facId = facRaw.id
            const { glat, glon } = windowClone.getLatLonFromOctetXY(facRaw.x, facRaw.y)
            const position: IPosition = { lat: glat, lng: glon }

            const fac = {
              ...facRaw,
              lat: glat,
              lng: glon,
              position,
            }

            facilities.push(fac)
            facilityMap[facId] = fac
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded facility data'))
          resolve({ facilities, facilityMap })
        })
      }
    })
  })
