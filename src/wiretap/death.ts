import request from 'then-request'
import { parseString } from 'xml2js'
import { wiretap } from './index'

export interface IDeathResponse {
  $: IDeathRaw
}

export interface IDeathRaw {
  x: string
  y: string
  ad?: string
  ax?: string
}

export interface IDeath {
  lat: number
  lng: number
  weight: number
}

const windowClone: any = window

export const fetchDeaths = () =>
  new Promise((resolve) => {
    request('GET', `${wiretap.XML}/deathmap.24hsummary.xml`, {
      timeout: wiretap.TIMEOUT,
    }).done((res) => {
      if (res.statusCode === 0) {
        resolve(false)
      } else {
        const body = res.getBody()

        parseString(body, (err, result) => {
          const deaths: IDeath[] = []
          const deathsAllies: IDeath[] = []
          const deathsAxis: IDeath[] = []

          if (result.deathmap && result.deathmap.r) {
            result.deathmap.r.forEach((xcoord: IDeathResponse) => {
              const coord = xcoord.$
              const { glat, glon: glng } = windowClone.getLatLonFromMeterXY(
                // The Math.random() is to make the coords
                // feel more natural
                parseInt(coord.x, 10) + (Math.random() * 800 - 400),
                parseInt(coord.y, 10) + (Math.random() * 800 - 400),
              )

              if (coord.ad && coord.ad !== '0') {
                const adCoord: IDeath = {
                  lat: glat,
                  lng: glng,
                  weight: 10 + Math.log(parseInt(coord.ad, 10)),
                }
                deathsAllies.push(adCoord)
                deaths.push(adCoord)
              }

              if (coord.ax && coord.ax !== '0') {
                const axCoord: IDeath = {
                  lat: glat,
                  lng: glng,
                  weight: 10 + Math.log(parseInt(coord.ax, 10)),
                }
                deathsAxis.push(axCoord)
                deaths.push(axCoord)
              }
            })
          }

          resolve({ deaths, deathsAllies, deathsAxis })
        })
      }
    })
  })
