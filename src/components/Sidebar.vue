
<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      :width="drawerWidth"
      permanent
      class="simple-sidebar"
      :class="{ 'mini-sidebar': mini }"
      elevation="5"
    >
      <!-- Logo y título -->
      <div class="sidebar-header pa-4 d-flex align-center">
        
        <div class="app-title ml-3" v-show="!mini">
          <h1 >InvenTech</h1>
          <span class="text-caption text-grey">Sistema de Gestión</span>
        </div>
        
        <v-spacer></v-spacer>
        
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          size="medium"
          color="black"
          @click="toggleMini"
          :class="{ 'rotate-180': mini }"
        ></v-btn>
      </div>
      
      <v-divider></v-divider>
      
      <!-- Menú principal -->
      <div class="pa-3">
        <div class="menu-section mb-2" v-show="!mini">
          <div class="text-caption text-grey font-weight-medium px-3 py-2">MENÚ PRINCIPAL</div>
        </div>
        
        <div class="menu-items">
          <div
            v-for="(item, index) in menuItems"
            :key="index"
            class="menu-item d-flex align-center"
            :class="{ active: item.to === currentRoute, 'justify-center': mini }"
            @click="navigate(item.to)"
          >
            <div class="menu-icon">
              <v-icon :icon="item.icon" :color="item.to === currentRoute ? 'primary' : 'grey-darken-1'"></v-icon>
            </div>
            
            <div class="menu-title" v-show="!mini">
              {{ item.title }}
            </div>
            
            <div class="menu-badge ml-auto" v-if="item.badge && !mini">
              <v-chip
                size="x-small"
                :color="item.badgeColor || 'primary'"
                class="font-weight-medium"
              >
                {{ item.badge }}
              </v-chip>
            </div>
          </div>
        </div>
        
        <v-divider class="my-3"></v-divider>
        
        <div class="menu-section mb-2" v-show="!mini">
          <div class="text-caption text-grey font-weight-medium px-3 py-2">REPORTES</div>
        </div>
        
        <div class="menu-items">
          <div
            v-for="(item, index) in reportItems"
            :key="index"
            class="menu-item d-flex align-center"
            :class="{ active: item.to === currentRoute, 'justify-center': mini }"
            @click="navigate(item.to)"
          >
            <div class="menu-icon">
              <v-icon :icon="item.icon" :color="item.to === currentRoute ? 'primary' : 'grey-darken-1'"></v-icon>
            </div>
            
            <div class="menu-title" v-show="!mini">
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Perfil de usuario -->
      <div class="sidebar-footer mt-auto">
        <v-divider></v-divider>
        <div class="pa-4 d-flex align-center">
          <v-avatar size="36">
            <v-img src="https://i.pravatar.cc/150?img=13"></v-img>
          </v-avatar>
          
          <div class="user-info ml-3" v-show="!mini">
            <div class="font-weight-medium">Admin</div>
            <div class="text-caption text-grey">Administrador</div>
          </div>
          
          <v-spacer></v-spacer>
          
          <v-menu v-if="!mini" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                color="grey"
              ></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                title="Mi perfil"
                prepend-icon="mdi-account"
              ></v-list-item>
              <v-list-item
                title="Configuración"
                prepend-icon="mdi-cog"
              ></v-list-item>
              <v-divider class="my-1"></v-divider>
              <v-list-item
                title="Cerrar sesión"
                prepend-icon="mdi-logout"
                class="text-error"
              ></v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Estado
const drawer = ref(true);
const mini = ref(false);

// Ancho del drawer
const drawerWidth = computed(() => mini.value ? 64 : 256);

// Ruta actual
const currentRoute = computed(() => route.path);

// Menú items
const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard'
  },
  {
    title: 'Productos',
    icon: 'mdi-package-variant-closed',
    to: '/productos',
    badge: 'Nuevo',
    badgeColor: 'success'
  },
  {
    title: 'Inventario',
    icon: 'mdi-barcode-scan',
    to: '/inventario'
  },
  {
    title: 'Ventas',
    icon: 'mdi-cart',
    to: '/ventas',
    badge: '5',
    badgeColor: 'info'
  },
  {
    title: 'Compras',
    icon: 'mdi-cart-plus',
    to: '/compras'
  },
  {
    title: 'Clientes',
    icon: 'mdi-account-group',
    to: '/clientes'
  },
  {
    title: 'Proveedores',
    icon: 'mdi-truck',
    to: '/proveedores'
  }
];

// Reportes items
const reportItems = [
  {
    title: 'Reportes de Ventas',
    icon: 'mdi-chart-line',
    to: '/reportes/ventas'
  },
  {
    title: 'Análisis de Inventario',
    icon: 'mdi-chart-bar',
    to: '/reportes/inventario'
  },
  {
    title: 'Finanzas',
    icon: 'mdi-currency-usd',
    to: '/reportes/finanzas'
  }
];

// Métodos
const toggleMini = () => {
  mini.value = !mini.value;
};

const navigate = (path) => {
  router.push(path);
};
</script>

<style scoped>
.simple-sidebar {
  border-right: 1px solid rgba(0,0,0,0.12);
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
  background-color: rgba(0,0,0,0.04);
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
</style>