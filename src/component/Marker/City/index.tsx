import * as React from 'react'
import { Marker } from 'react-google-maps'
import { connect } from 'react-redux'
import { IRootState } from 'reducer/state'
import { IChokePointMarker, IChokePointMarkerMap } from 'wiretap/chokePointMarker'
import { wiretap } from 'wiretap'
import { isEqual } from 'tools/isEqual'

const windowClone: any = window

enum ChokePointScale {
  METROPOL = 20,
  HUGE = 16,
  LARGE = 8,
  SMALL = 1,
}

interface IZoomScale {
  [key: number]: ChokePointScale
}

const zoomScale: IZoomScale = {
  7: ChokePointScale.METROPOL,
  8: ChokePointScale.HUGE,
  9: ChokePointScale.LARGE,
}

interface IReducerProps {
  chokePointMarkers?: IChokePointMarker[]
  chokePointMarkerMap?: IChokePointMarkerMap
  zoom?: number
}

interface IState {
  cityMarkers: IChokePointMarker[]
}

class MarkerCity extends React.Component<IReducerProps, IState> {
  public state: IState = {
    cityMarkers: [],
  }

  public markers: any = {}
  public maxSize: number = 0
  public minSize: number = 0

  public componentWillMount() {
    this.initCityMarkers(this.props)
  }

  public componentWillReceiveProps(nextProps: IReducerProps) {
    const { props } = this

    // If props in chokePointMarker has changed - then we to re-init markers
    if (!isEqual(props.chokePointMarkerMap, nextProps.chokePointMarkerMap)) {
      this.initCityMarkers(nextProps)
    }

    // If zoom changed - then use the ref map to setShow
    if (props.zoom !== nextProps.zoom) {
      this.handleZoom(nextProps.zoom)
    }
  }

  public shouldComponentUpdate(nextProps: IReducerProps) {
    const { props } = this
    const shouldUpdate = !isEqual(props.chokePointMarkers, nextProps.chokePointMarkers)

    return shouldUpdate
  }

  public render() {
    const self = this
    const { zoom = wiretap.DEFAULT_ZOOM } = this.props
    const { cityMarkers } = this.state

    // Reset the REF object to hold all created <Marker />
    this.markers = {}

    return cityMarkers.map((marker) => {
      const { id, position } = marker
      const key = `marker-city-${id}`
      const scaledSize = new windowClone.google.maps.Size(1, 1)
      const fontSize = self.getFontSize(marker.size)
      const url =
        // tslint:disable-next-line max-line-length
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      const label: google.maps.MarkerLabel = {
        color: 'rgba(0,0,0,0.62)',
        fontFamily: 'Roboto',
        fontSize: `${fontSize}px`,
        text: marker.title,
      }

      return (
        <Marker
          icon={{ size: scaledSize, scaledSize, url }}
          key={key}
          label={label}
          ref={(m: any) => {
            const gmarker = m.state.__SECRET_MARKER_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            const allow = self.getAllow(marker, zoom)

            self.markers[id] = gmarker

            if (!allow) {
              gmarker.setMap(null)
            }
          }}
          position={position}
        />
      )
    })
  }

  private handleZoom = (zoom: number = wiretap.DEFAULT_ZOOM) => {
    const { markers } = this
    const { chokePointMarkerMap = {} } = this.props

    Object.keys(markers).forEach((key: string) => {
      const chokePointMarker = chokePointMarkerMap[key]
      const googleMarker = markers[key]
      const googleMap = windowClone._gmap
      const allow = this.getAllow(chokePointMarker, zoom)

      if (allow) {
        googleMarker.setMap(googleMap)
      } else {
        googleMarker.setMap(null)
      }
    })
  }

  private getAllow = (marker: IChokePointMarker, zoom: number) => {
    const { features } = marker
    let allow = false

    if (zoomScale[zoom] <= marker.size) {
      allow = true
    }

    if (features.industry && zoom > 7) {
      allow = true
    }

    if (features.hq && zoom > 7) {
      allow = true
    }

    if (features.frontline && zoom > 8) {
      allow = true
    }

    return allow
  }

  private getFontSize = (size: number) => {
    const { maxSize } = this

    return (1 + size / maxSize) * 9
  }

  private initCityMarkers = (props: IReducerProps) => {
    const cityMarkers = this.createCityMarkers(props)

    this.setState({ cityMarkers })
  }

  private createCityMarkers = (props: IReducerProps) => {
    const self = this
    const { chokePointMarkers = [], zoom = wiretap.DEFAULT_ZOOM } = props

    const cityMarkers = chokePointMarkers.map((chokePointMarker) => {
      const { maxSize, minSize } = self
      const { size } = chokePointMarker

      self.maxSize = maxSize < size ? size : maxSize
      self.minSize = minSize > size ? size : minSize

      return {
        ...chokePointMarker,
        allow: zoomScale[zoom] <= size,
      }
    })

    return cityMarkers
  }
}

const mapStateToProps = (state: IRootState) => ({
  chokePointMarkerMap: state.wiretap.chokePointMarkerMap,
  chokePointMarkers: state.wiretap.chokePointMarkers,
  zoom: state.map.zoom,
})

export default connect(mapStateToProps, null)(MarkerCity)
