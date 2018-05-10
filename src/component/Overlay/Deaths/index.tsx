import * as React from 'react'
import { connect } from 'react-redux'
import { IRootState } from 'reducer/state'
import { DeathListEnum } from 'enum/DeathList'
import { IDeath } from 'wiretap/death'
import { wiretap } from 'wiretap'
import deathMapGradients from 'tools/deathMapGradients'

const windowClone: any = window

interface IReducerProps {
  deathsOverlay?: DeathListEnum
  deaths?: IDeath[]
  deathsAllies?: IDeath[]
  deathsAxis?: IDeath[]
}

class Deaths extends React.Component<IReducerProps, {}> {
  public static defaultProps: IReducerProps = {
    deaths: [],
    deathsAllies: [],
    deathsAxis: [],
    deathsOverlay: DeathListEnum.NONE,
  }

  public deathListHeatMapLayer: google.maps.visualization.HeatmapLayer[] = []

  public interval: any = null

  public componentWillMount() {
    this.initDeathsOverlay(this.props)
  }

  public componentWillReceiveProps(nextProps: IReducerProps) {
    this.initDeathsOverlay(nextProps)
  }

  public shouldComponentUpdate() {
    return false
  }

  public render() {
    return <div style={{ display: 'none' }} />
  }

  private initDeathsOverlay = (props: IReducerProps) => {
    const { deathListHeatMapLayer, interval } = this

    if (deathListHeatMapLayer) {
      deathListHeatMapLayer.forEach((layer: any) => {
        layer.setMap(null)
      })
      this.deathListHeatMapLayer = []
    }

    if (props.deathsOverlay !== DeathListEnum.NONE) {
      if (props.deaths && !props.deaths.length) {
        wiretap.updateDeathList()
      } else if (windowClone._gmap) {
        this.doDeathList(props)
        clearInterval(interval)
      } else {
        this.interval = setInterval(() => {
          if (windowClone._gmap) {
            this.doDeathList(props)
            clearInterval(interval)
          }
        }, 50)
      }
    }
  }

  private layerRenderer = (deaths: IDeath[], grads: any[] | null, xopts: any = {}) => {
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

  private doDeathList = (props: any) => {
    switch (props.deathFilter) {
      case DeathListEnum.ONLY_AXIS:
        this.deathListHeatMapLayer = [
          this.layerRenderer(props.deathsAxis, deathMapGradients.neutral),
        ]
        break
      case DeathListEnum.ONLY_ALLIES:
        this.deathListHeatMapLayer = [
          this.layerRenderer(props.deathsAllies, deathMapGradients.neutral),
        ]
        break
      case DeathListEnum.COMBINED:
        this.deathListHeatMapLayer = [this.layerRenderer(props.deaths, deathMapGradients.neutral)]
        break
      default:
        break
    }
  }
}

const mapStateToProps = (state: IRootState) => ({
  deaths: state.wiretap.deaths,
  deathsAllies: state.wiretap.deathsAllies,
  deathsAxis: state.wiretap.deathsAxis,
  deathsOverlay: state.filter.deathsOverlay,
})

export default connect(mapStateToProps, null)(Deaths)
