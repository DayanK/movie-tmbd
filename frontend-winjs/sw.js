// sw.js - Service Worker pour MovieDB Explorer
const CACHE_NAME = 'moviedb-explorer-v2.0.0';
const API_CACHE_NAME = 'moviedb-api-cache-v1';

const STATIC_ASSETS = [
  '/frontend-winjs/',
  '/frontend-winjs/pages/home/home.html',
  '/frontend-winjs/css/main.css',
  '/frontend-winjs/css/movieApp.css',
  '/frontend-winjs/pages/home/home.css',
  '/frontend-winjs/js/app.js',
  '/frontend-winjs/js/controllers/movieController.js',
  '/frontend-winjs/js/views/movieView.js',
  '/frontend-winjs/js/models/movieModel.js',
  '/frontend-winjs/js/config/config.js',
  '/frontend-winjs/js/constants/constants.js',
  '/frontend-winjs/lib/winjs-4.0.1/css/ui-dark.css',
  '/frontend-winjs/lib/winjs-4.0.1/js/base.js',
  '/frontend-winjs/lib/winjs-4.0.1/js/ui.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js'
];

const API_ENDPOINTS = [
  '/api/genres',
  '/api/discover',
  '/api/popular',
  '/api/top-rated',
  '/api/upcoming',
  '/api/now-playing'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS.map(url => {
          return new Request(url, { mode: 'no-cors' });
        })).catch(err => {
          console.warn('Service Worker: Certains assets n\'ont pas pu être mis en cache:', err);
          // Continue même si certains assets échouent
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Gérer les requêtes API
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Gérer les assets statiques
  if (event.request.method === 'GET') {
    event.respondWith(handleStaticRequest(event.request));
  }
});

// Gestion des requêtes API avec stratégie Network First
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Essayer de récupérer depuis le réseau en premier
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache la réponse si elle est valide
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      return networkResponse;
    } else {
      throw new Error('Network response not ok');
    }
  } catch (error) {
    console.log('Service Worker: Réseau indisponible, tentative depuis le cache pour:', request.url);
    
    // Si le réseau échoue, essayer le cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si rien n'est trouvé, retourner une réponse d'erreur
    return new Response(
      JSON.stringify({
        error: 'Contenu non disponible hors ligne',
        message: 'Cette fonctionnalité nécessite une connexion Internet',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Gestion des assets statiques avec stratégie Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Essayer le cache en premier
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Si pas dans le cache, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache pour les futures requêtes
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Impossible de récupérer:', request.url, error);
    
    // Pour les pages HTML, retourner la page principale
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallbackResponse = await cache.match('/frontend-winjs/pages/home/home.html');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // Pour les autres ressources, retourner une erreur
    return new Response('Ressource non disponible hors ligne', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CLEAR_CACHE':
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          }).then(() => {
            event.ports[0].postMessage({ success: true });
          })
        );
        break;
        
      case 'GET_CACHE_SIZE':
        event.waitUntil(
          caches.keys().then(async (cacheNames) => {
            let totalSize = 0;
            
            for (const cacheName of cacheNames) {
              const cache = await caches.open(cacheName);
              const requests = await cache.keys();
              totalSize += requests.length;
            }
            
            event.ports[0].postMessage({ 
              cacheCount: cacheNames.length,
              itemCount: totalSize 
            });
          })
        );
        break;
    }
  }
});

// Notification de mise à jour disponible
self.addEventListener('message', (event) => {
  if (event.data === 'checkForUpdate') {
    // Vérifier s'il y a une nouvelle version
    self.registration.update().then(() => {
      event.ports[0].postMessage({ updateAvailable: true });
    });
  }
});

console.log('Service Worker: Chargé et prêt');