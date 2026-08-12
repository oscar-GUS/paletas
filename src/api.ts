// Puente con MineLite.
//
// La app se sirve desde /tools/paletas/ del propio dominio, así que estas
// llamadas son del MISMO ORIGEN: la cookie de sesión viaja sola y el servidor
// sabe quién está creando la paleta. No hay tokens ni claves aquí.
//
// En `npm run dev` suelto (localhost:5173) el proxy de Vite manda /api a
// MineLite en local; si no está levantado, la app funciona igual pero en modo
// invitado (se puede montar la paleta, no publicarla).

export interface PaletaMia {
  id:         string
  slug:       string
  titulo:     string
  bloques:    string[]
  estado:     'pendiente' | 'aprobada' | 'rechazada'
  motivo:     string | null
  created_at: string
}

export interface Sesion {
  logueado: boolean
  paletas:  PaletaMia[]
}

export async function cargarSesion(): Promise<Sesion> {
  try {
    const r = await fetch('/api/paletas/mias', { credentials: 'same-origin' })
    if (!r.ok) return { logueado: false, paletas: [] }
    return await r.json()
  } catch {
    return { logueado: false, paletas: [] }
  }
}

export async function publicarPaleta(datos: {
  titulo: string
  descripcion: string
  bloques: string[]
}): Promise<{ slug?: string; error?: string }> {
  try {
    const r = await fetch('/api/paletas', {
      method:      'POST',
      credentials: 'same-origin',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(datos),
    })
    const json = await r.json().catch(() => ({}))
    if (!r.ok) return { error: json.error ?? 'No se ha podido guardar la paleta.' }
    return { slug: json.slug }
  } catch {
    return { error: 'Sin conexión con MineLite.' }
  }
}

/** Navega la página que contiene el iframe (o la propia, en modo suelto). */
export function irA(ruta: string): void {
  if (window.parent !== window) {
    // El padre es MineLite: que navegue él, así la URL de arriba es la buena.
    window.parent.postMessage({ fuente: 'paletas', tipo: 'navegar', ruta }, window.location.origin)
  } else {
    window.location.href = ruta
  }
}
