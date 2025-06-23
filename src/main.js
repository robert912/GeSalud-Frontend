import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import router from "./routes";

//Importaciones de vuetify
import 'vuetify/styles';
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import {aliases, mdi} from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

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
    defaultTheme: 'light',
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
        }
      },
    },
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

//Crear aplicacion VUE
const app = createApp(App)

//usar plugins 
app.use(router);
app.use(vuetify);

//Axios Global
app.config.globalProperties.$axios = axios;
app.mount('#app');