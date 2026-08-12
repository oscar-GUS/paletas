# Paletas de bloques

Creador de paletas de bloques de Minecraft: eliges 6, 9 o 12 bloques que quedan
bien juntos y lo publicas para la comunidad. Es una de las herramientas de
[MineLite](https://minelite.es/herramientas), donde se sirve desde
`/tools/paletas/` y se embebe por iframe en `/herramientas/paletas/crear`.

- Catálogo de ~300 bloques de construcción con su textura real y su nombre en
  español.
- Filtro por familia, por texto y por color: una rueda de tono continua, más un
  botón aparte para los neutros (grises, blancos y negros), que no tienen tono
  con el que buscarlos.
- Botón «al azar» para rellenar los huecos que falten con lo que haya filtrado.

El listado público, las fichas de cada paleta, los likes y la cola de revisión
NO están aquí: viven en MineLite, porque necesitan base de datos, sesión y SEO.
Esta app solo monta la paleta y la envía.

## Desarrollo

```bash
npm install
npm run dev
```

Las llamadas de guardado van a `/api/paletas` de MineLite; en desarrollo el
`server.proxy` de Vite las redirige a `http://localhost:3010`. Si MineLite no
está levantado la herramienta funciona igual, pero en modo invitado: se puede
montar la paleta y no publicarla.

## Ficheros compartidos

El catálogo de bloques (`src/lib/paletas/`), los nombres de bloque
(`src/lib/litematic/`) y los componentes que dibujan una paleta
(`src/components/paletas/`) **se generan en MineLite y llegan copiados**: es
donde está el atlas de texturas del que se hornean y donde los usan también el
listado y las fichas. No los edites aquí — se sobrescriben en cada publicación.
Para tocarlos, hazlo en minelite y vuelve a publicar.

El sprite `public/paletas-atlas.png` es la misma copia, y solo se usa en
desarrollo suelto: dentro de MineLite el iframe lo carga de la raíz del sitio.

## Publicar en MineLite

Desde la raíz del repo de minelite:

```bash
npm run tools:paletas
```

Copia los ficheros compartidos, reconstruye este proyecto y deja `dist/` en
`public/tools/paletas/`.
