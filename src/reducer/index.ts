import { routerReducer } from 'react-router-redux'
import { mapReducer } from 'reducer/map'
import { IRootState } from 'reducer/state'
import { wiretapReducer } from 'reducer/wiretap'
import { combineReducers } from 'redux'
import { filterReducer } from 'reducer/filter'

// NOTE: current type definition of Reducer in 'react-router-redux' and 'redux-actions' module
// doesn't go well with redux@4
export const rootReducer = combineReducers<IRootState>({
  filter: filterReducer as any,
  map: mapReducer as any,
  router: routerReducer as any,
  wiretap: wiretapReducer as any,
})
