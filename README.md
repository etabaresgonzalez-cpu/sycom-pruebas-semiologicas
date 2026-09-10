# SyCOM · Atlas de pruebas semiológicas

Sitio web estático, listo para GitHub Pages.

## Estructura
- `index.html` — interfaz principal.
- `css/styles.css` — diseño responsive.
- `js/app.js` — buscador, filtros, favoritos y fichas.
- `data/pruebas.js` — base de datos de pruebas.

## Publicar gratis en GitHub Pages
1. Cree un repositorio público, por ejemplo `sycom-pruebas-semiologicas`.
2. Suba el contenido de esta carpeta a la raíz del repositorio.
3. En GitHub vaya a `Settings` → `Pages`.
4. En `Build and deployment`, elija `Deploy from a branch`.
5. Seleccione la rama `main` y la carpeta `/ (root)`.
6. Guarde. GitHub mostrará la URL pública del sitio.

## Agregar una prueba
Edite `data/pruebas.js` y duplique uno de los objetos existentes.
Cada prueba admite:
`id`, `nombre`, `region`, `patologia`, `estructura`, `sensibilidad`,
`especificidad`, `procedimiento`, `positivo`, `interpretacion`, `keywords`, `video`.

## Notas
- Los favoritos se guardan localmente en el navegador del estudiante.
- El botón “Compartir prueba” genera un enlace directo mediante `#id`.
- Los botones de video de esta versión apuntan a búsquedas dirigidas en YouTube para facilitar la demostración; pueden reemplazarse por videos específicos revisados por el docente.
