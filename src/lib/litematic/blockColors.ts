// Color representativo de cada bloque para el render (colores planos).
// Estrategia: mapa exacto de bloques comunes + familias generadas (tintes, maderas,
// cobre) + respaldo determinista por hash. Así se cubre la gran mayoría de bloques
// TMC sin enumerarlos todos, y nada se queda sin color.

export interface BlockColor {
  r: number
  g: number
  b: number
  transparent: boolean
}

type RGB = [number, number, number]

/** Quita el namespace y las propiedades: "minecraft:oak_log[axis=y]" -> "oak_log". */
export function baseName(name: string): string {
  let n = name
  const colon = n.indexOf(':')
  if (colon !== -1) n = n.slice(colon + 1)
  const br = n.indexOf('[')
  if (br !== -1) n = n.slice(0, br)
  return n
}

// ── 16 colores de tinte de Minecraft ──────────────────────────────────────────
const DYE: Record<string, RGB> = {
  white: [233, 236, 236], orange: [240, 118, 19], magenta: [199, 78, 189], light_blue: [58, 175, 217],
  yellow: [248, 198, 39], lime: [112, 185, 25], pink: [237, 141, 172], gray: [62, 68, 71],
  light_gray: [142, 142, 134], cyan: [21, 119, 136], purple: [121, 42, 172], blue: [53, 57, 157],
  brown: [114, 71, 40], green: [84, 109, 27], red: [160, 39, 34], black: [25, 26, 31],
}
const DYE_KEYS = Object.keys(DYE)
const TERRACOTTA_BASE: RGB = [152, 94, 67]

// ── Maderas (color de tablones) ───────────────────────────────────────────────
const WOOD: Record<string, RGB> = {
  oak: [162, 130, 78], spruce: [114, 84, 48], birch: [196, 179, 123], jungle: [160, 115, 80],
  acacia: [168, 90, 50], dark_oak: [66, 43, 20], mangrove: [117, 54, 48], cherry: [226, 167, 168],
  bamboo: [193, 171, 76], crimson: [124, 55, 84], warped: [43, 104, 99],
}
const WOOD_KEYS = Object.keys(WOOD)

