import { IRootState } from 'reducer/state'
import { IChokePoint } from './chokePoint'
import { IPosition } from './latlng'
import { SIDE, BRANCH } from './index'
import { IUnit } from './unit'

export interface IOrbatUnitMap {
  [id: string]: IOrbatUnit
}

export interface IOrbatUnit extends IUnit {
  units: IOrbatUnitMap
}

export interface IOrbatBranch {
  [unit: string]: IOrbatUnit
}

export interface IOrbatSide {
  [branch: string]: IOrbatBranch
}

export interface IOrbat {
  [side: string]: IOrbatSide
}

export const fetchOrbat = (store: any) =>
  new Promise((resolve) => {
    const state: IRootState = store.getState()
    const orbat: IOrbat = {}

    // Iterate each SIDE and attach to orbat
    Object.keys(SIDE).forEach((id: string) => {
      const sideId = SIDE[+id]
      const side: IOrbatSide = (orbat[sideId] = {})

      // Iterate each BRANCH and attach to side's orbat
      Object.keys(BRANCH).forEach((id: string) => {
        const branchId = BRANCH[+id]
        const branch: IOrbatBranch = (side[branchId] = {})

        // Go through all
      })
    })

    resolve({ orbat })
  })
