// Creador de paletas de bloques de MineLite.
//
// Vive en su propio repo y MineLite lo sirve dentro de un iframe del mismo
// origen (/tools/paletas/). Lo que hay aquí es la herramienta; el catálogo de
// bloques, los colores y los componentes que dibujan una paleta llegan
// sincronizados desde MineLite (npm run tools:paletas), que es su fuente de
// verdad porque también los usan el listado y las fichas.
//
// Modelo de interacción: la paleta son N huecos y el catálogo es la fuente. Se
// toca un hueco para apuntarlo (o se deja el primero libre) y se toca un bloque
// para colocarlo; tocar un bloque ya puesto lo quita. El catálogo NO se arrastra
// a propósito: en una rejilla con scroll el arrastre pelea con el gesto de
// desplazar, y lo que importa ahí es probar combinaciones rápido.
//
// Dentro de la paleta sí se arrastra, para cambiar bloques de sitio: el orden es
// parte del diseño y hay que poder llevarse el del puesto 2 al 4 sin rehacerla.

import { useEffect, useMemo, useRef, useState } from 'react'
import { BLOQUES, FAMILIAS, buscarBloques, nombreBloque, type BloquePaleta } from '@/lib/paletas/bloques'
import { analizarPaleta, distanciaTono, nombreTono, SAT_MIN, TOL_TONO } from '@/lib/paletas/color'
import { estiloBloque } from '@/components/paletas/BloqueIcono'
import { PaletaPreview, columnasDe } from '@/components/paletas/PaletaPreview'
import { RuedaColor } from '@/components/paletas/RuedaColor'
import { cargarSesion, publicarPaleta, irA, type PaletaMia } from './api'
import { cn } from '@/lib/cn'

const TAMANOS = [6, 9, 12] as const

const ESTADO_LABEL: Record<PaletaMia['estado'], string> = {
  pendiente: 'En revisión',
  aprobada:  'Publicada',
  rechazada: 'Rechazada',
}

const ESTADO_STYLE: Record<PaletaMia['estado'], string> = {
  pendiente: 'text-ambar border-ambar/30 bg-ambar/[0.07]',
  aprobada:  'text-[#27AE60] border-[rgba(39,174,96,0.3)] bg-[rgba(39,174,96,0.07)]',
  rechazada: 'text-[#E8776B] border-[#C0392B]/30 bg-[#C0392B]/[0.07]',
}

