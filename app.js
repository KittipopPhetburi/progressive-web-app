// ฟังก์ชันสำหรับอัปเดตสถานะออนไลน์/ออฟไลน์
function updateOnlineStatus() {
    const statusElement = document.querySelector('.offline-status');
    if (navigator.onLine) {
        statusElement.textContent = 'สถานะ: ออนไลน์ (เชื่อมต่อแล้ว)';
        statusElement.classList.remove('offline');
        statusElement.classList.add('online');
    } else {
        statusElement.textContent = 'สถานะ: ออฟไลน์ (โหลดจากแคช Service Worker)';
        statusElement.classList.remove('online');
        statusElement.classList.add('offline');
    }
}

// 1. ลงทะเบียน Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker ลงทะเบียนสำเร็จ', reg);
      })
      .catch(err => {
        console.error('Service Worker ลงทะเบียนล้มเหลว', err);
      });
  });

  // 2. ตรวจสอบสถานะการเชื่อมต่อ
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus(); 
} else {
    // แจ้งเตือนหากเบราว์เซอร์ไม่รองรับ Service Worker
    const statusElement = document.querySelector('.offline-status');
    statusElement.textContent = 'เบราว์เซอร์ไม่รองรับ Service Worker';
    statusElement.classList.add('offline');
}