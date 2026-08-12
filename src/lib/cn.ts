// Utilidad para combinar clases Tailwind sin conflictos
// Combina clsx (condicionales) con tailwind-merge (deduplicación)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
