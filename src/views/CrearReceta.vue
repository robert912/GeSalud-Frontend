<template>
    <v-layout>
        <SidebarMedico />

<!-- Main Content -->
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">Recetas</h1>
            
            <span class="text-subtitle-1 text-medium-emphasis">Administra tu inventario de recetas</span>
          </div>
          
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            rounded="pill"
            @click="showCreateDialog"
          >
            Nueva Receta Medica
          </v-btn>
        </div>
      </v-container>
      </v-main>
    </v-layout>
    <p>Cliente</p>
</template>

<script setup>
import SidebarMedico from '@/components/SidebarMedico.vue';
</script>
