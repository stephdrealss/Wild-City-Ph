import * as THREE from 'three'
import { districtAt, type DistrictId } from './data'
import type { PoiKind } from './store'
import { POI_COLORS, type Ctx } from './worldTypes'

const PALETTE = ['#ff4d6d', '#ffb703', '#2ec4b6', '#8338ec', '#fb5607', '#3a86ff', '#06d6a0', '#ef476f', '#ffd166']
const GOODS = ['#ff3b30', '#ffcc00', '#34c759', '#ff9500', '#af52de', '#ffe6a7']
export const pickc = (c: Ctx, a: string[] = PALETTE) => a[Math.floor(c.rand() * a.length)]

const quarter = (ry: number) => Math.abs(Math.round(ry / (Math.PI / 2))) % 2 === 1

export function addCollider(c: Ctx, x: number, z: number, w: number, d: number, ry = 0) {
  const [ww, dd] = quarter(ry) ? [d, w] : [w, d]
  c.cols.push({ x0: x - ww / 2, x1: x + ww / 2, z0: z - dd / 2, z1: z + dd / 2 })
}

export function addPoi(
  c: Ctx,
  id: string,
  kind: PoiKind,
  label: string,
  x: number,
  z: number,
  extra?: number,
  music = false,
  r = 3.2,
) {
  c.pois.push({ id, kind, label, x, z, r, district: districtAt(x, z), color: POI_COLORS[kind], music, extra })
}

/** local forward (+z) point rotated by ry */
export const front = (x: number, z: number, ry: number, dist: number) => ({ x: x + Math.sin(ry) * dist, z: z + Math.cos(ry) * dist })

export function stall(c: Ctx, x: number, z: number, ry: number, colA = pickc(c), colB = '#ffffff', speaker = false) {
  c.solid.at(x, z, ry, () => {
    const b = c.solid
    b.box(3.2, 0.9, 1.3, '#a9743f', 0, 0.45, 0.3)
    b.box(3.3, 0.08, 1.4, '#d9a066', 0, 0.94, 0.3)
    for (const px of [-1.5, 1.5]) for (const pz of [-0.45, 1.05]) b.box(0.08, 2.5, 0.08, '#5b3b1d', px, 1.25, pz)
    for (let i = 0; i < 6; i++) b.box(0.58, 0.07, 2.0, i % 2 ? colB : colA, -1.45 + i * 0.58, 2.6, 0.35, { rx: 0.18 })
    b.box(3.3, 0.05, 0.05, '#4a2f16', 0, 2.52, 1.35)
    // ankara cloth: tablecloth and a hanging banner
    c.fabric.box(3.34, 0.03, 1.42, pickc(c, ['#ffffff', '#fff0d9', '#ffd9e6', '#d9fff3']), 0, 0.99, 0.3)
    c.fabric.box(3.1, 0.55, 0.03, pickc(c, ['#ffffff', '#ffe8cc', '#e6fff7', '#ffe0f0']), 0, 2.2, 1.34, { rx: -0.08 })
    for (let i = 0; i < 6; i++) {
      const g = GOODS[Math.floor(c.rand() * GOODS.length)]
      const px = -1.25 + i * 0.5
      if (c.rand() < 0.5) {
        b.sphere(0.16, g, px, 1.14, 0.3, {}, 7)
        b.sphere(0.14, g, px + 0.12, 1.1, 0.5, {}, 7)
        b.sphere(0.14, g, px - 0.1, 1.1, 0.5, {}, 7)
        b.sphere(0.13, g, px, 1.27, 0.38, {}, 7)
      } else {
        b.box(0.34, 0.2, 0.34, g, px, 1.1, 0.3, { ry: c.rand() })
        b.box(0.34, 0.16, 0.34, g, px, 1.28, 0.3, { ry: c.rand() })
      }
    }
    b.cyl(0.28, 0.22, 0.32, '#b8863f', -1.9, 0.16, 0.6, 10)
    b.sphere(0.2, '#ff9f1c', -1.9, 0.42, 0.6, {}, 7)
    b.box(0.6, 0.5, 0.6, '#8a5a2b', 1.9, 0.25, -0.2)
    b.box(0.55, 0.45, 0.55, '#9b6a35', 1.95, 0.72, -0.15, { ry: 0.3 })
    b.box(0.5, 0.7, 0.4, '#d9c9a0', 1.8, 0.35, 0.6, { ry: 0.2 })
    b.box(0.3, 0.1, 0.25, '#ffffff', 0, 0.88, 0.95)
    if (speaker) b.box(0.4, 0.55, 0.3, '#111', -1.9, 0.28, 0.2)
  })
  addCollider(c, x, z, 3.4, 2.4, ry)
  const f = front(x, z, ry, -0.5)
  c.spots.push({ x: f.x, z: f.z, ry: ry, kind: 'vendor' })
}