// ── Mapa exacto de bloques frecuentes ─────────────────────────────────────────
const EXACT: Record<string, RGB> = {
  // Piedra y variantes
  stone: [125, 125, 125], granite: [149, 103, 85], polished_granite: [154, 108, 90],
  diorite: [188, 188, 190], polished_diorite: [193, 193, 196], andesite: [136, 138, 138],
  polished_andesite: [148, 150, 149], cobblestone: [122, 121, 122], mossy_cobblestone: [110, 118, 95],
  stone_bricks: [122, 121, 122], mossy_stone_bricks: [114, 119, 100], cracked_stone_bricks: [118, 117, 116],
  chiseled_stone_bricks: [120, 119, 118], smooth_stone: [158, 158, 158], bricks: [150, 97, 83],
  deepslate: [80, 80, 84], cobbled_deepslate: [77, 77, 81], polished_deepslate: [72, 72, 76],
  deepslate_bricks: [70, 70, 74], deepslate_tiles: [60, 60, 64], chiseled_deepslate: [66, 66, 70],
  tuff: [108, 109, 102], calcite: [223, 224, 220], dripstone_block: [134, 105, 90],
  bedrock: [85, 85, 85], obsidian: [20, 16, 32], crying_obsidian: [37, 13, 60],
  netherite_block: [66, 61, 63], smooth_basalt: [73, 74, 80],
  // Tierra y naturaleza
  dirt: [134, 96, 67], coarse_dirt: [119, 85, 59], rooted_dirt: [144, 103, 78],
  grass_block: [110, 150, 70], podzol: [91, 64, 33], mycelium: [111, 99, 100],
  dirt_path: [148, 122, 65], farmland: [97, 64, 36], mud: [60, 56, 60],
  packed_mud: [142, 105, 78], mud_bricks: [137, 105, 80], clay: [159, 164, 177],
  gravel: [131, 127, 126], sand: [219, 207, 163], red_sand: [190, 102, 33],
  sandstone: [216, 203, 157], smooth_sandstone: [219, 206, 160], cut_sandstone: [217, 204, 158],
  chiseled_sandstone: [215, 202, 156], red_sandstone: [186, 99, 29], moss_block: [89, 109, 45],
  // Menas
  coal_ore: [115, 115, 115], deepslate_coal_ore: [74, 74, 78], iron_ore: [136, 130, 122],
  deepslate_iron_ore: [98, 96, 95], copper_ore: [125, 128, 116], deepslate_copper_ore: [92, 96, 91],
  gold_ore: [145, 137, 103], deepslate_gold_ore: [104, 99, 78], redstone_ore: [133, 107, 107],
  deepslate_redstone_ore: [94, 78, 78], emerald_ore: [109, 145, 117], deepslate_emerald_ore: [82, 110, 90],
  lapis_ore: [107, 118, 140], deepslate_lapis_ore: [79, 91, 110], diamond_ore: [114, 137, 137],
  deepslate_diamond_ore: [86, 104, 105], nether_gold_ore: [123, 58, 47], nether_quartz_ore: [120, 76, 70],
  ancient_debris: [94, 67, 56], raw_iron_block: [166, 134, 105], raw_copper_block: [154, 105, 75],
  raw_gold_block: [180, 147, 53],
  // Bloques de mineral
  coal_block: [16, 16, 16], iron_block: [220, 220, 220], copper_block: [192, 107, 79],
  exposed_copper: [161, 125, 104], weathered_copper: [108, 153, 122], oxidized_copper: [82, 162, 132],
  gold_block: [246, 208, 61], redstone_block: [175, 24, 5], emerald_block: [42, 203, 87],
  lapis_block: [38, 67, 137], diamond_block: [108, 224, 217], netherite_scrap: [110, 80, 70],
  quartz_block: [235, 229, 222], smooth_quartz: [236, 230, 224], quartz_bricks: [233, 227, 219],
  chiseled_quartz_block: [231, 225, 217], quartz_pillar: [234, 228, 221], amethyst_block: [134, 97, 197],
  budding_amethyst: [125, 90, 185],
  // Redstone
  redstone_wire: [175, 24, 5], redstone_torch: [205, 60, 40], redstone_lamp: [124, 78, 44],
  repeater: [160, 154, 150], comparator: [165, 159, 155], observer: [98, 98, 98],
  piston: [140, 124, 98], sticky_piston: [120, 134, 88], piston_head: [150, 130, 95],
  dropper: [108, 108, 108], dispenser: [108, 108, 108], hopper: [70, 70, 74],
  lever: [120, 110, 95], target: [225, 205, 195], slime_block: [110, 187, 95],
  honey_block: [230, 165, 56], tnt: [180, 60, 50], note_block: [98, 64, 42],
  jukebox: [101, 70, 54], daylight_detector: [130, 116, 92], lectern: [156, 124, 71],
  rail: [140, 124, 96], powered_rail: [160, 130, 80], detector_rail: [150, 120, 95],
  activator_rail: [150, 120, 95], lightning_rod: [160, 100, 75], sculk_sensor: [29, 72, 81],
  calibrated_sculk_sensor: [33, 78, 88], sculk: [13, 28, 33], sculk_catalyst: [30, 40, 44],
  sculk_shrieker: [60, 70, 55],
  // Almacenamiento / utilidad
  chest: [162, 124, 64], trapped_chest: [162, 124, 64], barrel: [124, 96, 55],
  crafting_table: [124, 86, 52], furnace: [104, 104, 104], blast_furnace: [92, 92, 96],
  smoker: [92, 80, 72], ender_chest: [42, 60, 60], bookshelf: [121, 93, 56],
  composter: [104, 76, 43], cauldron: [70, 70, 74], anvil: [73, 73, 73],
  grindstone: [120, 120, 122], smithing_table: [62, 62, 72], stonecutter: [108, 104, 100],
  loom: [148, 121, 78], cartography_table: [110, 86, 60], fletching_table: [180, 162, 110],
  beacon: [120, 222, 217], conduit: [148, 130, 100], bell: [216, 174, 60],
  lodestone: [110, 110, 116], respawn_anchor: [62, 22, 110], spawner: [44, 56, 66],
  // Nieve / hielo
  snow: [243, 250, 250], snow_block: [243, 250, 250], powder_snow: [240, 246, 248],
  ice: [145, 183, 246], packed_ice: [141, 180, 246], blue_ice: [116, 168, 252], frosted_ice: [140, 178, 240],
  // Líquidos
  water: [60, 110, 220], lava: [222, 110, 30],
  // Nether
  netherrack: [97, 38, 38], nether_bricks: [44, 22, 26], red_nether_bricks: [69, 9, 11],
  nether_wart_block: [114, 7, 8], warped_wart_block: [22, 119, 120], soul_sand: [85, 65, 53],
  soul_soil: [92, 71, 57], magma_block: [142, 65, 35], glowstone: [171, 131, 84],
  shroomlight: [240, 146, 70], basalt: [73, 73, 80], polished_basalt: [86, 86, 92],
  blackstone: [42, 36, 41], polished_blackstone: [53, 49, 58], polished_blackstone_bricks: [48, 44, 52],
  gilded_blackstone: [73, 53, 44],
  // End
  end_stone: [219, 222, 158], end_stone_bricks: [218, 224, 162], purpur_block: [169, 125, 169],
  purpur_pillar: [171, 128, 171], end_rod: [225, 222, 210], chorus_plant: [90, 62, 90],
  chorus_flower: [151, 118, 151], dragon_egg: [22, 12, 28],
  // Luz / decoración
  torch: [240, 200, 90], soul_torch: [80, 200, 215], lantern: [205, 150, 75],
  soul_lantern: [90, 190, 205], sea_lantern: [200, 225, 215], froglight: [220, 215, 160],
  ochre_froglight: [240, 222, 150], verdant_froglight: [190, 220, 150], pearlescent_froglight: [235, 205, 220],
  // Naturaleza varia
  pumpkin: [197, 120, 28], carved_pumpkin: [197, 120, 28], jack_o_lantern: [214, 145, 40],
  melon: [110, 160, 40], hay_block: [165, 139, 12], dried_kelp_block: [50, 56, 44],
  sponge: [197, 192, 75], wet_sponge: [150, 158, 70], cactus: [85, 127, 44],
  bamboo_block: [148, 160, 60], sugar_cane: [148, 192, 101], vine: [60, 100, 35],
  lily_pad: [42, 95, 38], short_grass: [108, 152, 64], tall_grass: [108, 152, 64],
  fern: [104, 148, 62], large_fern: [104, 148, 62], dead_bush: [129, 95, 41],
  cobweb: [220, 224, 228],
  // Vidrio
  glass: [202, 226, 237], glass_pane: [202, 226, 237], tinted_glass: [42, 36, 48],
}

