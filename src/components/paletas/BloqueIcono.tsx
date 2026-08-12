// Icono de un bloque, recortado del sprite de paletas (public/paletas-atlas.png).
//
// Es un componente de servidor a propósito: la posición del sprite se calcula de
// `idx`, que viaja horneado en el catálogo, así que las paletas se pintan en el
// HTML inicial sin JS ni fetch. Si el id no está en el catálogo (un bloque que se
// retire del catálogo pero siga guardado en una paleta antigua) cae a un cuadro
// neutro en vez de a un hueco roto.
//
// El sprite se mide en `em`, no en px: un sprite es background-image, y su
// background-position en % no es un desplazamiento (el % alinea el mismo % de la
// imagen con el del hueco), así que con % no hay forma de recortar una celda.
// Con em sí: 1em = un bloque, y el tamaño real lo decide el font-size del
// contenedor, que ya puede ser responsive con clases normales de Tailwind.

import type { CSSProperties } from 'react'
import { ATLAS, bloque } from '@/lib/paletas/bloques'
import { cn } from '@/lib/cn'

const { archivo, cell, cols, pad, w, h } = ATLAS
const STRIDE = (cell + 2 * pad) / cell   // celda + margen, en unidades de bloque
const PAD    = pad / cell
// El sprite lleva la huella de su contenido en el nombre, y el catálogo dice
// cuál le toca: así un navegador con la imagen antigua en caché no puede pintar
// los bloques cambiados de sitio (los índices se mueven al regenerar).
const SPRITE = `/${archivo}`

/** Estilos del sprite para un bloque. El tamaño lo da `fontSize` (1em = 1 bloque). */
export function estiloBloque(id: string): CSSProperties | null {
  const b = bloque(id)
  if (!b) return null
  const col  = b.idx % cols
  const fila = Math.floor(b.idx / cols)
  return {
    width:              '1em',
    height:             '1em',
    backgroundImage:    `url(${SPRITE})`,
    backgroundSize:     `${w / cell}em ${h / cell}em`,
    backgroundPosition: `-${col * STRIDE + PAD}em -${fila * STRIDE + PAD}em`,
    backgroundRepeat:   'no-repeat',
    imageRendering:     'pixelated',
  }
}

interface Props {
  id: string
  /** Lado del icono en píxeles. Si se omite, manda el font-size del contenedor. */
  px?: number
  className?: string
  title?: string
}

export function BloqueIcono({ id, px, className, title }: Props) {
  const estilo = estiloBloque(id)
  return (
    <span
      className={cn('block shrink-0', !estilo && 'bg-[#2A2A2E]', className)}
      style={{
        ...(estilo ?? { width: '1em', height: '1em' }),
        ...(px ? { fontSize: px } : null),
      }}
      title={title}
      aria-hidden="true"
    />
  )
}

export default BloqueIcono