export function building(
  c: Ctx,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  ry: number,
  wall: string,
  roof: string,
  sign: string,
  doorCol = '#2b2018',
) {
  c.solid.at(x, z, ry, () => {
    const b = c.solid
    b.box(w, h, d, wall, 0, h / 2, 0)
    b.box(w + 0.1, 0.5, d + 0.1, '#e9e4da', 0, 0.25, 0)
    b.box(w + 0.5, 0.35, d + 0.5, roof, 0, h + 0.17, 0)
    b.box(w + 0.7, 0.18, d + 0.7, '#ffffff', 0, h - 0.1, 0)
    b.box(1.5, 2.4, 0.12, doorCol, 0, 1.2, d / 2 + 0.03)
    b.box(1.7, 0.15, 0.2, '#e9e4da', 0, 2.5, d / 2 + 0.08)
    for (const wx of [-w / 3, w / 3]) {
      b.box(1.4, 1.2, 0.1, '#8fd3ff', wx, 1.7, d / 2 + 0.03)
      b.box(1.6, 0.1, 0.25, '#e9e4da', wx, 1.05, d / 2 + 0.1)
      b.box(0.06, 1.2, 0.12, '#e9e4da', wx, 1.7, d / 2 + 0.07)
    }
    for (const sx of [-1, 1]) for (const k of [-1, 1]) {
      b.box(0.1, 1.1, 1.3, '#8fd3ff', sx * (w / 2 + 0.02), h * 0.55, k * d * 0.22)
      b.box(0.2, 0.1, 1.5, '#e9e4da', sx * (w / 2 + 0.06), h * 0.55 - 0.6, k * d * 0.22)
    }
    b.box(w * 0.9, 0.5, 0.5, sign, 0, 3.0, d / 2 + 0.3, { rx: 0.35 })
    c.glow.box(w * 0.7, 0.3, 0.06, sign, 0, 3.0, d / 2 + 0.58, { rx: 0.35 })
    b.box(w * 0.95, 0.12, 1.2, '#ffffff', 0, 2.75, d / 2 + 0.5, { rx: 0.25 })
    // rooftop kit: water tank on legs and an AC unit
    const ty = h + 0.35
    for (const lx of [-0.4, 0.4]) for (const lz of [-0.4, 0.4]) b.box(0.08, 0.9, 0.08, '#6b6f78', w / 4 + lx, ty + 0.45, -d / 4 + lz)
    b.cyl(0.62, 0.62, 1.0, '#7d8aa0', w / 4, ty + 1.3, -d / 4, 12)
    b.box(0.9, 0.55, 0.6, '#cfd3da', -w / 4, ty + 0.28, d / 6)
    b.cyl(0.22, 0.22, 0.06, '#555', -w / 4, ty + 0.58, d / 6, 10)
  })
  addCollider(c, x, z, w + 0.5, d + 0.5, ry)
}

export function speakerBox(c: Ctx, x: number, z: number) {
  c.solid.box(0.5, 0.8, 0.4, '#0f0f14', x, 0.4, z)
  c.solid.cyl(0.14, 0.14, 0.05, '#555', x, 0.45, z + 0.22, 8, { rx: Math.PI / 2 })
}

