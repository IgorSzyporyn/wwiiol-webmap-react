import { routerMiddleware } from 'react-router-redux'
import { rootReducer } from 'reducer'
import ActionTypes from 'action/ActionTypes'
import { IRootState, initialState } from 'reducer/state'
import { applyMiddleware, compose, createStore } from 'redux'
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'
import thunkMiddleware from 'redux-thunk'

// @TODO: Again - do not allow any!!
const configureStoreDev = (history: any) => {
  const middlewares = [
    // Add other middleware on this line...

    // Redux middleware that spits an error on you when you try to mutate your state either inside
    // a dispatch or between dispatches.
    reduxImmutableStateInvariant(),

    // thunk middleware can also accept an extra argument to be passed to each thunk action
    // https://github.com/gaearon/redux-thunk#injecting-a-custom-argument
    thunkMiddleware,

    // Connected React Router middleware
    routerMiddleware(history)
  ]

  // add support for Redux dev tools
  const composeEnhancers: any = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  return createStore<IRootState, ActionTypes, {}, {}>(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}

export default configureStoreDev
