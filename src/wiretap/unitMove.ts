import { parseString } from 'xml2js'
import request from 'then-request'
import { wiretap } from './index'
import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'

export interface IUnitMove {
  id: string
  at: string
  from: string
  to: string
  by: string
  age: string
  delay: string
}

export interface IUnitMoveMap {
  [key: string]: IUnitMove
}

export const fetchUnitMoves = (store: any) =>
  new Promise((resolve) => {
    const initialized = store.getState().wiretap.initialized
    const hours = initialized ? '1' : '24'

    request('GET', `${wiretap.XMLQUERY}/hcmoves.xml?hours=${hours}`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading HC unit movement data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const state: IRootState = store.getState()
          const unitMoves: IUnitMove[] = [...state.wiretap.unitMoves]
          const unitMoveMap: IUnitMoveMap = { ...state.wiretap.unitMoveMap }
          const notification: any[] = []
          const moves: any[] = result.hcmoves.move || []

          moves.forEach((mov) => {
            const move = mov.$

            const hcUnit = state.wiretap.unitMap[move.id]
            const fromCp = state.wiretap.chokePointMap[move.from]
            const toCp = state.wiretap.chokePointMap[move.to]

            // Make sure this hcunit movement does not already exist
            // in our list and map
            if (!unitMoveMap[move.id]) {
              // Place this new move in the main list and map
              // of moves also...
              unitMoves.push(move)
              unitMoveMap[move.id] = move

              // If this is not an initialization run
              // then we also would like to maintain the list
              // of new hcunit movements
              if (state.wiretap.initialized) {
                const notification = { ...move }

                notification.unit = hcUnit.title
                notification.nick = hcUnit.nick
                notification.short = hcUnit.short
                notification.fromCp = fromCp.name
                notification.toCp = toCp.name
                notification.notificationType = 'unitmove'

                notification.push(notification)
              }
            }
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded HC unit movement data'))
          resolve({ notification, unitMoves, unitMoveMap })
        })
      }
    })
  })
