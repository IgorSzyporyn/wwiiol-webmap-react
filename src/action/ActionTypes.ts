// Import application Action Definitions
import {
  IWiretapInitialized,
  IWiretapLoading,
  IWiretapUpdating,
  IWiretapOffline,
  IWiretapUpdate,
  IWiretapStaticData,
  IWiretapDynamicData,
  IActionWiretapMarkerData,
  IActionWiretapNotification,
  IActionWiretapNotificationCount,
  IActionWiretapFireBases,
  IWiretapStageMessage,
  IWiretapStageEventMessage,
} from 'action/wiretap'

import { IMapZoomUpdate } from 'action/map'

import { IFilterHotload, IFilterDeathsOverlay, IFilterOwnershipOverlay } from 'action/filter'

// Finally we can declare the ActionTypes
type ActionTypes =
  | IWiretapInitialized
  | IWiretapLoading
  | IWiretapUpdating
  | IWiretapOffline
  | IWiretapUpdate
  | IWiretapStaticData
  | IWiretapDynamicData
  | IActionWiretapMarkerData
  | IActionWiretapNotification
  | IActionWiretapNotificationCount
  | IActionWiretapFireBases
  | IWiretapStageMessage
  | IWiretapStageEventMessage
  | IMapZoomUpdate
  | IFilterHotload
  | IFilterDeathsOverlay
  | IFilterOwnershipOverlay

export default ActionTypes
