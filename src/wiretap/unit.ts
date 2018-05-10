import request from 'then-request'
import { parseString } from 'xml2js'
import * as actions from 'action/wiretap'
import { wiretap, SIDE, BRANCH, COUNTRY, UNITLEVEL } from './index'
import { getSvgRoundel } from 'tools/svgRoundel'

export interface IUnitResponse {
  $: IUnitRaw
}

export interface IUnitRaw {
  id: string
  level: UNITLEVEL
  short: string
  nick: string
  title: string
  parent: string
  ctry: COUNTRY
  branch: BRANCH
  moves: string
  owner: string
  toe: string
}

export interface IUnit extends IUnitRaw {
  side: SIDE
  icon: string
}

export interface IUnitMap {
  [key: string]: IUnit
}

export const fetchUnits = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.HOST}/xml/hcunitlist.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading HC unit data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          // Run through the hcunits from XML and build our own
          // units & unitMap and dispatch them
          const units: IUnit[] = []
          const unitMap: IUnitMap = {}

          debugger

          result.hcunitlist.hcunit.forEach((response: IUnitResponse) => {
            const unitRaw = response.$
            const { id } = unitRaw

            const side = wiretap.getSideFromCountry(unitRaw.ctry)
            const icon = getSvgRoundel({ branch: unitRaw.branch, side })

            const hcUnit: IUnit = {
              ...unitRaw,
              icon,
              side,
            }

            units.push(hcUnit)
            unitMap[id] = hcUnit
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded HC unit data'))
          resolve({ units, unitMap })
        })
      }
    })
  })
