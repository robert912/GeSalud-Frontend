import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import router from "./routes";

//Importaciones de vuetify
import 'vuetify/styles';
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const temaGuardado = localStorage.getItem('tema') || 'light'
//Configuracion de vuetify
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
  defaultTheme: temaGuardado, // puedes cambiar dinámicamente si quieres
  themes: {
    light: {
      dark: false,
      colors: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
        used:'#424242',
        barnav: '#1976D2',
        background: '#e3f2fd',
        surface: '#ffffff'
      }
    },
    dark: {
      dark: false,
      colors: {
        primary: '#90CAF9',
        secondary: '#424242',
        accent: '#FF4081',
        error: '#EF5350',
        info: '#2196F3',
        success: '#66BB6A',
        warning: '#FFA726',
        barnav: '#234a56',
        used:'#E0E0E0',
        background: '#121212',
        surface: '#1E1E1E'
      }
    }
  }
},
    defaults: {
        VCard: {
            rounded: 'lg',
        },
        VBtn: {
            rounded: 'lg',
            fontWeight: '500',
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
        },
    },
});


//Configuracion global de axios
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

//Crear aplicacion VUE
const app = createApp(App)

//usar plugins 
app.use(router);
app.use(vuetify);

//Axios Global
app.config.globalProperties.$axios = axios;
app.mount('#app');