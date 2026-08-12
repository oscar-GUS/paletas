// Nombre legible en español de cada bloque para la lista de materiales.
// Mismo enfoque que blockColors: exactos frecuentes + familias (tintes, maderas)
// + respaldo que "embellece" el id.

import { baseName } from './blockColors'

const COLOR_ES: Record<string, string> = {
  white: 'blanco', orange: 'naranja', magenta: 'magenta', light_blue: 'azul claro',
  yellow: 'amarillo', lime: 'lima', pink: 'rosa', gray: 'gris', light_gray: 'gris claro',
  cyan: 'cian', purple: 'morado', blue: 'azul', brown: 'marrón', green: 'verde',
  red: 'rojo', black: 'negro',
}
const COLOR_KEYS = Object.keys(COLOR_ES)

// Sufijo (material) -> nombre ES para la familia de tintes
const DYE_MATERIAL_ES: Array<[string, string]> = [
  ['concrete_powder', 'Hormigón en polvo'], ['concrete', 'Hormigón'],
  ['glazed_terracotta', 'Terracota vidriada'], ['terracotta', 'Terracota'],
  ['stained_glass_pane', 'Panel de vidrio tintado'], ['stained_glass', 'Vidrio tintado'],
  ['shulker_box', 'Caja shulker'], ['wool', 'Lana'], ['carpet', 'Alfombra'],
  ['bed', 'Cama'], ['banner', 'Estandarte'], ['candle', 'Vela'],
]

const WOOD_ES: Record<string, string> = {
  oak: 'roble', spruce: 'abeto', birch: 'abedul', jungle: 'jungla', acacia: 'acacia',
  dark_oak: 'roble oscuro', mangrove: 'mangle', cherry: 'cerezo', bamboo: 'bambú',
  crimson: 'carmesí', warped: 'distorsionado',
}
const WOOD_KEYS = Object.keys(WOOD_ES)

// Sufijo (material) -> nombre ES para la familia de maderas
const WOOD_MATERIAL_ES: Array<[string, string]> = [
  ['pressure_plate', 'Placa de presión'], ['fence_gate', 'Puerta de valla'],
  ['trapdoor', 'Trampilla'], ['planks', 'Tablones'], ['stairs', 'Escaleras'],
  ['slab', 'Losa'], ['fence', 'Valla'], ['door', 'Puerta'], ['button', 'Botón'],
  ['sign', 'Cartel'], ['leaves', 'Hojas'], ['sapling', 'Brote'], ['log', 'Tronco'],
  ['wood', 'Madera'], ['stem', 'Tallo'], ['hyphae', 'Hifa'], ['fungus', 'Hongo'],
]

