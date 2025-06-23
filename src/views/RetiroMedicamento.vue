<template>
    <v-layout>
        <SidebarFarmaceutico />

<!-- Main Content -->
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">Recetas Medicas</h1>
            
            <span class="text-subtitle-1 text-medium-emphasis">Administra de recetas medicas</span>
          </div>
          
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-magnify"
            rounded="pill"
            @click="showCreateDialog"
          >
            Buscar Receta medica
          </v-btn>
        </div>
      </v-container>
      </v-main>
    </v-layout>
    <p>Cliente</p>
</template>

<script setup>
import SidebarFarmaceutico from '@/components/SidebarFarmaceutico.vue';
</script>
