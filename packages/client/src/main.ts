import 'bulma/css/bulma.css'
import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import piniaStoragePlugin from './stores/storagePlugin'
import { $t } from './lib/locale/locale'

const app = createApp(App)
const pinia = createPinia();

pinia.use(piniaStoragePlugin);

app.use(pinia);
app.use(router);
app.config.globalProperties.$t = $t;

app.mount('#app');
