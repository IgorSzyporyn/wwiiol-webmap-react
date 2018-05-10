import { IRootState } from 'reducer/state'
import getCpLinks from 'tools/getCpLinks'
import { IChokePoint } from './chokePoint'
import { IPosition } from './latlng'
import { SIDE, BRANCH } from './index'

export interface IAttackLink {
  ao: string
  from: string
  position: IPosition
  side: SIDE
  weight: number
}

export const fetchAttackMarkers = (store: any) =>
  new Promise((resolve) => {
    const state: IRootState = store.getState()
    const wiretap = state.wiretap
    const attackMarker: any[] = []

    wiretap.attackObjectives.forEach((ao) => {
      const cp = wiretap.chokePointMap[ao.id]
      const cpOwner = ao.own.split('/').pop()
      const attackingLinks: IAttackLink[] = []
      let attackWeight = 1

      // Get a list of all connecting cp's from this
      // AO's cp
      const cpLinks = getCpLinks(cp.id, wiretap.chokePointLinks)

      // Refine the list of cpLinks to require the
      // owner of linked cp to be of opposing side of the owner
      // of the cp we are inspecting
      // Also require that the linked cp must have at least
      // 1 hc unit located in linked cp
      cpLinks.forEach((link) => {
        // Attempt to get the link's state to determine owner,
        // and if owner is opposing side
        // if no state then link is not front-line
        let hasHcUnit = false
        let linkCp: IChokePoint | null = null

        const linkState = wiretap.chokePointStateMap[link.rcp]
        const linkOwner = linkState ? linkState.owner : SIDE.NO_SIDE
        const opposingSides = linkOwner !== SIDE.NO_SIDE ? linkOwner !== cpOwner : false

        if (opposingSides) {
          // Now determine if link has a hc unit located
          linkCp = wiretap.chokePointMap[link.rcp]

          if (wiretap.unitLocations) {
            wiretap.unitLocations.forEach((unitLocation) => {
              if (linkCp && unitLocation.cp === linkCp.id) {
                // Now lookup hcunit to check if it is a ground unit
                const hcUnit = wiretap.unitMap[unitLocation.id]

                if (hcUnit.branch === BRANCH.LAND) {
                  hasHcUnit = true
                  attackWeight += 1
                }
              }
            })
          }
        }

        if (linkCp && hasHcUnit && opposingSides) {
          attackingLinks.push({
            ao: ao.ao,
            from: linkCp.id,
            position: linkCp.position,
            side: linkOwner,
            weight: attackWeight,
          })
        }
      })

      attackingLinks.forEach((link, index) => {
        attackMarker.push({
          ao: link.ao,
          bounds: {
            ne: {
              lat: Math.max(link.position.lat, cp.position.lat),
              lng: Math.max(link.position.lng, cp.position.lng),
            },
            sw: {
              lat: Math.min(link.position.lat, cp.position.lat),
              lng: Math.min(link.position.lng, cp.position.lng),
            },
          },
          from: link.from,
          id: `${cp.id}-${index}`,
          side: link.side,
          to: cp.id,
          weight: link.weight,
        })
      })
    })

    resolve({ attackMarker })
  })
