import { ICaptureNotification } from './captureNotification'
import * as actions from 'action/wiretap'
import { IRootState } from 'reducer/state'
import request from 'then-request'
import { createCaptureObject, createOwnershipObject, ICaptureResponse, ICapture } from './capture'
import { parseString } from 'xml2js'
import { wiretap } from './index'
// request('GET', `${wiretap.HOST}/xmlquery/captures.xml`, {
// request('GET', 'http://www.szyporyn.com/captures.xml', {

export interface ICaptureNotificationResponse {
  $: ICapture
}

// tslint:disable-next-line no-empty-interface
export interface ICaptureNotification extends ICapture {}

export interface ICaptureNotificationMap {
  [key: string]: ICapture
}

export const fetchCaptureNotifications = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.HOST}/xmlquery/captures.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading capture notification data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const state: IRootState = store.getState()
          const notifications: ICaptureNotification[] = []
          const notificationMap: ICaptureNotificationMap = {}

          const list: any[] = result.captures.cap || []

          list.forEach((c$: ICaptureResponse) => {
            const cap = c$.$

            if (!state.wiretap.notificationMap[cap.id] && !state.wiretap.captureMap[cap.id]) {
              const facility = state.wiretap.facilityMap[cap.fac]
              const cp = state.wiretap.chokePointMap[facility.cp]

              const capture = createCaptureObject(cap, cp, facility)
              const cityCapture = createOwnershipObject(capture)

              if (cityCapture && cityCapture.con === 'End') {
                notifications.push(cityCapture)
                notificationMap[cityCapture.id] = cityCapture
              }

              notifications.push(capture)
              notificationMap[capture.id] = capture

              if (cityCapture && cityCapture.con === 'Enter') {
                notifications.push(cityCapture)
                notificationMap[cityCapture.id] = cityCapture
              }
            }
          })

          store.dispatch(actions.wiretapStageEventMessage('Loaded capture notification data'))
          resolve({ notifications, notificationMap })
        })
      }
    })
  })