const EXACT_ES: Record<string, string> = {
  air: 'Aire',
  stone: 'Piedra', granite: 'Granito', diorite: 'Diorita', andesite: 'Andesita',
  polished_granite: 'Granito pulido', polished_diorite: 'Diorita pulida', polished_andesite: 'Andesita pulida',
  cobblestone: 'Adoquín', mossy_cobblestone: 'Adoquín musgoso', stone_bricks: 'Ladrillos de piedra',
  mossy_stone_bricks: 'Ladrillos de piedra musgosos', cracked_stone_bricks: 'Ladrillos de piedra agrietados',
  chiseled_stone_bricks: 'Ladrillos de piedra cincelados', smooth_stone: 'Piedra lisa', bricks: 'Ladrillos',
  deepslate: 'Pizarra profunda', cobbled_deepslate: 'Pizarra profunda adoquinada',
  polished_deepslate: 'Pizarra profunda pulida', deepslate_bricks: 'Ladrillos de pizarra profunda',
  deepslate_tiles: 'Baldosas de pizarra profunda', tuff: 'Toba', calcite: 'Calcita',
  dripstone_block: 'Bloque de espeleotema', bedrock: 'Roca madre', obsidian: 'Obsidiana',
  crying_obsidian: 'Obsidiana llorona', smooth_basalt: 'Basalto liso',
  dirt: 'Tierra', coarse_dirt: 'Tierra estéril', rooted_dirt: 'Tierra con raíces',
  grass_block: 'Bloque de hierba', podzol: 'Podzol', mycelium: 'Micelio', dirt_path: 'Camino de tierra',
  farmland: 'Tierra de cultivo', mud: 'Barro', packed_mud: 'Barro compacto', mud_bricks: 'Ladrillos de barro',
  clay: 'Arcilla', gravel: 'Grava', sand: 'Arena', red_sand: 'Arena roja',
  sandstone: 'Arenisca', smooth_sandstone: 'Arenisca lisa', cut_sandstone: 'Arenisca cortada',
  chiseled_sandstone: 'Arenisca cincelada', red_sandstone: 'Arenisca roja', moss_block: 'Bloque de musgo',
  coal_ore: 'Mena de carbón', deepslate_coal_ore: 'Mena de carbón (pizarra)', iron_ore: 'Mena de hierro',
  deepslate_iron_ore: 'Mena de hierro (pizarra)', copper_ore: 'Mena de cobre',
  deepslate_copper_ore: 'Mena de cobre (pizarra)', gold_ore: 'Mena de oro',
  deepslate_gold_ore: 'Mena de oro (pizarra)', redstone_ore: 'Mena de redstone',
  deepslate_redstone_ore: 'Mena de redstone (pizarra)', emerald_ore: 'Mena de esmeralda',
  deepslate_emerald_ore: 'Mena de esmeralda (pizarra)', lapis_ore: 'Mena de lapislázuli',
  deepslate_lapis_ore: 'Mena de lapislázuli (pizarra)', diamond_ore: 'Mena de diamante',
  deepslate_diamond_ore: 'Mena de diamante (pizarra)', ancient_debris: 'Restos antiguos',
  nether_quartz_ore: 'Mena de cuarzo del Nether', nether_gold_ore: 'Mena de oro del Nether',
  raw_iron_block: 'Bloque de hierro en bruto', raw_copper_block: 'Bloque de cobre en bruto',
  raw_gold_block: 'Bloque de oro en bruto',
  coal_block: 'Bloque de carbón', iron_block: 'Bloque de hierro', copper_block: 'Bloque de cobre',
  gold_block: 'Bloque de oro', redstone_block: 'Bloque de redstone', emerald_block: 'Bloque de esmeralda',
  lapis_block: 'Bloque de lapislázuli', diamond_block: 'Bloque de diamante', netherite_block: 'Bloque de netherita',
  quartz_block: 'Bloque de cuarzo', smooth_quartz: 'Cuarzo liso', quartz_bricks: 'Ladrillos de cuarzo',
  chiseled_quartz_block: 'Bloque de cuarzo cincelado', quartz_pillar: 'Columna de cuarzo',
  amethyst_block: 'Bloque de amatista', budding_amethyst: 'Amatista en gemación',
  redstone: 'Polvo de redstone', redstone_wire: 'Polvo de redstone', redstone_torch: 'Antorcha de redstone',
  redstone_lamp: 'Lámpara de redstone', repeater: 'Repetidor', comparator: 'Comparador',
  observer: 'Observador', piston: 'Pistón', sticky_piston: 'Pistón pegajoso', dropper: 'Soltador',
  dispenser: 'Dispensador', hopper: 'Tolva', lever: 'Palanca', target: 'Diana', tnt: 'TNT',
  slime_block: 'Bloque de slime', honey_block: 'Bloque de miel', note_block: 'Bloque musical',
  observer_block: 'Observador', daylight_detector: 'Sensor de luz solar', lectern: 'Atril',
  rail: 'Raíl', powered_rail: 'Raíl propulsor', detector_rail: 'Raíl detector', activator_rail: 'Raíl activador',
  lightning_rod: 'Pararrayos', sculk_sensor: 'Sensor de sculk', sculk: 'Sculk', sculk_catalyst: 'Catalizador de sculk',
  sculk_shrieker: 'Chillón de sculk',
  chest: 'Cofre', trapped_chest: 'Cofre trampa', barrel: 'Barril', crafting_table: 'Mesa de trabajo',
  furnace: 'Horno', blast_furnace: 'Alto horno', smoker: 'Ahumador', ender_chest: 'Cofre de Ender',
  bookshelf: 'Estantería', composter: 'Compostador', cauldron: 'Caldero', anvil: 'Yunque',
  grindstone: 'Piedra de afilar', smithing_table: 'Mesa de herrería', stonecutter: 'Cortador de piedra',
  loom: 'Telar', cartography_table: 'Mesa de cartografía', fletching_table: 'Mesa de flechería',
  beacon: 'Baliza', conduit: 'Conducto', bell: 'Campana', lodestone: 'Magnetita', respawn_anchor: 'Ancla de reaparición',
  snow: 'Nieve', snow_block: 'Bloque de nieve', powder_snow: 'Nieve polvo', ice: 'Hielo',
  packed_ice: 'Hielo compacto', blue_ice: 'Hielo azul', water: 'Agua', lava: 'Lava',
  netherrack: 'Roca del Nether', nether_bricks: 'Ladrillos del Nether', red_nether_bricks: 'Ladrillos rojos del Nether',
  nether_wart_block: 'Bloque de verruga del Nether', warped_wart_block: 'Bloque de verruga distorsionada',
  soul_sand: 'Arena de almas', soul_soil: 'Tierra de almas', magma_block: 'Bloque de magma',
  glowstone: 'Piedra luminosa', shroomlight: 'Champihongo', basalt: 'Basalto', polished_basalt: 'Basalto pulido',
  blackstone: 'Piedra negra', polished_blackstone: 'Piedra negra pulida',
  polished_blackstone_bricks: 'Ladrillos de piedra negra pulida', gilded_blackstone: 'Piedra negra dorada',
  end_stone: 'Piedra del End', end_stone_bricks: 'Ladrillos de piedra del End', purpur_block: 'Bloque de púrpura',
  purpur_pillar: 'Columna de púrpura', chorus_plant: 'Planta de chorus', chorus_flower: 'Flor de chorus',
  torch: 'Antorcha', soul_torch: 'Antorcha de almas', lantern: 'Farol', soul_lantern: 'Farol de almas',
  sea_lantern: 'Lámpara marina', glass: 'Vidrio', glass_pane: 'Panel de vidrio', tinted_glass: 'Vidrio polarizado',
  pumpkin: 'Calabaza', carved_pumpkin: 'Calabaza tallada', jack_o_lantern: 'Calabaza iluminada',
  melon: 'Sandía', hay_block: 'Bloque de heno', dried_kelp_block: 'Bloque de algas secas',
  sponge: 'Esponja', wet_sponge: 'Esponja húmeda', cactus: 'Cactus', sugar_cane: 'Caña de azúcar',
  vine: 'Enredadera', lily_pad: 'Nenúfar', short_grass: 'Hierba', tall_grass: 'Hierba alta',
  fern: 'Helecho', large_fern: 'Helecho grande', dead_bush: 'Arbusto seco', cobweb: 'Telaraña',
  scaffolding: 'Andamio', spawner: 'Generador de monstruos',
}

export function displayName(name: string): string {
  const base = baseName(name)

  const exact = EXACT_ES[base]
  if (exact) return exact

  // Familia de tintes
  for (const c of COLOR_KEYS) {
    if (base === c || base.startsWith(c + '_')) {
      const suffix = base.slice(c.length + 1)
      for (const [key, label] of DYE_MATERIAL_ES) {
        if (suffix.includes(key)) return `${label} · ${COLOR_ES[c]}`
      }
    }
  }

  // Familia de maderas
  const stripped = base.startsWith('stripped_')
  const woodBase = stripped ? base.slice('stripped_'.length) : base
  for (const w of WOOD_KEYS) {
    if (woodBase === w || woodBase.startsWith(w + '_')) {
      const suffix = woodBase.slice(w.length + 1)
      for (const [key, label] of WOOD_MATERIAL_ES) {
        if (suffix.includes(key)) {
          const mat = stripped && (key === 'log' || key === 'wood') ? `${label} pelado` : label
          return `${mat} de ${WOOD_ES[w]}`
        }
      }
    }
  }

  return prettify(base)
}

function prettify(base: string): string {
  const s = base.replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
