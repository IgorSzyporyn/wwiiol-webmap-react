import { IAttackObjectiveNotification } from './attackObjectiveNotification'
import { ICaptureNotification } from './captureNotification'

export type INotification = IAttackObjectiveNotification | ICaptureNotification

export interface INotificationMap {
  [key: string]: INotification
}
