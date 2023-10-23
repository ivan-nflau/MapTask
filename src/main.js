import { createApp } from 'vue'
import App from './App.vue'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle'

import 'vue3-easy-data-table/dist/style.css'
import 'bootstrap/dist/css/bootstrap.css'

const app = createApp(App)
app.component('EasyDataTable', Vue3EasyDataTable).use(bootstrap).mount('#app')