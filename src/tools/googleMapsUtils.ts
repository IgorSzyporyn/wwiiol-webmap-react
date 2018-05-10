/* eslint-disable no-use-before-define, no-restricted-properties, no-mixed-operators */

interface ICoords {
  x: number
  y: number
}
export const distance = ({ x: x0, y: y0 }: ICoords, { x: x1, y: y1 }: ICoords) =>
  Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2))

interface ITileBounds {
  bounds: any
  tileExpand: number
  zoom: number
}
export const getTileBounds = ({ bounds, tileExpand = 0, zoom }: ITileBounds) => {
  const { nw, se } = bounds
  const exp = tileExpand
  const from = vecAdd(latLng2Tile(nw, zoom), { x: -exp, y: -exp })
  const to = vecAdd(latLng2Tile(se, zoom), { x: exp, y: exp })
  return [from, to]
}

interface ILatLng {
  lat: number
  lng: number
}
export const latLng2Scaled = ({ lat, lng }: ILatLng, zoom: number) => {
  const worldCoords = latLng2World({ lat, lng })
  const scale = Math.pow(2, zoom)
  return {
    x: worldCoords.x * scale,
    y: worldCoords.y * scale,
  }
}

export const latLng2Tile = ({ lat, lng }: ILatLng, zoom: number) => {
  const { x, y } = latLng2Scaled({ lat, lng }, zoom)
  return {
    x: Math.floor(x),
    y: Math.floor(y),
  }
}

export const latLng2World = ({ lat, lng }: ILatLng) => {
  const sin = Math.sin(lat * Math.PI / 180)
  const x = lng / 360 + 0.5
  let y = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI
  if (y < 0) {
    y = 0
  } else if (y > 1) {
    y = 1
  }
  return { x, y }
}

export const tile2LatLng = ({ x, y }: ICoords, zoom: number) => {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom)
  return {
    lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
    lng: x / Math.pow(2, zoom) * 360 - 180,
  }
}

export const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2),
})

export const vecAdd = (v: ICoords, a: ICoords) => ({ x: v.x + a.x, y: v.y + a.y })
export const vecMul = (v: ICoords, a: number) => ({ x: v.x * a, y: v.y * a })
/* eslint-enable no-use-before-define, no-restricted-properties, no-mixed-operators */

const rad = (x: number) => {
  return x * Math.PI / 180
}

export const getDistance = (p1: IPosition, p2: IPosition) => {
  const R = 6378137 // Earth’s mean radius in meter
  const dLat = rad(p2.lat - p1.lat)
  const dLong = rad(p2.lng - p1.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d // returns the distance in meter
}

export interface IPosition {
  lat: number
  lng: number
}

export interface IBoundary {
  e: number
  n: number
  s: number
  w: number
}

export const getBoundaryPolygons = (positions: IPosition[]) => {
  const nCoords = [...positions].sort((a, b) => b.lat - a.lat)

  let eOffset = 0
  let wOffset = 0

  const wFoundCoords: IPosition[] = []
  const eFoundCoords: IPosition[] = [nCoords[0]]

  let eFound
  let wFound

  do {
    // East
    eFound = false
    let eFallback = 0
    for (let i = eOffset + 1; i < nCoords.length; i++) {
      if (nCoords[i].lng >= nCoords[eOffset].lng) {
        // found
        eOffset = i
        eFound = true
        break
      }

      if (!eFallback || nCoords[i].lng > nCoords[eFallback].lng) {
        eFallback = i
      }
    }

    if (!eFound && eFallback) {
      eOffset = eFallback
      eFound = true
    }

    if (eFound) {
      eFoundCoords.push(nCoords[eOffset])
    }

    // West
    wFound = false
    let wFallback = 0
    for (let i = wOffset + 1; i < nCoords.length; i++) {
      if (nCoords[i].lng >= nCoords[wOffset].lng) {
        // found
        wOffset = i
        wFound = true
        break
      }

      if (!wFallback || nCoords[i].lng < nCoords[wFallback].lng) {
        wFallback = i
      }
    }

    if (!wFound && wFallback) {
      wOffset = wFallback
      wFound = true
    }

    if (wFound) {
      wFoundCoords.push(nCoords[wOffset])
    }
  } while (eFound || wFound)

  return eFoundCoords.concat(wFoundCoords.slice(0, -1).reverse())
}
