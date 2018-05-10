import * as actions from 'action/wiretap'
import request from 'then-request'
import { parseString } from 'xml2js'
import { wiretap } from './index'

export interface IChokePointLinkResponse {
  $: IChokePointLinkRaw
}

export interface IChokePointLinkRaw {
  fb: string
  lcp: string
  ldep: string
  rcp: string
  rdep: string
}

// tslint:disable-next-line no-empty-interface
export interface IChokePointLink extends IChokePointLinkRaw {}

export const fetchChokePointLinks = (store: any) =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XML}/links.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        store.dispatch(actions.wiretapStageEventMessage('Failed city link data'))
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const chokePointLinks: IChokePointLink[] = []

          result.links.link.forEach(($link: IChokePointLinkResponse) =>
            chokePointLinks.push($link.$),
          )

          store.dispatch(actions.wiretapStageEventMessage('Loaded city link data'))
          resolve({ chokePointLinks })
        })
      }
    })
  })
