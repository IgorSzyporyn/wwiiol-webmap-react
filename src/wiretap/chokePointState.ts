import { parseString } from 'xml2js'
import request from 'then-request'
import { wiretap, COUNTRY, SIDE } from './index'
import * as actions from 'action/wiretap'

export interface IChokePointResponse {
  $: IChokePointStateRaw
}

export interface IChokePointStateRaw {
  id: string
  own: string
  ao: string
}

export interface IChokePointState extends IChokePointStateRaw {
  controller: COUNTRY
  owner: SIDE
}

export interface IChokePointStateMap {
  [key: string]: IChokePointState
}

export const fetchChokePointStates = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XMLQUERY}/cps.xml?all=true`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading city state data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const chokePointStates: IChokePointState[] = []
          const chokePointStateMap: IChokePointStateMap = {}

          result.cps.cp.forEach((cp: IChokePointResponse) => {
            const cpRaw = cp.$
            const cpId = cpRaw.id
            // Create "owner" & "controller" props
            // by splitting "own" - "4/2" (controller/owner)
            const owner: any = cpRaw.own.split('/').pop()
            const controller: any = cpRaw.own.split('/').shift()

            const cpState: IChokePointState = {
              ...cpRaw,
              controller,
              owner,
            }

            chokePointStates.push(cpState)
            chokePointStateMap[cpId] = cpState
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded city state data'))
          resolve({ chokePointStates, chokePointStateMap })
        })
      }
    })
  })
