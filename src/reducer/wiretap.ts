import ActionTypeKeys from 'action/ActionTypeKeys'
import ActionTypes from 'action/ActionTypes'
import { IAttackObjective, IAttackObjectiveMap } from 'wiretap/attackObjective'
import { ICapture, ICaptureMap } from 'wiretap/capture'
import { IChokePoint, IChokePointMap } from 'wiretap/chokePoint'
import { IChokePointLink } from 'wiretap/chokePointLink'
import { IChokePointMarker, IChokePointMarkerMap } from 'wiretap/chokePointMarker'
import { IChokePointState, IChokePointStateMap } from 'wiretap/chokePointState'
import { IDeath } from 'wiretap/death'
import { IFacility, IFacilityMap } from 'wiretap/facility'
import { IFacilityState, IFacilityStateMap } from 'wiretap/facilityState'
import { IFireBase, IFireBaseMap } from 'wiretap/fireBase'
import { IFireBaseMarker, IFireBaseMarkerMap } from 'wiretap/fireBaseMarker'
import { INotification, INotificationMap } from 'wiretap/notification'
import { IUnit, IUnitMap } from 'wiretap/unit'
import { IUnitLocation, IUnitLocationMap } from 'wiretap/unitLocation'
import { IUnitMove, IUnitMoveMap } from 'wiretap/unitMove'

export interface IWiretapState {
  attackMarker: any[]
  attackObjectiveMap: IAttackObjectiveMap
  attackObjectives: IAttackObjective[]
  boundariesAllies: any[]
  boundariesAxis: any[]
  captureMap: ICaptureMap
  captures: ICapture[]
  chokePointLinks: IChokePointLink[]
  chokePointMap: IChokePointMap
  chokePointMarkerMap: IChokePointMarkerMap
  chokePointMarkers: IChokePointMarker[]
  chokePointStateMap: IChokePointStateMap
  chokePointStates: IChokePointState[]
  chokePoints: IChokePoint[]
  deaths: IDeath[]
  deathsAllies: IDeath[]
  deathsAxis: IDeath[]
  facilities: IFacility[]
  facilityMap: IFacilityMap
  facilityStateMap: IFacilityStateMap
  facilityStates: IFacilityState[]
  fireBaseMap: IFireBaseMap
  fireBaseMarkerMap: IFireBaseMarkerMap
  fireBaseMarkers: IFireBaseMarker[]
  fireBases: IFireBase[]
  initialized: boolean
  loading: boolean
  notificationCount: 0
  notificationMap: INotificationMap
  notifications: INotification[]
  offline: boolean
  stageEventMessage: string
  stageMessage: string
  unitLocationMap: IUnitLocationMap
  unitLocations?: IUnitLocation[]
  unitMap: IUnitMap
  unitMoveMap: IUnitMoveMap
  unitMoves: IUnitMove[]
  units: IUnit[]
  updating: boolean
}

export const wiretapInitialState: IWiretapState = {
  attackMarker: [],
  attackObjectiveMap: {},
  attackObjectives: [],
  boundariesAllies: [],
  boundariesAxis: [],
  captureMap: {},
  captures: [],
  chokePointLinks: [],
  chokePointMap: {},
  chokePointMarkerMap: {},
  chokePointMarkers: [],
  chokePointStateMap: {},
  chokePointStates: [],
  chokePoints: [],
  deaths: [],
  deathsAllies: [],
  deathsAxis: [],
  facilities: [],
  facilityMap: {},
  facilityStateMap: {},
  facilityStates: [],
  fireBaseMap: {},
  fireBaseMarkerMap: {},
  fireBaseMarkers: [],
  fireBases: [],
  initialized: false,
  loading: false,
  notificationCount: 0,
  notificationMap: {},
  notifications: [],
  offline: false,
  stageEventMessage: '',
  stageMessage: '',
  unitLocationMap: {},
  unitLocations: [],
  unitMap: {},
  unitMoveMap: {},
  unitMoves: [],
  units: [],
  updating: false,
}

export function wiretapReducer(state: IWiretapState = wiretapInitialState, action: ActionTypes) {
  switch (action.type) {
    case ActionTypeKeys.WIRETAP_STATUS_INITIALIZED:
      return {
        ...state,
        initialized: action.settings,
      }

    case ActionTypeKeys.WIRETAP_STATUS_LOADING:
      return {
        ...state,
        loading: action.settings,
      }

    case ActionTypeKeys.WIRETAP_STATUS_UPDATING:
      return {
        ...state,
        updating: action.settings,
      }

    case ActionTypeKeys.WIRETAP_OFFLINE:
      return {
        ...state,
        offline: action.settings,
      }

    case ActionTypeKeys.WIRETAP_UPDATE:
      return {
        ...state,
        ...action.settings,
      }

    case ActionTypeKeys.WIRETAP_STATICDATA:
      return {
        ...state,
        ...action.settings,
      }

    case ActionTypeKeys.WIRETAP_DYNAMICDATA:
      return {
        ...state,
        ...action.settings,
      }

    case ActionTypeKeys.WIRETAP_MARKERDATA:
      return {
        ...state,
        ...action.settings,
      }

    case ActionTypeKeys.WIRETAP_NOTIFICATION:
      return {
        ...state,
        notificationCount: action.settings.notificationCount,
        notificationMap: {
          ...state.notificationMap,
          ...action.settings.notificationMap,
        },
        notifications: [...action.settings.notifications, ...state.notifications],
      }

    case ActionTypeKeys.WIRETAP_NOTIFICATION_COUNT:
      return {
        ...state,
        notificationCount: action.settings,
      }

    case ActionTypeKeys.WIRETAP_FIREBASES:
      return {
        ...state,
        fireBaseMap: action.settings.fireBaseMap,
        fireBases: action.settings.fireBases,
      }

    case ActionTypeKeys.WIRETAP_STAGE_MESSAGE:
      return {
        ...state,
        stageMessage: action.settings,
      }

    case ActionTypeKeys.WIRETAP_STAGE_EVENT_MESSAGE:
      return {
        ...state,
        stageEventMessage: action.settings,
      }

    default:
      return state
  }
}
