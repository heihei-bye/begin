const CACHE_NAME = 'potato-todo-v2';
const STATIC_CACHE = 'potato-static-v2';
const DYNAMIC_CACHE = 'potato-dynamic-v2';

const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './offline.html',
    './icons/icon.svg'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete, skipping waiting');
                self.skipWaiting();
            })
            .catch(err => {
                console.error('[Service Worker] Failed to cache:', err);
            })
    );
});

// 激活事件
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete, claiming clients');
            self.clients.claim();
        })
    );
});

// 获取事件 - 使用网络优先策略
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }
    
    // HTML 页面使用网络优先
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // 克隆响应以便缓存
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // 网络失败时从缓存获取
                    return caches.match('./index.html');
                })
        );
        return;
    }
    
    // CSS 和 JS 使用缓存优先
    if (request.destination === 'style' || request.destination === 'script') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(response => {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    });
                })
        );
        return;
    }
    
    // 图片使用缓存优先
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(response => {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    });
                })
        );
        return;
    }
    
    // 其他请求使用网络优先
    event.respondWith(
        fetch(request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// 消息事件 - 用于更新 Service Worker
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 后台同步（可选功能）
self.addEventListener('sync', event => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(
            // 这里可以添加数据同步逻辑
            console.log('[Service Worker] Syncing tasks...')
        );
    }
});
