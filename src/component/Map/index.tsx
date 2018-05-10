import ActionTypes from 'action/ActionTypes'
import { mapZoomUpdate } from 'action/map'
import MarkerCity from 'component/Marker/City'
import MarkerUnit from 'component/Marker/Unit'
import * as React from 'react'
import {
  GoogleMap,
  WithGoogleMapProps,
  WithScriptjsProps,
  withGoogleMap,
  withScriptjs,
} from 'react-google-maps'
import { Dispatch, connect } from 'react-redux'
import { cleanBright } from 'tools/googleMapsStyles'
import { wiretap } from 'wiretap'

interface IProps {
  onLoad: (map: any) => void
}

interface IActionProps {
  mapZoomUpdate?: (zoom: number) => ActionTypes
}

class Map extends React.Component<
  IProps & IActionProps & WithScriptjsProps & WithGoogleMapProps,
  {}
> {
  private map: any = null

  private mapInitialized: boolean = false

  public render() {
    return (
      <GoogleMap
        ref={(map) => {
          this.map = map
        }}
        onTilesLoaded={this.handleTilesLoaded}
        defaultZoom={wiretap.DEFAULT_ZOOM}
        defaultCenter={{ lat: 51, lng: 6 }}
        onZoomChanged={this.handleZoomChange}
        options={{
          mapTypeControl: false,
          maxZoom: wiretap.MAX_ZOOM,
          minZoom: wiretap.MIN_ZOOM,
          panControl: false,
          scaleControl: false,
          streetViewControl: false,
          styles: cleanBright,
          zoomControl: false,
        }}
      >
        <MarkerCity />
        <MarkerUnit />
      </GoogleMap>
    )
  }

  private handleMapLoaded = (map: any) => {
    const { onLoad } = this.props

    onLoad(map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED)
  }

  private handleTilesLoaded = () => {
    const { map, mapInitialized } = this

    if (map && !mapInitialized) {
      this.map = map
      this.handleMapLoaded(map)
      this.mapInitialized = true
    }
  }

  private handleZoomChange = () => {
    const { map } = this
    const { mapZoomUpdate } = this.props

    if (mapZoomUpdate) {
      const zoom = map.getZoom()
      mapZoomUpdate(zoom)
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>) => ({
  mapZoomUpdate: (zoom: number) => dispatch(mapZoomUpdate(zoom)),
})

export default withScriptjs(withGoogleMap(connect(null, mapDispatchToProps)(Map)))
