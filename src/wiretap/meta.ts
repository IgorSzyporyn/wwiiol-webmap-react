import * as actions from 'action/wiretap'
import load from 'load-script'
import { wiretap } from './index'

export const fetchWiretapMeta = (store: any) =>
  new Promise((resolve) => {
    load(`${wiretap.HOST}/wwiiol-meta.js`, (err: any) => {
      if (err) {
        store.dispatch(actions.wiretapStageEventMessage('Failed loading meta data'))
        resolve(false)
      } else {
        store.dispatch(actions.wiretapStageEventMessage('Loaded meta data'))
        resolve(true)
      }
    })
  })
