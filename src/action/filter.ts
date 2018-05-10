import ActionTypeKeys from 'action/ActionTypeKeys'

/**
 * FilterHotload
 */

export interface IFilterHotload {
  readonly type: ActionTypeKeys.FILTER_HOTLOAD
  readonly settings: boolean
}

export const filterHotload = (settings: boolean): IFilterHotload => {
  return {
    settings,
    type: ActionTypeKeys.FILTER_HOTLOAD,
  }
}

/**
 * FilterDeathsOverlay
 */

export interface IFilterDeathsOverlay {
  readonly type: ActionTypeKeys.FILTER_DEATHS_OVERLAY
  readonly settings: string
}

export const filterDeathsOverlay = (settings: string): IFilterDeathsOverlay => {
  return {
    settings,
    type: ActionTypeKeys.FILTER_DEATHS_OVERLAY,
  }
}

/**
 * FilterOwnershipOverlay
 */

export interface IFilterOwnershipOverlay {
  readonly type: ActionTypeKeys.FILTER_OWNERSHIP_OVERLAY
  readonly settings: boolean
}

export const filterOwnershipOverlay = (settings: boolean): IFilterOwnershipOverlay => {
  return {
    settings,
    type: ActionTypeKeys.FILTER_OWNERSHIP_OVERLAY,
  }
}
