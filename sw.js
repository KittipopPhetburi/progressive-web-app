const CACHE_NAME = 'image-gallery-cache-v2'; // **สำคัญ:** เปลี่ยนเวอร์ชันเมื่ออัปเดตไฟล์หลัก
// รายการไฟล์ที่ต้องแคชล่วงหน้า (Pre-cache)
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  // **สำคัญ:** ระบุรูปภาพแกลเลอรีที่ต้องการให้ทำงานแบบออฟไลน์
  '/images/photo1.jpg', 
  '/images/photo2.jpg',
  '/images/photo3.jpg'
];

// 1. เหตุการณ์ติดตั้ง (Install): แคชไฟล์หลัก
self.addEventListener('install', event => {
  console.log('[Service Worker] ติดตั้ง');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] แคชไฟล์หลัก');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. เหตุการณ์จัดการการร้องขอ (Fetch): กลยุทธ์ Cache First
self.addEventListener('fetch', event => {
  // ตอบกลับด้วยทรัพยากรจากแคชก่อน
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ถ้ามีในแคช ให้ส่งกลับทันที
        if (response) {
          return response;
        }
        
        // ถ้าไม่มีในแคช ให้ไปโหลดจากเครือข่าย
        return fetch(event.request).then(
          function(response) {
            // ตรวจสอบความถูกต้องของ Response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // ถ้าเป็นการร้องขอรูปภาพ ให้แคชรูปภาพใหม่ที่โหลดมาด้วย (Runtime Caching)
            if (event.request.destination === 'image') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log(`[Service Worker] แคชรูปภาพใหม่: ${event.request.url}`);
                });
            }

            return response;
          }
        ).catch(error => {
            console.error('[Service Worker] Fetch ล้มเหลว:', error);
            // ถ้าโหลดจากเครือข่ายไม่ได้ อาจจะไม่มีภาพ
        });
      })
    );
});

// 3. เหตุการณ์เปิดใช้งาน (Activate): ล้างแคชเก่า
self.addEventListener('activate', event => {
  console.log('[Service Worker] เปิดใช้งาน');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // ลบแคชเวอร์ชันเก่าทิ้ง
            console.log(`[Service Worker] ลบแคชเก่า: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // ทำให้ Service Worker เข้าควบคุม Client ได้ทันที
  return self.clients.claim();
});