// ── Bloques translúcidos (afectan al culling de caras) ─────────────────────────
const TRANSPARENT = new Set([
  'slime_block', 'honey_block', 'ice', 'packed_ice', 'blue_ice', 'frosted_ice',
  'water', 'bubble_column', 'nether_portal', 'cobweb', 'spawner',
])

function isTransparent(base: string): boolean {
  return base.includes('glass') || TRANSPARENT.has(base)
}

// ── Bloques legacy (pre-1.13) con el color en una propiedad, no en el id ─────────
// Los schematics antiguos llegan como `minecraft:concrete[color=black]` en vez de
// `minecraft:black_concrete`. Remapea al id moderno; devuelve el base sin tocar si no aplica.
const LEGACY_COLORED: Record<string, (c: string) => string> = {
  concrete:               c => `${c}_concrete`,
  concrete_powder:        c => `${c}_concrete_powder`,
  wool:                   c => `${c}_wool`,
  carpet:                 c => `${c}_carpet`,
  stained_glass:          c => `${c}_stained_glass`,
  stained_glass_pane:     c => `${c}_stained_glass_pane`,
  stained_hardened_clay:  c => `${c}_terracotta`,
}

export function normalizeLegacy(base: string, properties?: Record<string, string>): string {
  const color = properties?.color
  if (color && DYE[color] && LEGACY_COLORED[base]) return LEGACY_COLORED[base](color)
  if (base === 'hardened_clay') return 'terracotta'
  return base
}

