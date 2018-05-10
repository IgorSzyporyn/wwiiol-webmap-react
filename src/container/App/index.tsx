import * as React from 'react'
import Map from 'component/Map'
import Loader from 'component/Loader'
import AppInterface from 'container/AppInterface'
import './index.scss'

class App extends React.Component<{}, {}> {
  public render() {
    /* tslint:disable max-line-length */
    return (
      <div className="App">
        <div className="App__map">
          <Map
            containerElement={<div style={{ height: `100%` }} />}
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDkrrRqeUXM8C--BEfoXeLoEYBwV3YOjYQ&libraries=visualization"
            loadingElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            onLoad={this.handleMapLoad}
          />
        </div>
        <AppInterface />
        <Loader />
      </div>
    )
    /* tslint:enable max-line-length */
  }

  private handleMapLoad = (map: any) => {
    const windowClone: any = window
    windowClone._gmap = map
  }
}

export default App
