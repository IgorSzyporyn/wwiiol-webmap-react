import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import request from 'then-request'
import {
  IAttackObjective,
  IAttackObjectiveMap,
  IAttackObjectiveResponse,
} from 'wiretap/attackObjective'
import { parseString } from 'xml2js'
import { wiretap } from './index'
import { IPosition } from './latlng'

export interface IAttackObjectiveNotification extends IAttackObjective {
  aoType: string
  cpName: string
  notificationType: string
  position: IPosition
}

export interface IAttackObjectiveNotificationMap {
  [key: string]: IAttackObjectiveNotification
}

export const fetchAttackObjectiveNotifications = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XMLQUERY}/cps.xml?aos=true`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading AO notification data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err: any, result: any) => {
          const state: IRootState = store.getState()
          const attackObjectives: IAttackObjective[] = []
          const attackObjectiveMap: IAttackObjectiveMap = {}
          const notifications: IAttackObjectiveNotification[] = []
          const notificationMap: IAttackObjectiveNotificationMap = {}

          // Go through the gotten list (if any) and build our
          // reference array and object map
          result.cps.cp.forEach((cp: IAttackObjectiveResponse) => {
            const ao = cp.$
            attackObjectiveMap[ao.ao] = ao
            attackObjectives.push(ao)
          })

          // Go through the old list and match against the
          // new AO map to find AO's lifted
          state.wiretap.attackObjectives.forEach((attackObjective) => {
            // if this AO is not to be found in the new
            // attackObjectiveMap then it has been lifted
            if (
              !attackObjectiveMap[attackObjective.ao] &&
              !state.wiretap.notificationMap[attackObjective.ao]
            ) {
              const cp = state.wiretap.chokePointMap[attackObjective.id]

              notificationMap[attackObjective.ao] = {
                ...attackObjective,
                aoType: 'removed',
                cpName: cp.name,
                notificationType: 'ao',
                position: cp.position,
              }

              notifications.push(notificationMap[attackObjective.ao])
            }
          })

          // Go through new list and match against
          // the old AO map to find AO's placed
          attackObjectives.forEach((attackObjective) => {
            // if this AO is not to be found in the old
            // attackObjectiveMap then it has been added
            if (
              !state.wiretap.attackObjectiveMap[attackObjective.ao] &&
              !state.wiretap.notificationMap[attackObjective.ao]
            ) {
              const cp = state.wiretap.chokePointMap[attackObjective.id]

              notificationMap[attackObjective.ao] = {
                ...attackObjective,
                aoType: 'placed',
                cpName: cp.name,
                notificationType: 'ao',
                position: cp.position,
              }

              notifications.push(notificationMap[attackObjective.ao])
            }
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded AO nofitication data'))
          resolve({ notifications, notificationMap })
        })
      }
    })
  })
