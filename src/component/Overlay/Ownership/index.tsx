import * as React from 'react'
import { connect } from 'react-redux'
import { IRootState } from 'reducer/state'
import { IPosition } from 'wiretap/latlng'

const windowClone: any = window

interface IReducerProps {
  ownershipOverlay?: number
  boundariesAllies: IPosition[]
  boundariesAxis: IPosition[]
}

interface IPolygonMap {
  allied: google.maps.Polygon | null
  axis: google.maps.Polygon | null
}

class Ownership extends React.Component<IReducerProps, {}> {
  public polygon: IPolygonMap = {
    allied: null,
    axis: null,
  }

  public componentWillMount() {
    this.initOwnershipOverlay(this.props)
  }

  public componentWillReceiveProps(nextProps: IReducerProps) {
    this.initOwnershipOverlay(nextProps)
  }

  public shouldComponentUpdate() {
    return false
  }

  public render() {
    return <div style={{ display: 'none' }} />
  }

  private initOwnershipOverlay = (props: IReducerProps) => {
    const { boundariesAllies, boundariesAxis } = props
    const googleMap = windowClone._gmap
    const allow = this.getAllow()

    const allied = new google.maps.Polygon({
      fillColor: '#00FF00',
      fillOpacity: 0.35,
      paths: boundariesAllies,
      strokeColor: '#00FF00',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    })

    const axis = new google.maps.Polygon({
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      paths: boundariesAxis,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    })

    this.polygon = { allied, axis }

    if (allow) {
      allied.setMap(googleMap)
      axis.setMap(googleMap)
    } else {
      allied.setMap(null)
      axis.setMap(null)
    }
  }

  private getAllow = () => {
    const allow = true

    return allow
  }
}

const mapStateToProps = (state: IRootState) => ({
  boundariesAllies: state.wiretap.boundariesAllies,
  boundariesAxis: state.wiretap.boundariesAxis,
  ownershipOverlay: state.filter.ownershipOverlay,
})

export default connect(mapStateToProps, null)(Ownership)