export default function App() {
  const [tamano, setTamano]     = useState<number>(9)
  const [huecos, setHuecos]     = useState<(string | null)[]>(Array(9).fill(null))
  const [activo, setActivo]     = useState(0)
  const [q, setQ]               = useState('')
  const [familia, setFamilia]   = useState<string | null>(null)
  const [tono, setTono]         = useState<number | null>(null)
  const [neutro, setNeutro]     = useState(false)
  const [abrirColor, setAbrirColor] = useState(false)
  const [titulo, setTitulo]     = useState('')
  const [descripcion, setDesc]  = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [logueado, setLogueado] = useState<boolean | null>(null)
  const [admin, setAdmin]       = useState(false)
  const [mias, setMias]         = useState<PaletaMia[]>([])

  useEffect(() => {
    cargarSesion().then(s => { setLogueado(s.logueado); setAdmin(s.admin); setMias(s.paletas) })
  }, [])

  // Cerrar la rueda de color al tocar fuera. Sin esto hay que volver al botón
  // para quitarla de en medio, justo cuando lo que quieres es ir al catálogo.
  const panelColor = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!abrirColor) return
    function fuera(e: MouseEvent) {
      if (panelColor.current && !panelColor.current.contains(e.target as Node)) setAbrirColor(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abrirColor])

  const puestos  = huecos.filter(Boolean) as string[]
  const completa = puestos.length === tamano
  const analisis = useMemo(() => analizarPaleta(puestos), [puestos])

  // Catálogo filtrado: texto, familia y color. El filtro de color usa el mismo
  // criterio que la búsqueda del listado, para que lo que ves aquí sea lo que
  // luego encontrará la gente por ese tono.
  const lista = useMemo(() => {
    let base = q.trim() ? buscarBloques(q) : BLOQUES
    if (familia) base = base.filter(b => b.fam === familia)
    if (neutro) base = base.filter(b => b.s < SAT_MIN)
    else if (tono !== null) base = base.filter(b => b.s >= SAT_MIN && distanciaTono(b.h, tono) <= TOL_TONO)
    return base
  }, [q, familia, tono, neutro])

  function cambiarTamano(n: number) {
    setTamano(n)
    // Se conserva lo ya elegido: cambiar de 12 a 6 no debe borrar el trabajo,
    // solo recortar lo que ya no cabe.
    setHuecos(prev => {
      const siguiente = Array(n).fill(null) as (string | null)[]
      prev.filter(Boolean).slice(0, n).forEach((b, i) => { siguiente[i] = b })
      return siguiente
    })
    setActivo(0)
  }

  function poner(b: BloquePaleta) {
    setError(null)
    setHuecos(prev => {
      const yaEsta = prev.indexOf(b.id)
      if (yaEsta !== -1) {
        // Segundo toque en el mismo bloque: lo quita.
        const siguiente = [...prev]
        siguiente[yaEsta] = null
        setActivo(yaEsta)
        return siguiente
      }
      const destino = prev[activo] === null ? activo : prev.findIndex(x => x === null)
      if (destino === -1) return prev            // paleta llena
      const siguiente = [...prev]
      siguiente[destino] = b.id
      const libre = siguiente.findIndex(x => x === null)
      setActivo(libre === -1 ? destino : libre)
      return siguiente
    })
  }

  function vaciarHueco(i: number) {
    setHuecos(prev => {
      const siguiente = [...prev]
      siguiente[i] = null
      return siguiente
    })
    setActivo(i)
  }

  // ── Reordenar arrastrando ───────────────────────────────────────────────────
  // El orden es parte del diseño de la paleta (es el que verá la gente), así que
  // hay que poder llevarse un bloque del puesto 2 al 4 sin rehacerla.
  //
  // INTERCAMBIA los dos huecos, no reordena la lista. Reordenando (sacar y meter,
  // como una lista normal) los bloques de en medio corren un puesto, y en una
  // rejilla de 3×3 eso se ve como si se hubiera movido media paleta cuando solo
  // querías cambiar uno de sitio.
  //
  // Va con eventos de puntero, no con la API de drag & drop de HTML: esa no
  // existe en táctil. Y como el mismo gesto sirve para quitar un bloque (un
  // toque), hace falta un umbral de unos píxeles para saber si has arrastrado o
  // solo has tocado.
  const arrastre = useRef<{ origen: number; x: number; y: number; movido: boolean } | null>(null)
  const [origenArrastre, setOrigenArrastre] = useState<number | null>(null)
  const [destinoArrastre, setDestinoArrastre] = useState<number | null>(null)
  // Bloque «fantasma» que sigue al puntero: sin él no se ve lo que llevas en la
  // mano y el gesto parece que no hace nada hasta que sueltas.
  const [fantasma, setFantasma] = useState<{ id: string; x: number; y: number; lado: number } | null>(null)

  // Qué hueco hay bajo el dedo, por geometría y no con elementFromPoint: el
  // hit-testing devuelve lo que se ve, y lo que se ve bajo el puntero puede ser
  // cualquier otra cosa (el propio bloque que arrastras, un overlay). Comparar
  // con los rectángulos es igual de barato — son 12 como mucho — y no falla.
  function huecoBajoElPunto(x: number, y: number): number | null {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-hueco]'))) {
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const n = Number(el.dataset.hueco)
        if (Number.isInteger(n)) return n
      }
    }
    return null
  }

  function intercambiar(a: number, b: number) {
    setHuecos(prev => {
      const siguiente = [...prev]
      const guarda = siguiente[a]
      siguiente[a] = siguiente[b]
      siguiente[b] = guarda
      return siguiente
    })
    setActivo(b)
  }

  function soltarArrastre() {
    arrastre.current = null
    setOrigenArrastre(null)
    setDestinoArrastre(null)
    setFantasma(null)
  }

  function alPulsarHueco(e: React.PointerEvent, i: number) {
    if (!huecos[i]) { setActivo(i); return }   // un hueco vacío solo se apunta
    arrastre.current = { origen: i, x: e.clientX, y: e.clientY, movido: false }
    // Capturar el puntero mantiene los eventos en este botón aunque el dedo se
    // salga de él. Si el navegador no puede (o el puntero ya no está activo) no
    // pasa nada grave: el arrastre sigue funcionando mientras no salgas de la
    // rejilla, así que no hay que dejar que reviente el gesto entero.
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* da igual */ }
  }

  function alMoverPuntero(e: React.PointerEvent) {
    const a = arrastre.current
    if (!a) return
    const id = huecos[a.origen]
    if (!a.movido) {
      if (Math.hypot(e.clientX - a.x, e.clientY - a.y) < 6) return
      a.movido = true
      setOrigenArrastre(a.origen)
    }
    setDestinoArrastre(huecoBajoElPunto(e.clientX, e.clientY))
    if (id) {
      // El lado se mide del propio hueco: así el fantasma es del tamaño real
      // que tiene la rejilla en ese momento, que depende del ancho disponible.
      const lado = e.currentTarget.getBoundingClientRect().width
      setFantasma({ id, x: e.clientX, y: e.clientY, lado })
    }
  }

  function alSoltarHueco(e: React.PointerEvent, i: number) {
    const a = arrastre.current
    soltarArrastre()
    if (!a) return
    if (!a.movido) { vaciarHueco(i); return }  // no llegó a ser un arrastre: era un toque
    const destino = huecoBajoElPunto(e.clientX, e.clientY)
    if (destino !== null && destino !== a.origen) intercambiar(a.origen, destino)
  }

  function barajar() {
    // Rellena los huecos que falten con bloques al azar de lo que hay filtrado:
    // es la forma más rápida de salir de un bloqueo creativo.
    const disponibles = lista.filter(b => !huecos.includes(b.id))
    if (disponibles.length === 0) return
    setHuecos(prev => prev.map(x => {
      if (x) return x
      const i = Math.floor(Math.random() * disponibles.length)
      return disponibles.splice(i, 1)[0]?.id ?? null
    }))
  }

  async function enviar() {
    setError(null)
    if (!completa) { setError(`Te faltan ${tamano - puestos.length} bloques.`); return }
    if (titulo.trim().length < 3) { setError('Ponle un título de al menos 3 caracteres.'); return }

    setEnviando(true)
    const r = await publicarPaleta({ titulo: titulo.trim(), descripcion: descripcion.trim(), bloques: puestos })
    setEnviando(false)
    if (r.error) { setError(r.error); return }
    irA(`/herramientas/paletas/${r.slug}`)
  }

  const cols = columnasDe(tamano)
  const colorActivo = tono !== null || neutro

  return (
    <div className="min-h-full p-4 sm:p-5">
      <div className="grid lg:grid-cols-[minmax(0,340px)_1fr] gap-6">

        {/* ── Izquierda: la paleta ── */}
        <div className="lg:sticky lg:top-0 self-start">
          {/* Tamaño */}
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center h-10 p-1 rounded-[10px] bg-panel border border-borde">
              {TAMANOS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => cambiarTamano(n)}
                  className={cn(
                    'h-8 px-3 rounded-lg text-sm font-medium transition-colors',
                    tamano === n ? 'bg-naranja/15 text-naranja' : 'text-texto3 hover:text-texto',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="text-xs text-texto3">bloques</span>
            <button
              type="button"
              onClick={barajar}
              title="Rellenar los huecos con bloques al azar de lo que hay filtrado"
              className="ml-auto h-10 px-3 rounded-[10px] bg-panel border border-borde text-sm text-texto2 hover:text-texto hover:border-[#3A3A3F] transition-colors"
            >
              Al azar
            </button>
          </div>

          {/* Huecos */}
          <div style={{ containerType: 'inline-size' }} className="w-full">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                fontSize: `calc((100cqw - ${(cols - 1) * 4}px) / ${cols})`,
              }}
            >
              {huecos.map((id, i) => {
                const estilo = id ? estiloBloque(id) : null
                return (
                  <button
                    key={i}
                    type="button"
                    data-hueco={i}
                    onPointerDown={e => alPulsarHueco(e, i)}
                    onPointerMove={alMoverPuntero}
                    onPointerUp={e => alSoltarHueco(e, i)}
                    onPointerCancel={soltarArrastre}
                    title={id ? `${nombreBloque(id)} — arrastra para cambiarlo de sitio, toca para quitarlo` : 'Hueco vacío'}
                    // touch-none: sin esto, arrastrar en el móvil desplaza la
                    // página en vez de mover el bloque.
                    className={cn(
                      'relative rounded-md transition-all touch-none',
                      !id && 'border-2 border-dashed',
                      !id && (activo === i ? 'border-naranja bg-naranja/5' : 'border-borde'),
                      id && activo === i && 'ring-2 ring-naranja',
                      origenArrastre === i && 'opacity-40',
                      destinoArrastre === i && origenArrastre !== null && origenArrastre !== i && 'ring-2 ring-naranja scale-105',
                    )}
                    style={{ width: '1em', height: '1em', ...(estilo ?? {}) }}
                  >
                    {!id && (
                      <span className="absolute inset-0 flex items-center justify-center text-[#3A3A3F] text-[0.3em] leading-none">＋</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resumen de color */}
          <div className="mt-3 flex items-center gap-2 text-xs text-texto3 min-h-[20px]">
            {puestos.length > 0 && (
              <>
                <span className="w-4 h-4 rounded border border-black/40" style={{ background: analisis.hex }} />
                <span>{analisis.hex}</span>
                {analisis.tonos.length > 0 && (
                  <span className="truncate">· {[...new Set(analisis.tonos.map(nombreTono))].slice(0, 3).join(', ')}</span>
                )}
                {analisis.neutro && <span>· neutros</span>}
              </>
            )}
          </div>

          {/* Datos */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-texto3 mb-1">Título</label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={80}
                placeholder='Ej. "Medieval de piedra y roble"'
                className="w-full h-10 px-3 rounded-[10px] bg-panel border border-borde text-sm text-texto placeholder:text-[#52525A] focus:border-naranja outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-texto3 mb-1">
                Descripción <span className="text-[#3A3A3F]">(opcional)</span>
              </label>
              <textarea
                value={descripcion}
                onChange={e => setDesc(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Para qué sirve, en qué bioma queda bien, qué bloque es el protagonista…"
                className="w-full px-3 py-2 rounded-[10px] bg-panel border border-borde text-sm text-texto placeholder:text-[#52525A] focus:border-naranja outline-none resize-none"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-[#E8776B]">{error}</p>}

          {logueado === false ? (
            <div className="mt-4 p-3 rounded-[10px] border border-borde bg-panel text-center">
              <p className="text-sm text-texto2">Necesitas una cuenta para publicar la paleta.</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => irA('/auth/login')}
                  className="h-9 px-3 rounded-[10px] bg-naranja text-white text-sm font-semibold hover:bg-[#e07018] transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => irA('/auth/registro')}
                  className="h-9 px-3 rounded-[10px] bg-panel border border-borde text-sm text-texto2 hover:text-texto transition-colors"
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={enviar}
              disabled={enviando || !completa || logueado === null}
              className="mt-4 w-full h-11 rounded-[10px] bg-naranja text-white text-sm font-semibold hover:bg-[#e07018] transition-colors disabled:opacity-50 disabled:hover:bg-naranja"
            >
              {enviando
                ? (admin ? 'Publicando…' : 'Enviando…')
                : completa
                  ? (admin ? 'Publicar' : 'Enviar a revisión')
                  : `Elige ${tamano - puestos.length} bloque${tamano - puestos.length === 1 ? '' : 's'} más`}
            </button>
          )}
          <p className="mt-2 text-[11px] text-[#52525A] leading-relaxed">
            {admin
              ? 'Como admin, tu paleta se publica al momento y no pasa por la cola de revisión.'
              : 'Las paletas pasan una revisión rápida antes de publicarse. Cuando se apruebe te llega una notificación y ganas XP.'}
          </p>

          {/* Mis paletas */}
          {mias.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-texto2 mb-2">Mis paletas</p>
              <div className="grid grid-cols-3 gap-2">
                {mias.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => irA(`/herramientas/paletas/${p.slug}`)}
                    className="group text-left rounded-lg border border-borde bg-panel p-1.5 hover:border-[#3A3A3F] transition-colors"
                    title={p.titulo}
                  >
                    <PaletaPreview bloques={p.bloques} redondeo="rounded" />
                    <span className={cn('mt-1 block text-[9px] px-1 py-0.5 rounded-full border text-center truncate', ESTADO_STYLE[p.estado])}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Derecha: catálogo ── */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Color */}
            <div className="relative" ref={panelColor}>
              <button
                type="button"
                onClick={() => setAbrirColor(o => !o)}
                className={cn(
                  'h-10 px-3.5 rounded-[10px] text-sm font-medium border inline-flex items-center gap-2 transition-colors',
                  colorActivo
                    ? 'bg-naranja/10 border-naranja/40 text-naranja'
                    : 'bg-panel border-borde text-texto2 hover:text-texto hover:border-[#3A3A3F]',
                )}
              >
                {tono !== null ? (
                  <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ background: `hsl(${tono} 70% 50%)` }} />
                ) : neutro ? (
                  <span className="w-3.5 h-3.5 rounded-full border border-black/30 bg-gradient-to-br from-white to-[#3A3A3F]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full" style={{ background: 'conic-gradient(hsl(0 70% 50%), hsl(90 70% 50%), hsl(180 70% 50%), hsl(270 70% 50%), hsl(360 70% 50%))' }} />
                )}
                {tono !== null ? nombreTono(tono) : neutro ? 'Neutros' : 'Color'}
              </button>

              {abrirColor && (
                <div className="absolute left-0 top-12 z-30 p-4 rounded-2xl bg-panel border border-borde shadow-2xl shadow-black/50">
                  <RuedaColor
                    tono={tono}
                    neutro={neutro}
                    onChange={({ tono: t, neutro: nu }) => { setTono(t); setNeutro(nu) }}
                  />
                </div>
              )}
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar bloque (deepslate, roble, hormigón…)"
                className="w-full h-10 pl-3.5 pr-9 rounded-[10px] bg-panel border border-borde text-sm text-texto placeholder:text-[#52525A] focus:border-naranja outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525A] hover:text-texto"
                  aria-label="Limpiar"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs text-[#52525A]">{lista.length}</span>
          </div>

          {/* Familias */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setFamilia(null)}
              className={cn(
                'h-7 px-2.5 rounded-full text-xs border transition-colors',
                familia === null ? 'bg-naranja/12 border-naranja/40 text-naranja' : 'bg-panel border-borde text-texto3 hover:text-texto',
              )}
            >
              Todo
            </button>
            {FAMILIAS.map(fam => (
              <button
                key={fam.id}
                type="button"
                onClick={() => setFamilia(f => (f === fam.id ? null : fam.id))}
                className={cn(
                  'h-7 px-2.5 rounded-full text-xs border transition-colors',
                  familia === fam.id ? 'bg-naranja/12 border-naranja/40 text-naranja' : 'bg-panel border-borde text-texto3 hover:text-texto',
                )}
              >
                {fam.label}
              </button>
            ))}
          </div>

          {/* Rejilla del catálogo */}
          {lista.length === 0 ? (
            <p className="py-12 text-center text-sm text-texto3">Ningún bloque con ese filtro.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1.5">
              {lista.map(b => {
                const elegido = huecos.includes(b.id)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => poner(b)}
                    title={`${nombreBloque(b.id)} · ${b.hex}`}
                    className={cn(
                      'relative aspect-square rounded-md overflow-hidden transition-all',
                      elegido ? 'ring-2 ring-naranja scale-95' : 'ring-1 ring-borde hover:ring-naranja/60 hover:scale-105',
                    )}
                    // El botón hace de contenedor para que el sprite de dentro
                    // pueda medir 1em = su ancho, sea el que sea (rejilla
                    // auto-fill). `text-[52px]` es el respaldo sin cqw.
                    style={{ containerType: 'inline-size' }}
                  >
                    <span className="block text-[52px]" style={{ ...estiloBloque(b.id), fontSize: '100cqw' }} />
                    {elegido && (
                      <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-naranja text-[9px] text-white flex items-center justify-center font-bold">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* El bloque que llevas en la mano. Va en `fixed` y fuera de la rejilla
          para no empujar nada, y con pointer-events desactivados para no taparse
          a sí mismo el hueco que hay debajo. */}
      {fantasma && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 rounded-md ring-2 ring-naranja shadow-lg shadow-black/50"
          style={{
            ...estiloBloque(fantasma.id),
            fontSize: fantasma.lado,
            left: fantasma.x,
            top: fantasma.y,
            transform: 'translate(-50%, -50%) scale(1.08)',
            opacity: 0.92,
          }}
        />
      )}
    </div>
  )
}
