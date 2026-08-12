// Color de las paletas: de qué tonos está hecha una paleta y cuándo casa con el
// tono que el usuario ha elegido en la rueda.
//
// La rueda es un tono continuo (0-359), no una lista de colores, así que el
// emparejamiento va por distancia angular. Dos detalles que no son obvios:
//
//  · Un gris NO tiene tono útil: su `h` es ruido de redondeo. Por eso los
//    bloques por debajo de SAT_MIN no entran en `tonos` y se cuentan aparte
//    como neutros (la mitad de las paletas bonitas de Minecraft son grises y
//    hay que poder buscarlas).
//  · Los tonos se guardan en la fila de la paleta al crearla, calculados en el
//    servidor desde el catálogo. Así el filtro es una consulta y no hay que
//    recalcular 12 bloques por paleta en cada búsqueda.

import { bloque } from './bloques'

/** Por debajo de esta saturación (0-100) el color se considera neutro. */
export const SAT_MIN = 18

/** Tolerancia por defecto de la rueda, en grados a cada lado. */
export const TOL_TONO = 25

/** Distancia angular entre dos tonos (0-180). */
export function distanciaTono(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360)
  return d > 180 ? 360 - d : d
}

// ── Sectores de tono ─────────────────────────────────────────────────────────
// La rueda es continua pero la BD filtra por solapamiento de arrays, que es lo
// que un índice GIN sabe hacer rápido. El puente son 24 sectores de 15°: la
// paleta guarda en qué sectores cae y la búsqueda calcula qué sectores cubre el
// arco elegido. El error máximo es medio sector (7,5°), inapreciable.
export const SECTOR_GRADOS = 15
export const N_SECTORES = 360 / SECTOR_GRADOS

export function sectorDeTono(h: number): number {
  return Math.floor((((h % 360) + 360) % 360) / SECTOR_GRADOS) % N_SECTORES
}

/** Sectores que cubre el arco [tono-tol, tono+tol]. */
export function sectoresDelArco(tono: number, tol = TOL_TONO): number[] {
  const pasos = Math.ceil(tol / SECTOR_GRADOS)
  const centro = sectorDeTono(tono)
  const out = new Set<number>()
  for (let d = -pasos; d <= pasos; d++) out.add((centro + d + N_SECTORES) % N_SECTORES)
  return [...out].sort((a, b) => a - b)
}

export interface TonosPaleta {
  /** Tonos de los bloques con color (sin los neutros), sin repetidos. */
  tonos: number[]
  /** Esos tonos en sectores de 15° — es la columna que filtra en la BD. */
  sectores: number[]
  /** true si la paleta lleva algún bloque neutro (gris, blanco, negro). */
  neutro: boolean
  /** Color medio de la paleta, "#rrggbb" — se usa como resumen. */
  hex: string
}

/** Analiza los bloques de una paleta. Ignora ids que no estén en el catálogo. */
export function analizarPaleta(ids: string[]): TonosPaleta {
  const tonos = new Set<number>()
  let neutro = false
  let r = 0, g = 0, b = 0, n = 0

  for (const id of ids) {
    const bl = bloque(id)
    if (!bl) continue
    if (bl.s < SAT_MIN) neutro = true
    else tonos.add(bl.h)
    r += parseInt(bl.hex.slice(1, 3), 16)
    g += parseInt(bl.hex.slice(3, 5), 16)
    b += parseInt(bl.hex.slice(5, 7), 16)
    n++
  }

  const medio = n === 0
    ? '#000000'
    : '#' + [r / n, g / n, b / n].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')

  const lista = [...tonos].sort((a, b) => a - b)
  const sectores = [...new Set(lista.map(sectorDeTono))].sort((a, b) => a - b)
  return { tonos: lista, sectores, neutro, hex: medio }
}

/** Color CSS de un tono puro, para pintar la rueda y el marcador. */
export function cssTono(h: number, s = 70, l = 50): string {
  return `hsl(${h} ${s}% ${l}%)`
}

/** Nombre aproximado del tono, para el texto del filtro activo. */
export function nombreTono(h: number): string {
  const NOMBRES: [number, string][] = [
    [15, 'rojo'], [40, 'naranja'], [65, 'amarillo'], [95, 'lima'], [150, 'verde'],
    [185, 'cian'], [215, 'azul claro'], [250, 'azul'], [280, 'morado'],
    [310, 'magenta'], [345, 'rosa'], [360, 'rojo'],
  ]
  const t = ((h % 360) + 360) % 360
  for (const [limite, nombre] of NOMBRES) if (t < limite) return nombre
  return 'rojo'
}
