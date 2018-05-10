// tslint:disable variable-name
import { DeathListEnum } from 'enum/DeathList'
import deathMapGradients from 'tools/deathMapGradients'
import { wiretap } from 'wiretap'
import { IDeath } from 'wiretap/death'

const windowClone: any = window

let interval: any = null

let __deathListHeatMapLayer: any = null

const __renderer = (deaths: IDeath[], grads: any[] | null, xopts: any = {}) => {
  const gmap = windowClone._gmap

  return new google.maps.visualization.HeatmapLayer({
    data: deaths.map((x) => ({
      location: new google.maps.LatLng(x.lat, x.lng),
      weight: x.weight,
    })),
    gradient: grads,
    map: gmap,
    radius: 20,
    ...xopts,
  })
}

const doDeathList = (props: any) => {
  switch (props.deathFilter) {
    case DeathListEnum.ONLY_AXIS:
      __deathListHeatMapLayer = [__renderer(props.deathsAxis, deathMapGradients.neutral)]
      break
    case DeathListEnum.ONLY_ALLIES:
      __deathListHeatMapLayer = [__renderer(props.deathsAllies, deathMapGradients.neutral)]
      break
    case DeathListEnum.COMBINED:
      __deathListHeatMapLayer = [__renderer(props.deaths, deathMapGradients.neutral)]
      break
    default:
      break
  }
}

export const renderDeathsOverlay = (props: any) => {
  if (__deathListHeatMapLayer) {
    __deathListHeatMapLayer.forEach((layer: any) => {
      layer.setMap(null)
    })
    __deathListHeatMapLayer = []
  }

  if (props.deathFilter !== DeathListEnum.NONE) {
    if (!props.death.length) {
      wiretap.updateDeathList()
    } else if (windowClone._gmap) {
      doDeathList(props)
      clearInterval(interval)
    } else {
      interval = setInterval(() => {
        if (windowClone._gmap) {
          doDeathList(props)
          clearInterval(interval)
        }
      }, 50)
    }
  }
}

// tslint:enable variable-name
