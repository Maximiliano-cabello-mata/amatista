import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // temas.json vive en practices/blender/ (lo comparte con el add-on).
  server: { fs: { allow: ['..'] } },
  build: {
    // El chunk de A-Frame (~1.3 MB) se carga bajo demanda.
    chunkSizeWarningLimit: 1400,
    // Protección del código de la PWA (docs/seguridad/02_proteccion_del_codigo.md):
    // nunca publicar mapas de fuente (devolverían el código original con sus
    // comentarios). scripts/revisar-publicacion.mjs lo comprueba en cada build.
    sourcemap: false,
    // Sin comentarios de licencia ni de autor en el JS publicado. Vite 8 compila con oxc y
    // rolldown: la antigua opción `esbuild.legalComments` se ignoraba (aviso en cada build).
    rolldownOptions: { output: { comments: false } },
  },
  // Pruebas de funciones puras (reglas del progreso, catálogo): `npm test`.
  test: {
    include: ['src/**/*.test.js'],
    environment: 'node',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      // Los íconos ya entran por globPatterns; evita duplicarlos en el precache.
      includeManifestIcons: false,
      manifest: {
        name: 'Amatista · Aprende 3D para la web',
        short_name: 'Amatista',
        description: 'Plataforma offline-first para aprender creación 3D: Blender, A-Frame y WebXR.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#121212',
        theme_color: '#121212',
        categories: ['education'],
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/amatista.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Precache: la pantalla de cursos completa (HTML, JS, CSS, fuentes, íconos) y los
        // modelos GLB del curso de A-Frame (public/modelos, ~6 KB cada uno).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,glb}'],
        // A-Frame (~1.3 MB) no se precachea: se guarda la primera vez que se usa
        // (laboratorio o vista 3D de una lección) y desde ahí funciona sin conexión.
        globIgnores: [
          '**/aframe-master*.js',
          // Alfabetos que no usamos: el navegador no los descarga y no deben precachearse.
          '**/*-{cyrillic,cyrillic-ext,greek,vietnamese}-*.woff2',
          // Planos de los modelos de referencia: se guardan al verlos (abajo).
          '**/plano-*.svg',
          // Paneles de administración y del profesor (~35 KB comprimidos): un
          // alumno nunca los abre y no debe gastar sus datos en bajarlos. Quien
          // sí los usa los guarda al abrirlos (abajo) y siguen sin conexión.
          '**/Admin-*.js',
          '**/Profesor*-*.js',
          // SDK de Sentry (~360 KB): solo se baja si hay VITE_SENTRY_DSN (src/lib/sentry.js).
          '**/sentrySdk-*.js',
        ],
        runtimeCaching: [
          {
            // Imagen y plano de «Así se debe ver» (practices/blender/*/referencia.jpg y plano.svg).
            urlPattern: ({ url }) => /\/assets\/(referencia|plano)-[^/]+\.(jpg|svg)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'amatista-referencias', expiration: { maxEntries: 60 } },
          },
          {
            urlPattern: ({ url }) => /^\/assets\/(Admin|Profesor[^/]*)-[^/]+\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'amatista-paneles', expiration: { maxEntries: 8 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/aframe-master'),
            handler: 'CacheFirst',
            options: { cacheName: 'amatista-aframe', expiration: { maxEntries: 2 } },
          },
        ],
        navigateFallback: '/index.html',
        // Si la API se sirve en el mismo dominio (Caddy en /api), abrir una URL
        // de la API no debe devolver la app. Las respuestas de la API nunca se
        // guardan en el service worker: el catálogo y el progreso offline viven
        // en IndexedDB y se piden siempre frescos al servidor.
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
