import * as actions from 'action/wiretap'
import request from 'then-request'
import { IChokePoint } from 'wiretap/chokePoint'
import { IFacility } from 'wiretap/facility'
import { parseString } from 'xml2js'
import { COUNTRY, wiretap } from './index'
import { IRootState } from 'reducer/state'
import { IPosition } from './latlng'
// request('GET', `${wiretap.HOST}/xmlquery/captures.xml?hours=24&limit=2000`, {
// request('GET', 'http://www.szyporyn.com/captures.xml', {

export type ContentionType = 'Enter' | 'End'
export type CaptureType = 'city' | 'facility'
export type ControlType = 'capture' | 'liberation'

export interface ICaptureResponse {
  $: ICaptureRaw
}

export interface ICaptureRaw {
  at: string
  brig: string
  by: string
  con: ContentionType
  fac: string
  from: COUNTRY
  id: string
  to: COUNTRY
  own?: 'y' | boolean
  ctrl?: 'y' | boolean
}

export interface ICapture extends ICaptureRaw {
  captureType: CaptureType
  controlType?: ControlType
  cpId: string
  cpName: string
  ctrl?: boolean
  facName: string
  facilityId: string
  notificationType: string
  own?: boolean
  position: IPosition
}

export interface ICaptureMap {
  [key: string]: ICapture
}

// Used to find out of a capture is also a cp liberation or capture in which
// town changes ownership.
// Will return null if not - if it is - then an
// extended version of the recieved object is returned.
export const createOwnershipObject = (cap: ICapture): ICapture | null => {
  let capture: ICapture | null = null

  // If the con property is present we can be sure
  // that this was either a liberation or capture
  if (cap.con) {
    capture = {
      ...cap,
      captureType: 'city',
      id: `${cap.id}_c`,
    }

    if (cap.con === 'End') {
      capture.controlType = cap.own ? 'capture' : 'liberation'
    }
  }

  return capture
}

export const createCaptureObject = (
  cap: ICaptureRaw,
  cp: IChokePoint,
  facility: IFacility,
): ICapture => ({
  ...cap,
  captureType: 'facility',
  cpId: cp.id,
  cpName: cp.name,
  ctrl: !!cap.ctrl,
  facName: facility.name,
  facilityId: facility.id,
  notificationType: 'capture',
  own: !!cap.own,
  position: cp.position,
})

export const fetchCaptures = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.HOST}/xmlquery/captures.xml?hours=24&limit=2000`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading capture data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const state: IRootState = store.getState()
          const captures: ICapture[] = []
          const captureMap: ICaptureMap = {}
          const list: ICaptureResponse[] = result.captures.cap || []

          list.forEach((c$) => {
            const cap = c$.$

            const facility = state.wiretap.facilityMap[cap.fac]
            const cp = state.wiretap.chokePointMap[facility.cp]

            const capture = createCaptureObject(cap, cp, facility)
            const cityCapture = createOwnershipObject(capture)

            if (cityCapture && cityCapture.con === 'Enter') {
              captures.push(cityCapture)
              captures[+cityCapture.id] = cityCapture
            }

            captures.push(capture)
            captureMap[capture.id] = capture

            if (cityCapture && cityCapture.con === 'End') {
              captures.push(cityCapture)
              captures[+cityCapture.id] = cityCapture
            }
          })

          // @todo - check if the chronology matches
          store.dispatch(actions.wiretapStageEventMessage('Loaded capture data'))
          resolve({ captures, captureMap })
        })
      }
    })
  })
