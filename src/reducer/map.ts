import ActionTypes from 'action/ActionTypes'
import ActionTypeKeys from 'action/ActionTypeKeys'
import { wiretap } from 'wiretap'

export interface IMapState {
  zoom: number
}

export const mapInitialState: IMapState = {
  zoom: wiretap.DEFAULT_ZOOM,
}

export function mapReducer(state: IMapState = mapInitialState, action: ActionTypes) {
  switch (action.type) {
    case ActionTypeKeys.MAP_ZOOM_UPDATE:
      return {
        ...state,
        zoom: action.settings,
      }

    default:
      return state
  }
}