export function barberPole(c: Ctx, x: number, z: number) {
  for (let i = 0; i < 6; i++) c.solid.cyl(0.12, 0.12, 0.16, i % 2 ? '#e63946' : '#ffffff', x, 1.0 + i * 0.16, z, 8)
  c.solid.cyl(0.15, 0.15, 0.06, '#222', x, 0.95, z, 8)
}

export function house(c: Ctx, x: number, z: number, ry: number, wall: string, roof: string) {
  const w = 7 + c.rand() * 2
  const d = 6 + c.rand() * 2
  c.solid.at(x, z, ry, () => {
    const b = c.solid
    b.box(w + 0.2, 0.5, d + 0.2, '#d9d2c5', 0, 0.25, 0)
    b.box(w, 3.4, d, wall, 0, 1.7, 0)
    b.cone(Math.max(w, d) * 0.78, 2.4, roof, 0, 4.6, 0, 4, { ry: Math.PI / 4, sx: w / Math.max(w, d), sz: d / Math.max(w, d) })
    b.box(1.2, 2.1, 0.1, '#5b3b1d', 0, 1.05, d / 2 + 0.03)
    for (const wx of [-w / 3, w / 3]) {
      b.box(1.1, 1.0, 0.1, '#8fd3ff', wx, 1.9, d / 2 + 0.03)
      b.box(0.5, 1.0, 0.06, '#3a8a7a', wx - 0.8, 1.9, d / 2 + 0.07)
      b.box(0.5, 1.0, 0.06, '#3a8a7a', wx + 0.8, 1.9, d / 2 + 0.07)
    }
    b.box(0.6, 1.4, 0.6, '#c9b9a5', w / 3, 4.4, -d / 4)
    // veranda with posts, low wall and steps
    b.box(w * 0.7, 0.12, 1.8, '#d9d2c5', 0, 0.3, d / 2 + 0.9)
    b.box(w * 0.7 + 0.3, 0.12, 2.0, roof, 0, 2.7, d / 2 + 1.0, { rx: 0.1 })
    for (const px of [-1, 1]) b.cyl(0.07, 0.07, 2.4, '#f4f1ea', px * w * 0.33, 1.5, d / 2 + 1.7, 8)
    b.box(w + 2, 0.15, 1.4, '#e8dcc8', 0, 0.08, d / 2 + 2.6)
    // little garden fence
    for (let k = -3; k <= 3; k++) b.box(0.08, 0.7, 0.08, '#f4f1ea', k * (w / 6.5), 0.4, d / 2 + 3.4)
    b.box(w, 0.06, 0.06, '#f4f1ea', 0, 0.62, d / 2 + 3.4)
  })
  addCollider(c, x, z, w + 0.4, d + 0.4, ry)
}

export function tower(c: Ctx, x: number, z: number, w: number, d: number, h: number, color: string, neon: string) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv
  const faces: [number, number][] = [
    [d / 8, h / 8],
    [d / 8, h / 8],
    [0.01, 0.01],
    [0.01, 0.01],
    [w / 8, h / 8],
    [w / 8, h / 8],
  ]
  for (let f = 0; f < 6; f++)
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * faces[f][0], uv.getY(i) * faces[f][1])
    }
  c.towers.add(g, color, x, h / 2, z)
  // podium and entrance canopy
  c.solid.box(w + 2, 4, d + 2, '#b9bfcc', x, 2, z)
  c.solid.box(w * 0.5, 0.25, 2.4, '#ffffff', x, 3.3, z + d / 2 + 2.2)
  c.glow.box(w * 0.5, 0.14, 0.1, neon, x, 3.1, z + d / 2 + 3.3)
  for (const sx of [-1, 1]) c.solid.box(0.18, 3.2, 0.18, '#444a55', x + sx * w * 0.23, 1.6, z + d / 2 + 3.2)
  // roof plant: mechanical box, tank, antenna
  c.solid.box(w * 0.5, 2.5, d * 0.5, '#444a55', x, h + 1.25, z)
  c.solid.cyl(1.0, 1.0, 1.8, '#8a93a6', x - w * 0.28, h + 0.9, z + d * 0.2, 10)
  c.solid.box(1.8, 0.8, 1.4, '#cfd3da', x + w * 0.25, h + 0.4, z - d * 0.25)
  c.solid.cyl(0.1, 0.1, 6, '#c9ced6', x + w * 0.2, h + 5, z, 5)
  c.glow.box(w + 0.2, 0.5, d + 0.2, neon, x, h - 1.2, z)
  c.glow.box(w + 0.2, 0.3, d + 0.2, neon, x, h * 0.45, z)
  c.glow.box(0.3, 1.2, 0.3, '#ff3030', x + w * 0.2, h + 8, z)
  addCollider(c, x, z, w + 2, d + 2)
}

