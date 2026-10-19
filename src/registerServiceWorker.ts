export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.log('ExamForge ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('ServiceWorker registration failed:', error);
        });
    });
  }
}
