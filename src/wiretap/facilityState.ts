import * as actions from 'action/wiretap'
import request from 'then-request'
import { parseString } from 'xml2js'
import { wiretap, COUNTRY, SIDE } from './index'

export type FacilityStateOpen = 'y'

export interface IFacilityStateResponse {
  $: IFacilityState
}

export interface IFacilityState {
  ctry: COUNTRY
  id: string
  side: SIDE
  open?: FacilityStateOpen
}

export interface IFacilityStateMap {
  [key: string]: IFacilityState
}

export const fetchFacilityStates = (store: any, id?: string) =>
  new Promise((resolve) => {
    let realId: string | undefined | null = id

    if (!id) {
      // const state = store.getState()
      // realId = state.ui.activeCp ? state.ui.activeCp : false
      realId = null
    }

    if (realId) {
      request('GET', `${wiretap.XMLQUERY}/facilities.xml?cp=${realId}`, {
        timeout: wiretap.TIMEOUT,
      }).done((res) => {
        if (res.statusCode === 0) {
          store.dispatch(actions.wiretapStageEventMessage('Failed loading facility state data'))
          resolve(false)
        } else {
          const body = res.getBody()

          parseString(body, (err, result) => {
            const facilityStates: IFacilityState[] = []
            const facilityStateMap: IFacilityStateMap = {}

            result.facilities.fac.forEach((fac: IFacilityStateResponse) => {
              const facility = fac.$

              facilityStates.push(facility)
              facilityStateMap[facility.id] = facility
            })

            store.dispatch(actions.wiretapStageEventMessage('Loaded facility state data'))
            resolve({ facilityStates, facilityStateMap })
          })
        }
      })
    } else {
      resolve()
    }
  })