export function palm(c: Ctx, x: number, z: number) {
  const h = 4.5 + c.rand() * 2
  const lean = (c.rand() - 0.5) * 0.3
  c.solid.cyl(0.18, 0.28, h, '#9b6b3a', x, h / 2, z, 6, { rz: lean })
  const tx = x - Math.sin(lean) * (h / 2)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    c.solid.box(0.35, 0.06, 2.8, i % 2 ? '#2f9e44' : '#3fbf5a', tx + Math.sin(a) * 1.2, h + 0.1, z + Math.cos(a) * 1.2, { ry: a, rx: 0.5 })
  }
  c.solid.sphere(0.22, '#6b4423', tx, h - 0.1, z, {}, 5)
  addCollider(c, x, z, 0.6, 0.6)
}

export function tree(c: Ctx, x: number, z: number) {
  const s = 0.8 + c.rand() * 0.6
  c.solid.cyl(0.2 * s, 0.28 * s, 2.2 * s, '#7a5230', x, 1.1 * s, z, 6)
  c.solid.sphere(1.5 * s, c.rand() < 0.5 ? '#3f9f3f' : '#58b947', x, 3.2 * s, z, { sy: 0.85 }, 7)
  c.solid.sphere(1.0 * s, '#4cae4c', x + 0.7 * s, 2.8 * s, z + 0.3, {}, 6)
  addCollider(c, x, z, 0.6, 0.6)
}

export function lampPost(c: Ctx, x: number, z: number) {
  c.solid.cyl(0.07, 0.1, 4.6, '#2e3340', x, 2.3, z, 6)
  c.solid.box(0.9, 0.08, 0.08, '#2e3340', x, 4.6, z)
  c.lamp.box(0.5, 0.14, 0.3, '#ffe9a8', x, 4.52, z)
}

export function umbrella(c: Ctx, x: number, z: number) {
  const col = pickc(c)
  c.solid.cyl(0.04, 0.04, 2.4, '#ddd', x, 1.2, z, 5)
  c.solid.cone(1.5, 0.7, col, x, 2.5, z, 8)
  c.solid.box(1.1, 0.12, 2.0, '#ffffff', x + 1.8, 0.25, z, { ry: 0.3 })
}

export function bench(c: Ctx, x: number, z: number, ry: number) {
  c.solid.at(x, z, ry, () => {
    c.solid.box(1.8, 0.1, 0.5, '#8a5a2b', 0, 0.5, 0)
    c.solid.box(1.8, 0.45, 0.08, '#8a5a2b', 0, 0.85, -0.25)
    c.solid.box(0.1, 0.5, 0.45, '#333', -0.8, 0.25, 0)
    c.solid.box(0.1, 0.5, 0.45, '#333', 0.8, 0.25, 0)
  })
  c.spots.push({ x, z, ry, kind: 'sitter' })
}

/** Large neon billboard with a poi in front. */
export function billboard(c: Ctx, x: number, z: number, ry: number, col: string) {
  c.solid.at(x, z, ry, () => {
    c.solid.box(0.4, 5, 0.4, '#2e3340', -3, 2.5, 0)
    c.solid.box(0.4, 5, 0.4, '#2e3340', 3, 2.5, 0)
    c.solid.box(8, 3.4, 0.4, '#15151c', 0, 5.4, 0)
    c.glow.box(7.4, 2.8, 0.1, col, 0, 5.4, 0.25)
    c.glow.box(5.4, 0.5, 0.12, '#ffffff', 0, 5.4, 0.3)
  })
  addCollider(c, x, z, 8, 0.6, ry)
}

