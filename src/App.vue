<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <v-app>
    <RouterView/>
  </v-app>
</template>

<style>
/* Estilos globales básicos */
:root {
  --primary: #1976D2;
  --secondary: #424242;
  --accent: #82B1FF;
  --error: #FF5252;
  --warning: #FFC107;
  --info: #2196F3;
  --success: #4CAF50;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
}

/* Ajustes para el contenedor principal */
.fill-height {
  height: 100%;
}

/* Ajustes para el scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>