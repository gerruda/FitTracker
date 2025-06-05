import './assets/styles/main.css'
// Регистрируем Service Worker только для веб-версии
if (!(window as any).Capacitor) {
  import('./registerServiceWorker')
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