export function fountain(c: Ctx, x: number, z: number) {
  c.solid.cyl(5.5, 5.8, 0.8, '#d9d2c3', x, 0.4, z, 16)
  c.solid.cyl(4.8, 4.8, 0.85, '#38c6d9', x, 0.45, z, 16)
  c.solid.cyl(0.7, 0.9, 2.4, '#d9d2c3', x, 1.6, z, 8)
  c.solid.cyl(2.0, 1.2, 0.4, '#d9d2c3', x, 2.7, z, 10)
  c.solid.sphere(0.5, '#a8e8ff', x, 3.2, z, {}, 6)
  addCollider(c, x, z, 11.4, 11.4)
}

export function awningRow(c: Ctx, x: number, z: number, count: number) {
  for (let i = 0; i < count; i++) {
    c.solid.box(1.0, 0.1, 1.4, i % 2 ? '#ffffff' : pickc(c), x + i * 1.0, 2.6, z, { rx: 0.2 })
  }
}

export function kiosk(c: Ctx, x: number, z: number, ry: number, col: string, signCol: string) {
  c.solid.at(x, z, ry, () => {
    const b = c.solid
    b.box(3, 2.4, 2.4, col, 0, 1.2, 0)
    b.box(3.4, 0.2, 2.8, '#2b2b36', 0, 2.5, 0)
    b.box(2.2, 1.0, 0.1, '#8fd3ff', 0, 1.5, 1.23)
    b.box(2.4, 0.15, 0.7, '#ffffff', 0, 0.9, 1.5)
    c.glow.box(2.6, 0.5, 0.1, signCol, 0, 2.9, 1.2)
    // phone icon
    b.box(0.5, 0.9, 0.12, '#15151c', -1.8, 2.7, 0.2)
    c.glow.box(0.38, 0.7, 0.04, signCol, -1.8, 2.7, 0.27)
  })
  addCollider(c, x, z, 3.6, 3, ry)
}

export const inDistrict = (x: number, z: number, d: DistrictId) => districtAt(x, z) === d

export function bin(c: Ctx, x: number, z: number) {
  c.solid.cyl(0.28, 0.24, 0.8, '#2f7d4f', x, 0.4, z, 8)
  c.solid.cyl(0.3, 0.3, 0.06, '#245c3a', x, 0.82, z, 8)
}

export function hydrant(c: Ctx, x: number, z: number) {
  c.solid.cyl(0.14, 0.16, 0.7, '#d62828', x, 0.35, z, 8)
  c.solid.sphere(0.16, '#d62828', x, 0.74, z, {}, 6)
  c.solid.box(0.4, 0.1, 0.1, '#d62828', x, 0.5, z)
}

export function busStop(c: Ctx, x: number, z: number, ry: number) {
  c.solid.at(x, z, ry, () => {
    c.solid.box(3.4, 0.08, 1.4, '#2e3340', 0, 2.5, 0)
    for (const px of [-1.6, 1.6]) c.solid.box(0.08, 2.5, 0.08, '#2e3340', px, 1.25, -0.6)
    c.solid.box(3.2, 1.8, 0.05, '#bfe3ff', 0, 1.4, -0.65)
    c.solid.box(2.2, 0.08, 0.5, '#8a5a2b', 0, 0.5, -0.3)
    c.glow.box(1.0, 0.4, 0.05, '#ffc61a', 0, 2.2, 0.68)
  })
  addCollider(c, x, z, 3.4, 1.4, ry)
}

export function powerPole(c: Ctx, x: number, z: number) {
  c.solid.cyl(0.1, 0.14, 8, '#6b5a43', x, 4, z, 6)
  c.solid.box(2.2, 0.12, 0.12, '#4a3b2a', x, 7.6, z)
  c.solid.box(1.6, 0.1, 0.1, '#4a3b2a', x, 6.9, z)
  addCollider(c, x, z, 0.4, 0.4)
}
