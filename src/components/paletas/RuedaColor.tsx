// Rueda de tono.
//
// OJO: el listado (/herramientas/paletas) ya NO la usa — filtrar por «toca este
// tono» daba demasiados falsos positivos, y ese filtro volverá cuando sea por
// porcentaje de cada color. Este archivo sigue vivo porque el CREADOR de paletas
// sí la usa para filtrar el catálogo de bloques, y lo recibe por
// tools/sync-paletas.mjs. No lo borres.
//
// El tono es continuo (0-359) y se elige arrastrando sobre el anillo. El arco
// claro marca la tolerancia: es lo que de verdad se está buscando, no un punto.
// El botón del centro es el filtro de neutros (grises, blancos y negros), que
// necesita su propio sitio porque un gris no tiene tono con el que buscarlo.
//
// El anillo es un conic-gradient recortado con máscara, no 72 paths de SVG:
// menos DOM y el degradado sale continuo de verdad. Encima va un SVG solo con el
// arco y el marcador.

import { useCallback, useRef } from 'react'
import { nombreTono, TOL_TONO } from '@/lib/paletas/color'

const TAM   = 168               // lado del widget en px
const R_EXT = 80                // radio exterior del anillo
const R_INT = 56                // radio interior
const R_MED = (R_EXT + R_INT) / 2

// Ángulo -> punto. 0° arriba y sentido horario, igual que el conic-gradient.
function punto(grados: number, r: number): [number, number] {
  const rad = (grados * Math.PI) / 180
  return [TAM / 2 + r * Math.sin(rad), TAM / 2 - r * Math.cos(rad)]
}

function arco(desde: number, hasta: number, r: number): string {
  const [x0, y0] = punto(desde, r)
  const [x1, y1] = punto(hasta, r)
  const largo = ((hasta - desde + 360) % 360) > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largo} 1 ${x1} ${y1}`
}

interface Props {
  tono:   number | null
  neutro: boolean
  tol?:   number
  onChange: (v: { tono: number | null; neutro: boolean }) => void
}

export function RuedaColor({ tono, neutro, tol = TOL_TONO, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const arrastrando = useRef(false)

  const tonoDesdeEvento = useCallback((e: { clientX: number; clientY: number }) => {
    const caja = ref.current?.getBoundingClientRect()
    if (!caja) return null
    const dx = e.clientX - (caja.left + caja.width / 2)
    const dy = e.clientY - (caja.top + caja.height / 2)
    // Clic en el agujero central: es el botón de neutros, no un tono.
    const dist = Math.hypot(dx, dy)
    const escala = caja.width / TAM
    if (dist < R_INT * escala * 0.92) return null
    const g = (Math.atan2(dx, -dy) * 180) / Math.PI
    return Math.round((g + 360) % 360)
  }, [])

  function elegir(e: React.PointerEvent) {
    const t = tonoDesdeEvento(e)
    if (t === null) return
    // Elegir un tono apaga el filtro de neutros: son dos búsquedas distintas.
    onChange({ tono: t, neutro: false })
  }

  function onPointerDown(e: React.PointerEvent) {
    // Si el toque cae en el agujero central NO se captura el puntero: ahí está
    // el botón de neutros, y capturar hace que el `click` se dispare en este
    // contenedor en vez de en el botón, que era justo por lo que no respondía.
    if (tonoDesdeEvento(e) === null) return
    arrastrando.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    elegir(e)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!arrastrando.current) return
    elegir(e)
  }

  function onPointerUp() {
    arrastrando.current = false
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const paso = e.shiftKey ? 15 : 5
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange({ tono: (((tono ?? 0) + paso) % 360), neutro: false })
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange({ tono: (((tono ?? 0) - paso + 360) % 360), neutro: false })
    } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onChange({ tono: null, neutro: false })
    }
  }

  const activo = tono !== null
  const [mx, my] = punto(tono ?? 0, R_MED)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className="relative touch-none select-none"
        style={{ width: TAM, height: TAM }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Tono del color"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={tono ?? 0}
        aria-valuetext={activo ? nombreTono(tono!) : 'sin filtro de color'}
      >
        {/* Anillo de tono */}
        <div
          className="absolute inset-0 rounded-full cursor-pointer"
          style={{
            background: 'conic-gradient(hsl(0 70% 50%), hsl(60 70% 50%), hsl(120 70% 50%), hsl(180 70% 50%), hsl(240 70% 50%), hsl(300 70% 50%), hsl(360 70% 50%))',
            WebkitMaskImage: `radial-gradient(farthest-side, transparent ${(R_INT / (TAM / 2)) * 100}%, #000 ${((R_INT + 1) / (TAM / 2)) * 100}%)`,
            maskImage:       `radial-gradient(farthest-side, transparent ${(R_INT / (TAM / 2)) * 100}%, #000 ${((R_INT + 1) / (TAM / 2)) * 100}%)`,
            opacity: neutro ? 0.35 : 1,
            transition: 'opacity 150ms',
          }}
        />

        {/* Arco de tolerancia + marcador */}
        <svg className="absolute inset-0 pointer-events-none" width={TAM} height={TAM} viewBox={`0 0 ${TAM} ${TAM}`}>
          {activo && !neutro && (
            <>
              <path
                d={arco(tono! - tol, tono! + tol, R_MED)}
                stroke="#F5F5F0"
                strokeWidth={R_EXT - R_INT - 2}
                strokeLinecap="butt"
                fill="none"
                opacity={0.28}
              />
              <circle cx={mx} cy={my} r={7} fill={`hsl(${tono} 70% 50%)`} stroke="#F5F5F0" strokeWidth={2.5} />
            </>
          )}
        </svg>

        {/* Centro: filtro de neutros */}
        <button
          type="button"
          onClick={() => onChange({ tono: null, neutro: !neutro })}
          className={`absolute rounded-full flex flex-col items-center justify-center text-center transition-colors ${
            neutro
              ? 'bg-[#F4811F]/15 border-2 border-[#F4811F] text-[#F4811F]'
              : 'bg-[#161618] border border-[#2A2A2E] text-[#71717A] hover:text-[#F5F5F0] hover:border-[#3A3A3F]'
          }`}
          style={{
            left: TAM / 2 - R_INT + 6,
            top:  TAM / 2 - R_INT + 6,
            width:  (R_INT - 6) * 2,
            height: (R_INT - 6) * 2,
          }}
          aria-pressed={neutro}
        >
          <span className="text-[11px] font-semibold leading-tight">Neutros</span>
          <span className="text-[9px] leading-tight opacity-70">grises, blancos<br />y negros</span>
        </button>
      </div>

      {/* Estado + limpiar */}
      <div className="flex items-center gap-2 min-h-[26px]">
        {activo && !neutro ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA]">
              <span className="w-3 h-3 rounded-full border border-[#2A2A2E]" style={{ background: `hsl(${tono} 70% 50%)` }} />
              {nombreTono(tono!)} · {tono}°
            </span>
            <button
              type="button"
              onClick={() => onChange({ tono: null, neutro: false })}
              className="text-xs text-[#71717A] hover:text-[#F5F5F0] transition-colors"
            >
              quitar
            </button>
          </>
        ) : neutro ? (
          // Sin decir «paletas» ni «bloques»: la rueda filtra unas en el listado
          // y otros en el editor, y es el mismo componente.
          <span className="text-xs text-[#A1A1AA]">Solo grises, blancos y negros</span>
        ) : (
          <span className="text-xs text-[#52525A]">Toca el aro para filtrar por color</span>
        )}
      </div>
    </div>
  )
}

export default RuedaColor
