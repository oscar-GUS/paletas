// Catálogo de bloques de la herramienta de Paletas.
//
// Los datos vienen horneados de tools/build-palette-blocks.mjs: id de bloque,
// tile del atlas (+ su índice), familia y el color MEDIO REAL de la textura en
// hex y HSL. El nombre en español no se hornea: lo da displayName(), que ya es
// el único punto de verdad para eso en todo el sitio.

import datos from './bloques.json'
import { displayName } from '@/lib/litematic/blockNames'

export interface BloquePaleta {
  /** Id de bloque de Minecraft sin namespace: "oak_planks". */
  id:   string
  /** Nombre del tile del atlas. */
  tile: string
  /** Índice del tile en el atlas (para el sprite CSS). */
  idx:  number
  /** Familia del catálogo — agrupa el selector. */
  fam:  string
  /** Color medio de la textura, "#rrggbb". */
  hex:  string
  /** Tono 0-359 del color medio. */
  h:    number
  /** Saturación 0-100. */
  s:    number
  /** Luminosidad 0-100. */
  l:    number
}

export const ATLAS = datos.atlas as {
  /** Nombre del sprite en /public, con la huella de su contenido. */
  archivo: string
  cell: number; cols: number; pad: number; w: number; h: number
}

export const BLOQUES = datos.bloques as BloquePaleta[]

const POR_ID = new Map(BLOQUES.map(b => [b.id, b]))

export function bloque(id: string): BloquePaleta | undefined {
  return POR_ID.get(id)
}

export function esBloqueValido(id: string): boolean {
  return POR_ID.has(id)
}

/** Nombre en español del bloque ("Tablones de roble"). */
export function nombreBloque(id: string): string {
  return displayName(id)
}

// ── Familias ──────────────────────────────────────────────────────────────────
// El orden es el del selector del creador de paletas: primero lo que más se usa
// para construir. Los ids los asigna tools/build-palette-blocks.mjs, así que las
// dos listas tienen que moverse juntas.
export const FAMILIAS: { id: string; label: string }[] = [
  { id: 'piedra',    label: 'Piedra' },
  { id: 'madera',    label: 'Madera' },
  { id: 'arena',     label: 'Arena y barro' },
  { id: 'tierra',    label: 'Tierra y nieve' },
  { id: 'lana',      label: 'Lana' },
  { id: 'hormigon',  label: 'Hormigón' },
  { id: 'polvo',     label: 'Hormigón en polvo' },
  { id: 'terracota', label: 'Terracota' },
  { id: 'vidriada',  label: 'Terracota vidriada' },
  { id: 'cristal',   label: 'Cristal' },
  { id: 'metal',     label: 'Metal y mineral' },
  { id: 'menas',     label: 'Menas' },
  { id: 'nether',    label: 'Nether' },
  { id: 'end',       label: 'End' },
  { id: 'marino',    label: 'Marino' },
  { id: 'natural',   label: 'Natural' },
  { id: 'redstone',  label: 'Redstone' },
  { id: 'utilidad',  label: 'Utilidad' },
  { id: 'otros',     label: 'Otros' },
]

export const FAMILIA_LABEL: Record<string, string> =
  Object.fromEntries(FAMILIAS.map(f => [f.id, f.label]))

// ── Búsqueda ──────────────────────────────────────────────────────────────────
// Índice de texto precalculado (id + nombre ES sin acentos) para que teclear en
// el selector no recalcule 302 displayName() por pulsación.
const DIACRITICOS = /[̀-ͯ]/g
const sinAcentos = (s: string) => s.normalize('NFD').replace(DIACRITICOS, '').toLowerCase()

const INDICE: { b: BloquePaleta; texto: string }[] = BLOQUES.map(b => ({
  b,
  texto: sinAcentos(`${b.id} ${displayName(b.id)}`),
}))

/** Bloques cuyo id o nombre ES contiene la consulta. Sin consulta, todos. */
export function buscarBloques(q: string): BloquePaleta[] {
  const t = sinAcentos(q.trim())
  if (!t) return BLOQUES
  return INDICE.filter(e => e.texto.includes(t)).map(e => e.b)
}
