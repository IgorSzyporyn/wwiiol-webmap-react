import ActionTypeKeys from 'action/ActionTypeKeys'

/**
 * MapZoomUpdate
 */

export interface IMapZoomUpdate {
  readonly type: ActionTypeKeys.MAP_ZOOM_UPDATE
  readonly settings: number
}

export const mapZoomUpdate = (settings: number): IMapZoomUpdate => {
  return {
    settings,
    type: ActionTypeKeys.MAP_ZOOM_UPDATE,
  }
}
