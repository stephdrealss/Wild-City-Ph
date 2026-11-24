import { useState } from 'react'
import { toast } from 'sonner'
import { NPC_LINES } from '@/game/data'
import { closeModal, earn, getState, setState, type Modal } from '@/game/store'
import { Btn, Sheet } from './kit'

export function NpcDialog({ m }: { m: Extract<Modal, { kind: 'npc' }> }) {
  const [line, setLine] = useState(m.line)
  const s = getState()
  const helpedToday = s.helped[m.npcId] === s.day
  return (
    <Sheet title={m.name} subtitle="Local" accent="#ffd12e">
      <div className="flex flex-col gap-3 pt-2">
        <p className="glass-light rounded-2xl p-4 text-[15px] leading-relaxed text-pretty">"{line}"</p>
        <div className="grid gap-2">
          <Btn variant="ghost" onClick={() => setLine(NPC_LINES[Math.floor(Math.random() * NPC_LINES.length)])}>
            Chat
          </Btn>
          {m.canHelp && (
            <Btn
              variant="gold"
              disabled={helpedToday || s.energy < 5}
              onClick={() => {
                if (getState().energy < 5) {
                  toast.error('You are too tired to help')
                  return
                }
                setState((st) => ({ energy: st.energy - 5, helped: { ...st.helped, [m.npcId]: st.day } }))
                earn(20 + Math.floor(Math.random() * 30), 2, `You helped ${m.name}`)
                closeModal()
              }}
            >
              {helpedToday ? `${m.name} already thanked you today` : 'Help out (5 energy)'}
            </Btn>
          )}
          <Btn variant="ghost" onClick={closeModal}>
            Goodbye
          </Btn>
        </div>
      </div>
    </Sheet>
  )
}
