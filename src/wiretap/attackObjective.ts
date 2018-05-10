import * as actions from 'action/wiretap'
import request from 'then-request'
import { parseString } from 'xml2js'
import { wiretap } from './index'

export interface IAttackObjectiveResponse {
  $: IAttackObjective
}

export interface IAttackObjectiveRaw {
  ao: string
  id: string
  own: string
  contention?: boolean | string
  ctrl?: string
}

export interface IAttackObjective extends IAttackObjectiveRaw {
  contention: boolean
}

export interface IAttackObjectiveMap {
  [key: string]: IAttackObjective
}

export const fetchAttackObjectives = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XMLQUERY}/cps.xml?aos=true`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading AO data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const attackObjectives: IAttackObjective[] = []
          const attackObjectiveMap: IAttackObjectiveMap = {}

          if (result.cps && result.cps.cp) {
            result.cps.cp.forEach((cp: IAttackObjectiveResponse) => {
              const aoRaw = cp.$

              const ao = {
                ...aoRaw,
                contention: aoRaw.contention,
              }

              attackObjectives.push(ao)
              attackObjectiveMap[ao.ao] = ao
            })
          }

          store.dispatch(actions.wiretapStageEventMessage('Loaded AO data'))
          resolve({ attackObjectives, attackObjectiveMap })
        })
      }
    })
  })
