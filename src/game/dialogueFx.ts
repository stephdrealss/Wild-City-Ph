import { toast } from 'sonner'
import type { DlgCtx, Fx } from './dialogue'
import { engineRef } from './ref'
import { completeMission, earn, fmtCash, getState, setState, startMission } from './store'

/** Applies the game effects of a dialogue choice: tips, discounts, gigs, directions, missions. */
export function applyFx(list: Fx[] | undefined, ctx: DlgCtx) {
  for (const f of list ?? []) {
    switch (f.t) {
      case 'cash':
        earn(f.n, 0, `${ctx.name} gave you ${fmtCash(f.n)}`)
        break
      case 'rep':
        earn(0, f.n, 'Respect earned')
        break
      case 'energy':
        setState((s) => ({ energy: Math.min(100, s.energy + f.n) }))
        toast.success('You feel refreshed', { description: `Energy +${f.n}` })
        break
      case 'hunger':
        setState((s) => ({ hunger: Math.min(100, s.hunger + f.n) }))
        toast.success('You ate a little', { description: `Hunger +${f.n}` })
        break
      case 'discount':
        setState((s) => ({ discount: { pct: f.pct, day: s.day } }))
        toast.success(`${f.pct}% off food today`, { description: 'Applies at every food stall.' })
        break
      case 'gig':
        if (getState().energy < f.energy) {
          toast.error('You are too tired for this', { description: `Needs ${f.energy} energy.` })
        } else {
          setState((s) => ({ energy: s.energy - f.energy }))
          earn(f.pay, f.rep, `Gig done for ${ctx.name}`)
        }
        break
      case 'guide': {
        const p = engineRef.current?.nearestPoi(f.kind)
        if (p) {
          setState({ guide: { label: p.label, x: p.x, z: p.z } })
          toast('Directions set', { description: `${p.label} is marked on your map.` })
        }
        break
      }
      case 'mission':
        startMission(f.id)
        ctx.missions[f.id] = 'active'
        break
      case 'complete':
        completeMission(f.id)
        ctx.missions[f.id] = 'done'
        break
      case 'help':
        setState((s) => ({ energy: Math.max(0, s.energy - 5), helped: { ...s.helped, [ctx.npcId]: s.day } }))
        ctx.helpedToday = true
        earn(20 + Math.floor(Math.random() * 30), 2, `You helped ${ctx.name}`)
        break
      case 'flag':
        ctx.flags.push(f.daily ? `${f.f}@${ctx.day}` : f.f)
        break
    }
  }
}
