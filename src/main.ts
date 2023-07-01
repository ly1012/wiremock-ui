import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

import Clipboard from 'v-clipboard'
import router from './router'
import JsonViewer from 'vue-json-viewer'


const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.use(Clipboard)
app.use(JsonViewer)

app.mount('#app')
