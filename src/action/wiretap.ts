import ActionTypeKeys from 'action/ActionTypeKeys'

/**
 * WiretapInitialized
 */

export interface IWiretapInitialized {
  readonly type: ActionTypeKeys.WIRETAP_STATUS_INITIALIZED
  readonly settings: boolean
}

export const wiretapInitialized = (settings: boolean): IWiretapInitialized => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STATUS_INITIALIZED,
  }
}

/**
 * WiretapLoading
 */

export interface IWiretapLoading {
  readonly type: ActionTypeKeys.WIRETAP_STATUS_LOADING
  readonly settings: boolean
}

export const wiretapLoading = (settings: boolean): IWiretapLoading => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STATUS_LOADING,
  }
}

/**
 * WiretapUpdating
 */

export interface IWiretapUpdating {
  readonly type: ActionTypeKeys.WIRETAP_STATUS_UPDATING
  readonly settings: boolean
}

export const wiretapUpdating = (settings: boolean): IWiretapUpdating => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STATUS_UPDATING,
  }
}

/**
 * WiretapOffline
 */

export interface IWiretapOffline {
  readonly type: ActionTypeKeys.WIRETAP_OFFLINE
  readonly settings: boolean
}

export const wiretapOffline = (settings: boolean): IWiretapOffline => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_OFFLINE,
  }
}

/**
 * WiretapUpdate
 */

export interface IWiretapUpdate {
  readonly type: ActionTypeKeys.WIRETAP_UPDATE
  readonly settings: any
}

export const wiretapUpdate = (settings: any): IWiretapUpdate => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_UPDATE,
  }
}

/**
 * WiretapStaticData
 */

export interface IWiretapStaticData {
  readonly type: ActionTypeKeys.WIRETAP_STATICDATA
  readonly settings: any
}

export const wiretapStaticData = (settings: any): IWiretapStaticData => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STATICDATA,
  }
}

/**
 * WiretapDynamicData
 */

export interface IWiretapDynamicData {
  readonly type: ActionTypeKeys.WIRETAP_DYNAMICDATA
  readonly settings: any
}

export const wiretapDynamicData = (settings: any): IWiretapDynamicData => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_DYNAMICDATA,
  }
}

/**
 * WiretapMarkerData
 */

export interface IActionWiretapMarkerData {
  readonly type: ActionTypeKeys.WIRETAP_MARKERDATA
  readonly settings: any
}

export const wiretapMarkerData = (settings: any): IActionWiretapMarkerData => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_MARKERDATA,
  }
}

/**
 * WiretapNotification
 */

export interface IActionWiretapNotification {
  readonly type: ActionTypeKeys.WIRETAP_NOTIFICATION
  readonly settings: any
}

export const wiretapNotification = (settings: any): IActionWiretapNotification => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_NOTIFICATION,
  }
}

/**
 * WiretapNotificationCount
 */

export interface IActionWiretapNotificationCount {
  readonly type: ActionTypeKeys.WIRETAP_NOTIFICATION_COUNT
  readonly settings: number
}

export const wiretapNotificationCount = (settings: number): IActionWiretapNotificationCount => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_NOTIFICATION_COUNT,
  }
}

/**
 * WiretapFireBases
 */

export interface IActionWiretapFireBases {
  readonly type: ActionTypeKeys.WIRETAP_FIREBASES
  readonly settings: any
}

export const wiretapFireBases = (settings: any): IActionWiretapFireBases => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_FIREBASES,
  }
}

/**
 * WiretapStageMessage
 */

export interface IWiretapStageMessage {
  readonly type: ActionTypeKeys.WIRETAP_STAGE_MESSAGE
  readonly settings: string
}

export const wiretapStageMessage = (settings: string): IWiretapStageMessage => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STAGE_MESSAGE,
  }
}

/**
 * WiretapStageEventMessage
 */

export interface IWiretapStageEventMessage {
  readonly type: ActionTypeKeys.WIRETAP_STAGE_EVENT_MESSAGE
  readonly settings: string
}

export const wiretapStageEventMessage = (settings: string): IWiretapStageEventMessage => {
  return {
    settings,
    type: ActionTypeKeys.WIRETAP_STAGE_EVENT_MESSAGE,
  }
}
