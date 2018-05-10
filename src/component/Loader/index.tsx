import Card, { CardContent, CardMedia } from 'material-ui/Card'
import * as React from 'react'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { IRootState } from 'reducer/state'
import Typography from 'material-ui/Typography'
import './index.scss'

interface IProps {
  initialized?: boolean
  stageEventMessage?: string
  stageMessage?: string
}

class Loader extends React.Component<IProps, {}> {
  public render() {
    return (
      <CSSTransition
        in={!this.props.initialized}
        timeout={275}
        classNames="FadeOut"
        unmountOnExit={true}
      >
        <div className="Loader">
          <div className="Loader__background" />
          <Card className="Loader__card">
            <CardMedia src="dummy.png" className="Loader__card-media" />
            <CardContent className="Loader__card-content">
              <Typography className="Loader__card-headline" component="h1" variant="headline">
                {this.props.stageMessage}
              </Typography>
              <Typography className="Loader__card-subheading" component="h2" variant="subheading">
                {this.props.initialized ? 'Interface & Map Ready' : this.props.stageEventMessage}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </CSSTransition>
    )
  }
}

const mapStateToProps = (state: IRootState) => ({
  initialized: state.wiretap.initialized,
  stageEventMessage: state.wiretap.stageEventMessage,
  stageMessage: state.wiretap.stageMessage,
})

export default connect(mapStateToProps, null)(Loader)
