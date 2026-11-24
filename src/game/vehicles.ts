import * as THREE from 'three'
import { Batch, GLASS_MAT, GLOW, LIT, METAL, PAINT } from './batch'

const TYRE = '#16161a'
const GLASS = '#9fc4e6'

interface Set {
  paint: Batch
  trim: Batch
  metal: Batch
  glass: Batch
  glow: Batch
}
const newSet = (): Set => ({ paint: new Batch(), trim: new Batch(), metal: new Batch(), glass: new Batch(), glow: new Batch() })

function wheel(s: Set, x: number, z: number, r = 0.34, w = 0.16) {
  s.trim.cyl(r, r, w, TYRE, x, r, z, 14, { rz: Math.PI / 2 })
  s.metal.cyl(r * 0.62, r * 0.62, w + 0.02, '#d5dae2', x, r, z, 12, { rz: Math.PI / 2 })
  s.trim.cyl(r * 0.2, r * 0.2, w + 0.04, '#333', x, r, z, 8, { rz: Math.PI / 2 })
}

function finish(s: Set) {
  const g = new THREE.Group()
  const add = (b: Batch, m: THREE.Material, shadow = true) => {
    const mesh = b.mesh(m)
    if (mesh) {
      mesh.castShadow = shadow
      mesh.receiveShadow = true
      g.add(mesh)
    }
  }
  add(s.paint, PAINT)
  add(s.trim, LIT)
  add(s.metal, METAL)
  add(s.glass, GLASS_MAT, false)
  add(s.glow, GLOW, false)
  return g
}

export function makeBus() {
  const s = newSet()
  const p = s.paint
  p.box(2.7, 2.2, 9.5, '#ffc61a', 0, 1.75, 0)
  p.box(2.74, 0.34, 9.54, '#ffffff', 0, 2.55, 0)
  s.trim.box(2.72, 0.38, 9.52, '#16161a', 0, 0.95, 0)
  s.trim.box(2.76, 0.12, 9.56, '#d9a400', 0, 1.2, 0)
  s.trim.box(2.5, 0.12, 9.2, '#cf9d00', 0, 2.88, 0)
  for (let i = 0; i < 6; i++) s.glass.box(2.76, 0.78, 1.15, GLASS, 0, 2.05, -3.6 + i * 1.45)
  s.glass.box(2.5, 1.0, 0.05, GLASS, 0, 2.05, 4.77)
  s.trim.box(1.5, 0.4, 0.06, '#16161a', 0, 3.05, 4.78)
  s.glow.box(1.2, 0.25, 0.04, '#ffcf3a', 0, 3.05, 4.82)
  s.metal.box(2.6, 0.3, 0.22, '#c9ced6', 0, 0.55, 4.82)
  s.metal.box(2.6, 0.3, 0.22, '#c9ced6', 0, 0.55, -4.82)
  s.trim.box(1.0, 0.12, 0.05, '#ffffff', 0, 0.62, 4.95)
  for (const x of [-1.52, 1.52]) {
    s.trim.box(0.14, 0.18, 0.26, '#222', x, 2.3, 4.55)
    s.metal.box(0.04, 0.5, 0.18, '#aaa', x * 1.02, 2.2, 4.55)
    wheel(s, x, 3.0, 0.5, 0.3)
    wheel(s, x, -3.0, 0.5, 0.3)
  }
  for (let i = 0; i < 4; i++) s.metal.box(2.4, 0.04, 0.05, '#aab', 0, 3.0, -3.5 + i * 2.4)
  for (const x of [-0.9, 0.9]) {
    s.glow.box(0.35, 0.22, 0.08, '#fff3b0', x, 0.95, 4.82)
    s.glow.box(0.3, 0.2, 0.08, '#ff3030', x, 0.95, -4.82)
  }
  return finish(s)
}

export function makeOkada(color = '#ff7a1a') {
  const s = newSet()
  wheel(s, 0, 0.8, 0.36, 0.14)
  wheel(s, 0, -0.8, 0.36, 0.14)
  s.paint.box(0.16, 0.18, 1.5, color, 0, 0.62, 0)
  s.paint.box(0.24, 0.3, 0.55, color, 0, 0.92, 0.3)
  s.trim.box(0.26, 0.1, 0.7, '#1a1a1a', 0, 0.86, -0.4)
  s.metal.box(0.05, 0.55, 0.05, '#c9ced6', 0, 0.85, 0.78, { rx: -0.3 })
  s.metal.box(0.72, 0.05, 0.05, '#c9ced6', 0, 1.12, 0.68)
  s.metal.box(0.12, 0.1, 0.05, '#ccd', 0.3, 1.14, 0.62)
  s.metal.box(0.12, 0.1, 0.05, '#ccd', -0.3, 1.14, 0.62)
  s.metal.cyl(0.06, 0.07, 0.5, '#9aa', 0.16, 0.38, -0.5, 8, { rx: Math.PI / 2 })
  s.glow.box(0.14, 0.14, 0.06, '#fff3b0', 0, 1.0, 0.88)
  s.glow.box(0.12, 0.06, 0.04, '#ff3030', 0, 0.86, -0.85)
  return { group: finish(s), seatX: 0, seatY: 0.88, seatZ: -0.35 }
}