// ── Resolución de color ────────────────────────────────────────────────────────
const cache = new Map<string, BlockColor>()

export function getBlockColor(name: string, properties?: Record<string, string>): BlockColor {
  const base = normalizeLegacy(baseName(name), properties)
  const cached = cache.get(base)
  if (cached) return cached

  const rgb = resolveRGB(base)
  const color: BlockColor = { r: rgb[0], g: rgb[1], b: rgb[2], transparent: isTransparent(base) }
  cache.set(base, color)
  return color
}

function resolveRGB(base: string): RGB {
  // 1) Mapa exacto
  const exact = EXACT[base]
  if (exact) return exact

  // 2) Cobre (incl. cut/waxed/oxidación)
  if (base.includes('copper')) return copperColor(base)

  // 3) Familia de tintes (lana, hormigón, terracota, vidrio tintado, alfombra...)
  for (const c of DYE_KEYS) {
    if (base === c || base.startsWith(c + '_')) {
      return dyeColor(c, base.slice(c.length + 1))
    }
  }

  // 4) Familia de maderas (tablones, troncos, escaleras, losas, hojas...)
  const woodBase = base.startsWith('stripped_') ? base.slice('stripped_'.length) : base
  for (const w of WOOD_KEYS) {
    if (woodBase === w || woodBase.startsWith(w + '_')) {
      return woodColor(w, woodBase.slice(w.length + 1))
    }
  }

  // 5) Respaldo determinista por hash
  return hashColor(base)
}

function copperColor(base: string): RGB {
  if (base.includes('oxidized')) return [82, 162, 132]
  if (base.includes('weathered')) return [108, 153, 122]
  if (base.includes('exposed')) return [161, 125, 104]
  return [192, 107, 79]
}

function dyeColor(color: string, suffix: string): RGB {
  const dye = DYE[color]
  if (suffix.includes('terracotta')) return mix(dye, TERRACOTTA_BASE, 0.55)
  if (suffix.includes('concrete_powder')) return lighten(dye, 0.18)
  if (suffix.includes('glass')) return lighten(dye, 0.1)
  return dye
}

function woodColor(wood: string, suffix: string): RGB {
  const c = WOOD[wood]
  if (suffix.includes('leaves')) return leavesColor(wood)
  if (suffix.includes('log') || suffix.includes('wood') || suffix.includes('stem') || suffix.includes('hyphae')) {
    return darken(c, 0.2)
  }
  return c
}

function leavesColor(wood: string): RGB {
  if (wood === 'cherry') return [231, 169, 197]
  if (wood === 'birch') return [128, 167, 85]
  if (wood === 'spruce') return [78, 105, 78]
  return [60, 105, 40]
}

// ── Utilidades de color ────────────────────────────────────────────────────────
function clamp(v: number): number { return v < 0 ? 0 : v > 255 ? 255 : Math.round(v) }
function mix(a: RGB, b: RGB, t: number): RGB {
  return [clamp(a[0] * (1 - t) + b[0] * t), clamp(a[1] * (1 - t) + b[1] * t), clamp(a[2] * (1 - t) + b[2] * t)]
}
function lighten(c: RGB, t: number): RGB { return mix(c, [255, 255, 255], t) }
function darken(c: RGB, t: number): RGB { return mix(c, [0, 0, 0], t) }

/** Color estable para bloques no mapeados (tono pastel a partir del nombre). */
function hashColor(base: string): RGB {
  let h = 0
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0
  const hue = (h >>> 0) % 360
  return hslToRgb(hue / 360, 0.45, 0.6)
}

function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) { const v = clamp(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    clamp(hue2rgb(p, q, h + 1 / 3) * 255),
    clamp(hue2rgb(p, q, h) * 255),
    clamp(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}
function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

export function toHex(c: BlockColor): string {
  const h = (v: number) => v.toString(16).padStart(2, '0')
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`
}
