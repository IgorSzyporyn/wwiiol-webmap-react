import * as React from 'react'
import { Marker } from 'react-google-maps'
import { connect } from 'react-redux'
import { IRootState } from 'reducer/state'
import { wiretap, SIDE, UNITLEVEL } from 'wiretap'
import { IChokePointMap } from 'wiretap/chokePoint'
import { IPosition } from 'wiretap/latlng'
import { IUnit, IUnitMap } from 'wiretap/unit'
import { IUnitLocation } from 'wiretap/unitLocation'

const windowClone: any = window

interface IZoomMarkers {
  allied: IUnitMarker[]
  axis: IUnitMarker[]
}

interface IZoomMarkerMap {
  [key: number]: IZoomMarkers
}

interface IUnitMarker extends IUnit {
  position: IPosition
}

interface IReducerProps {
  unitLocations?: IUnitLocation[]
  unitMap?: IUnitMap
  chokePointMap?: IChokePointMap
  zoom?: number
}

interface IState {
  unitMarkers: IZoomMarkerMap
}

class MarkerUnit extends React.Component<IReducerProps, IState> {
  public state: IState = {
    unitMarkers: {},
  }

  // tslint:enable object-literal-key-quotes

  public componentWillMount() {
    this.initUnitMarkers(this.props)
  }

  public componentWillReceiveProps(nextProps: IReducerProps) {
    this.initUnitMarkers(nextProps)
  }

  public render() {
    const { unitMarkers } = this.state
    const { zoom } = this.props
    let markers: IUnitMarker[] = []

    if (zoom && unitMarkers[zoom]) {
      const { allied, axis } = unitMarkers[zoom]
      markers = [...allied, ...axis]
    }

    return markers.map((marker) => {
      const { position, icon } = marker
      const scaledSize = new windowClone.google.maps.Size(20, 20)
      const url = `data:image/svg+xml;charset=UTF-8, ${encodeURIComponent(icon)}`
      const key = `marker-unit-${marker.id}`

      return (
        <Marker
          key={key}
          options={{
            icon: { scaledSize, url },
            position,
            zIndex: 900,
          }}
        />
      )
    })
  }

  private initUnitMarkers = (props: IReducerProps) => {
    const { MAX_ZOOM, MIN_ZOOM } = wiretap
    const unitMarkers: IZoomMarkerMap = {}

    for (let i = MIN_ZOOM; i <= MAX_ZOOM; i++) {
      const markers = this.createUnitMarkers(props, i)
      unitMarkers[i] = markers
    }

    this.setState({ unitMarkers })
  }

  private createUnitMarkers = (props: IReducerProps, zoom: number) => {
    const { getAllow } = this
    const { unitLocations, unitMap, chokePointMap } = props

    // Side Markers
    const allied: IUnitMarker[] = []
    const axis: IUnitMarker[] = []

    // Iterate all units and group them into side and side/branch arrays
    if (unitLocations && unitLocations.length && unitMap && chokePointMap) {
      unitLocations.forEach((unitLocation) => {
        const unit = unitMap[unitLocation.id]
        const chokePoint = chokePointMap[unitLocation.cp]

        if (chokePoint && unit) {
          const { position } = chokePoint
          const marker: IUnitMarker = { ...unit, position }
          const allow = getAllow(marker, zoom)

          if (allow) {
            switch (unit.side) {
              case SIDE.ALLIED:
                allied.push(marker)
                break

              case SIDE.AXIS:
                axis.push(marker)
                break

              default:
                break
            }
          }
        }
      })
    }

    return { allied, axis }
  }

  private getAllow = (marker: IUnitMarker, zoom: number) => {
    let allow = false

    // Only allow command and corps at minzoom
    allow = marker.level === (UNITLEVEL.COMMAND || UNITLEVEL.CORPS)

    return !!allow
  }
}

const mapStateToProps = (state: IRootState) => ({
  chokePointMap: state.wiretap.chokePointMap,
  unitLocations: state.wiretap.unitLocations,
  unitMap: state.wiretap.unitMap,
  zoom: state.map.zoom,
})

export default connect(mapStateToProps, null)(MarkerUnit)
