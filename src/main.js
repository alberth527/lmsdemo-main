import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarIconSet from 'quasar/icon-set/svg-mdi-v7'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import 'quasar/dist/quasar.css'
import App from './App.vue'

createApp(App)
  .use(Quasar, {
    plugins: {},
    iconSet: quasarIconSet
  })
  .mount('#app')
