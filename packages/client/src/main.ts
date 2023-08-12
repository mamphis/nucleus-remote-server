import './assets/main.css'
import 'bulma/css/bulma.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import piniaStoragePlugin from './stores/storagePlugin'

const app = createApp(App)
const pinia = createPinia();

pinia.use(piniaStoragePlugin);

app.use(pinia);
app.use(router);

app.mount('#app');
