/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
//Styles
import '@/styles/main.scss'

//icons
import '@mdi/font/css/materialdesignicons.min.css'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composable
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
