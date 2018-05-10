import ActionTypes from 'action/ActionTypes'
import ActionTypeKeys from 'action/ActionTypeKeys'
import { DeathListEnum } from 'enum/DeathList'

export interface IFilterState {
  deathsOverlay: DeathListEnum
  hotload: boolean
  ownershipOverlay: boolean
}

export const filterInitialState: IFilterState = {
  deathsOverlay: DeathListEnum.ONLY_ALLIES,
  hotload: true,
  ownershipOverlay: true,
}

export function filterReducer(state: IFilterState = filterInitialState, action: ActionTypes) {
  switch (action.type) {
    case ActionTypeKeys.FILTER_HOTLOAD:
      return {
        ...state,
        hotload: action.settings,
      }

    case ActionTypeKeys.FILTER_DEATHS_OVERLAY:
      return {
        ...state,
        deathsOverlay: action.settings,
      }

    case ActionTypeKeys.FILTER_OWNERSHIP_OVERLAY:
      return {
        ...state,
        ownershipOverlay: action.settings,
      }

    default:
      return state
  }
}
