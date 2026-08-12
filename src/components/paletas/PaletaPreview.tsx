// Rejilla de bloques de una paleta: 6 -> 3×2, 9 -> 3×3, 12 -> 4×3.
//
// Los bloques van pegados, sin separación, para que la paleta se lea como una
// muestra de material y no como una lista de iconos.
//
// El tamaño de cada bloque sale de `100cqw / columnas`: así la rejilla llena el
// ancho de la tarjeta sea el que sea, sin JS y sin medir nada. La clase
// `text-[40px]` es el respaldo para un navegador sin container queries — el
// estilo inline lo pisa cuando sí las entiende.

import { BloqueIcono } from './BloqueIcono'
import { cn } from '@/lib/cn'

const COLUMNAS: Record<number, number> = { 6: 3, 9: 3, 12: 4 }

export function columnasDe(n: number): number {
  return COLUMNAS[n] ?? (n % 4 === 0 ? 4 : 3)
}

interface Props {
  bloques: string[]
  className?: string
  /** Bordes redondeados del conjunto. */
  redondeo?: string
}

export function PaletaPreview({ bloques, className, redondeo = 'rounded-lg' }: Props) {
  const cols = columnasDe(bloques.length)
  return (
    <div style={{ containerType: 'inline-size' }} className={cn('w-full', className)}>
      <div
        className={cn('grid overflow-hidden text-[40px]', redondeo)}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          fontSize: `calc(100cqw / ${cols})`,
        }}
      >
        {/* 1em es exactamente el ancho de celda (font-size = 100cqw / columnas),
            así que el bloque la llena sin necesidad de estirarlo. */}
        {bloques.map((id, i) => (
          <BloqueIcono key={`${id}-${i}`} id={id} />
        ))}
      </div>
    </div>
  )
}

export default PaletaPreview
