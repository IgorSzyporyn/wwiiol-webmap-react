import { RouterState } from 'react-router-redux'
import { IFilterState, filterInitialState } from 'reducer/filter'
import { IMapState, mapInitialState } from 'reducer/map'
import { IWiretapState, wiretapInitialState } from 'reducer/wiretap'

export interface IRootState {
  router: RouterState
  wiretap: IWiretapState
  map: IMapState
  filter: IFilterState
}

export const initialState: IRootState = {
  filter: filterInitialState,
  map: mapInitialState,
  router: { location: null },
  wiretap: wiretapInitialState,
}