export function makeKeke(color = '#ffd12e') {
  const s = newSet()
  wheel(s, 0, 1.1, 0.3, 0.14)
  wheel(s, -0.62, -0.7, 0.3, 0.14)
  wheel(s, 0.62, -0.7, 0.3, 0.14)
  s.paint.box(1.5, 0.5, 2.2, color, 0, 0.62, -0.2)
  s.paint.box(1.46, 0.06, 1.95, '#1f8a4c', 0, 1.98, -0.4)
  s.paint.box(1.5, 0.3, 0.1, '#1f8a4c', 0, 1.83, -1.36)
  for (const x of [-0.68, 0.68]) for (const z of [0.3, -1.1]) s.trim.box(0.05, 1.0, 0.05, '#1a1a1a', x, 1.45, z)
  s.trim.box(1.3, 0.3, 0.08, '#2a2a2a', 0, 1.1, -1.15)
  s.glass.box(1.36, 0.5, 0.04, GLASS, 0, 1.5, 0.35)
  s.paint.box(0.5, 0.45, 0.7, color, 0, 0.75, 0.9)
  s.metal.box(0.7, 0.05, 0.05, '#c9ced6', 0, 1.15, 0.85)
  s.glow.box(0.16, 0.14, 0.06, '#fff3b0', 0, 0.85, 1.27)
  return { group: finish(s), seatX: 0, seatY: 0.75, seatZ: 0.15 }
}

export function makeCar(color = '#2fb6a3') {
  const s = newSet()
  s.paint.box(1.9, 0.55, 4.2, color, 0, 0.68, 0)
  s.paint.box(1.78, 0.2, 1.2, color, 0, 1.0, 1.3)
  s.paint.box(1.7, 0.08, 2.1, color, 0, 1.55, -0.25)
  for (const x of [-0.84, 0.84]) for (const z of [0.9, -0.85]) s.paint.box(0.06, 0.62, 0.06, color, x, 1.27, z)
  s.glass.box(1.66, 0.52, 0.04, GLASS, 0, 1.25, 0.88, { rx: -0.45 })
  s.glass.box(1.7, 0.5, 0.04, GLASS, 0, 1.25, -1.35, { rx: 0.4 })
  s.glass.box(0.04, 0.45, 1.55, GLASS, 0.86, 1.28, -0.25)
  s.glass.box(0.04, 0.45, 1.55, GLASS, -0.86, 1.28, -0.25)
  s.trim.box(1.7, 0.3, 0.15, '#222', 0, 0.55, 2.12)
  s.trim.box(1.7, 0.3, 0.15, '#222', 0, 0.55, -2.12)
  s.metal.box(1.0, 0.18, 0.06, '#c9ced6', 0, 0.7, 2.15)
  s.trim.box(0.3, 0.14, 0.04, '#fff', 0, 0.55, -2.2)
  for (const x of [-1.0, 1.0]) {
    s.paint.box(0.08, 0.1, 0.26, color, x, 1.05, 0.9)
    wheel(s, x * 0.95, 1.3, 0.37, 0.22)
    wheel(s, x * 0.95, -1.3, 0.37, 0.22)
  }
  for (const x of [-0.6, 0.6]) {
    s.glow.box(0.32, 0.16, 0.06, '#fff3b0', x, 0.78, 2.12)
    s.glow.box(0.32, 0.14, 0.06, '#ff3030', x, 0.78, -2.12)
  }
  return { group: finish(s), seatX: -0.42, seatY: 0.55, seatZ: 0.0 }
}

export function makeSports(color = '#ff2d78') {
  const s = newSet()
  s.paint.box(2.0, 0.42, 4.6, color, 0, 0.52, 0)
  s.paint.box(1.8, 0.2, 1.6, color, 0, 0.78, 1.45, { rx: -0.12 })
  s.paint.box(1.5, 0.06, 1.7, color, 0, 1.18, -0.3)
  s.glass.box(1.5, 0.4, 0.04, GLASS, 0, 0.95, 0.5, { rx: -0.62 })
  s.glass.box(1.52, 0.4, 0.04, GLASS, 0, 0.95, -1.15, { rx: 0.5 })
  s.glass.box(0.04, 0.34, 1.5, GLASS, 0.76, 0.98, -0.3)
  s.glass.box(0.04, 0.34, 1.5, GLASS, -0.76, 0.98, -0.3)
  s.trim.box(1.9, 0.07, 0.5, '#16161a', 0, 1.1, -2.1)
  s.trim.box(0.06, 0.28, 0.1, '#16161a', 0.7, 0.95, -2.1)
  s.trim.box(0.06, 0.28, 0.1, '#16161a', -0.7, 0.95, -2.1)
  s.trim.box(1.4, 0.1, 0.1, '#16161a', 0, 0.38, 2.3)
  s.metal.box(0.12, 0.02, 4.5, '#ffffff', 0.35, 0.74, 0)
  s.metal.box(0.12, 0.02, 4.5, '#ffffff', -0.35, 0.74, 0)
  for (const x of [-1.0, 1.0]) {
    wheel(s, x, 1.45, 0.36, 0.26)
    wheel(s, x, -1.4, 0.38, 0.28)
  }
  for (const x of [-0.65, 0.65]) {
    s.glow.box(0.4, 0.1, 0.06, '#9ff8ff', x, 0.58, 2.31)
    s.glow.box(0.4, 0.1, 0.06, '#ff2020', x, 0.62, -2.31)
  }
  return { group: finish(s), seatX: -0.4, seatY: 0.27, seatZ: -0.1 }
}

export interface PlayerVehicle {
  group: THREE.Group
  seatX: number
  seatY: number
  seatZ: number
}

export function makePlayerVehicle(id: number): PlayerVehicle {
  if (id === 0) return makeOkada('#ff7a1a')
  if (id === 1) return makeKeke('#ffd12e')
  if (id === 2) return makeCar('#2fb6a3')
  return makeSports('#ff2d78')
}
