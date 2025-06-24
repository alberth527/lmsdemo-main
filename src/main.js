import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    notify: { /* look at QuasarConfOptions from the API card */ }
  }
})

myApp.mount('#app')