<template>
  <div>
    <v-navigation-drawer v-model="drawer" :width="drawerWidth" permanent class="simple-sidebar"
      :class="{ 'mini-sidebar': mini }" elevation="5">
      <!-- Logo y título -->
      <div class="sidebar-header pa-4 d-flex align-center">

        <div class="app-title ml-3" v-show="!mini">
          <div class="d-flex align-center">
            <h1>GeSalud</h1>
            <!-- Icono de cambio de tema -->
            <v-row class="align-center pl-10" style="position: relative; height: 32px; width: 32px;">
              <template v-if="ready">
                <v-fade-transition>
                  <v-icon v-if="!isDark" key="light" color="info" class="cursor-pointer"
                    style="position: absolute; font-size: 20px;" @click="isDark = true">
                    mdi-weather-night
                  </v-icon>
                </v-fade-transition>

                <v-fade-transition>
                  <v-icon v-if="isDark" key="dark" color="warning" class="cursor-pointer"
                    style="position: absolute; font-size: 20px;" @click="isDark = false">
                    mdi-weather-sunny
                  </v-icon>
                </v-fade-transition>
              </template>
            </v-row>
          </div>
          <span class="text-caption text-grey">Sistema de Gestión de Salud</span>
        </div>

        <v-spacer></v-spacer>

        <v-btn icon="mdi-chevron-left" variant="text" size="medium" color="black" @click="toggleMini"
          :class="{ 'rotate-180': mini }"></v-btn>
      </div>


      <!-- Menú principal -->
      <div class="pa-3">
        <div class="menu-items">
          <div v-for="(item, index) in principalItems" :key="index" class="menu-item d-flex align-center"
            :class="{ active: item.to === currentRoute, 'justify-center': mini }" @click="navigate(item.to)">
            <div class="menu-icon">
              <v-icon :icon="item.icon" :color="item.to === currentRoute ? 'primary' : 'grey-darken-1'"></v-icon>
            </div>

            <div class="menu-title" v-show="!mini">
              {{ item.title }}
            </div>

            <div class="menu-badge ml-auto" v-if="item.badge && !mini">
              <v-chip size="x-small" :color="item.badgeColor || 'primary'" class="font-weight-medium">
                {{ item.badge }}
              </v-chip>
            </div>
          </div>
        </div>

        <v-divider class="my-3"></v-divider>

        <div class="menu-section mb-2" v-show="!mini">
          <div class="text-caption text-grey font-weight-bold px-3 py-2">GESTION MEDICAMENTOS</div>
        </div>

        <div class="menu-items">
          <div v-for="(item, index) in recetasItems" :key="index" class="menu-item d-flex align-center"
            :class="{ active: item.to === currentRoute, 'justify-center': mini, 'disabled-item': item.disabled }"
            @click="navigate(item.to)">
            <div class="menu-icon">
              <v-icon :icon="item.icon" :color="item.to === currentRoute ? 'primary' : 'grey-darken-1'"></v-icon>
            </div>

            <div class="menu-title" v-show="!mini">
              {{ item.title }}
            </div>

            <div class="menu-badge ml-auto" v-if="item.badge && !mini">
              <v-chip size="x-small" :color="item.badgeColor || 'primary'" class="font-weight-medium">
                {{ item.badge }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Perfil de usuario -->
      <div class="sidebar-footer mt-auto">
        <v-divider></v-divider>
        <div class="pa-4 d-flex align-center">
          <v-avatar size="36">
            <v-icon icon="mdi-account-tie" size="44" color="" class=""></v-icon>
          </v-avatar>

          <div class="user-info ml-3" v-show="!mini">

            <div class="font-weight-medium">Farmaceutico</div>
            <div class="text-caption text-primary">{{ nombreFarmaceutico }}</div>
          </div>

          <v-spacer></v-spacer>

          <v-menu v-if="!mini" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" color="grey"></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item title="Mi perfil" prepend-icon="mdi-account"></v-list-item>
              <v-list-item title="Configuración" prepend-icon="mdi-cog"></v-list-item>
              <v-divider class="my-1"></v-divider>
              <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" class="text-error"></v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { BASE_API_URL, ID_FARMACEUTICO } from '@/constants/globals'
import { useTheme } from 'vuetify'

const router = useRouter();
const route = useRoute();

// Estado
const drawer = ref(true);
const mini = ref(false);

// Ancho del drawer
const drawerWidth = computed(() => mini.value ? 64 : 256);

// Ruta actual
const currentRoute = computed(() => route.path);

// Nombre del farmacéutico
const nombreFarmaceutico = ref('');

// Estado del tema
const isDark = ref(false)
const theme = useTheme()
const ready = ref(false)
onMounted(() => {
  isDark.value = theme.global.name.value === 'dark'
  requestAnimationFrame(() => {
    ready.value = true
  })
})
watch(isDark, (val) => {
  theme.global.name.value = val ? 'dark' : 'light'
})

// Volver atrás
const principalItems = [
  {
    title: 'Volver atrás',
    icon: 'mdi-keyboard-return',
    to: '/'
  },
];

// recetas items
const recetasItems = [
  {
    title: 'Entregar Medicamento',
    icon: 'mdi-clipboard-pulse-outline',
    to: '/retiro'
  },
  {
    title: 'Stock Medicamentos',
    icon: 'mdi-pill',
    to: '/medicamentos'
  },
  {
    title: 'Solicitar Stock',
    icon: 'mdi-truck',
    to: '/solicitar-stock',
    disabled: true
  },
];

// Métodos
const toggleMini = () => {
  mini.value = !mini.value;
};

const navigate = (path) => {
  router.push(path);
};

// Nombre del farmacéutico
onMounted(async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/farmaceutico/id/${ID_FARMACEUTICO}`);
    const persona = response.data.persona;
    nombreFarmaceutico.value = `${persona.nombre} ${persona.apellido}`;
  } catch (error) {
    console.error('Error al obtener el nombre del farmacéutico:', error);
  }
});
</script>

<style scoped>
.simple-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-x: hidden;
}

.mini-sidebar {
  overflow: visible;
}

.sidebar-header {
  height: 64px;
  border-bottom: 1px solid rgba(5, 5, 5, 0);
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.menu-item.active {
  background-color: rgba(11, 113, 216, 0.08);
}

.menu-icon {
  min-width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-title {
  font-size: 0.9rem;
  margin-left: 12px;
  white-space: nowrap;
  font-weight: 500;
}

.sidebar-footer {
  margin-top: auto;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Para el modo mini/compacto */
.mini-sidebar .menu-item {
  justify-content: center;
  padding: 0;
}

.mini-sidebar .menu-icon {
  margin: 0;
}

.disabled-item {
  opacity: 0.5;
  pointer-events: none;
  cursor: default;
}
</style>