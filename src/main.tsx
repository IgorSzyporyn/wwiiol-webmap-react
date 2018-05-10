import App from 'container/App'
import { createBrowserHistory } from 'history'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import blue from 'material-ui/colors/blue'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from 'store'
import { wiretap } from 'wiretap'
import './style/main.scss'

// prepare store
const history = createBrowserHistory()
const store = configureStore(history)

// Check if DEV mode - and load data from localStorage

// Start loading wiretap API data
wiretap.init(store)

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
})

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root'),
)
