// service-worker.js — mínimo necessário para o app ser instalável (PWA).
// Não faz cache agressivo de conteúdo, só garante que o navegador
// reconheça o app como instalável e funcione o modo "standalone".

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Passa direto para a rede (sem cache offline agressivo).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
