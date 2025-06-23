<template>
    <!-- Centrado vertical y horizontal -->
    <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
        <!-- Ícono de advertencia -->
        <v-icon size="96" class="mb-3">mdi-alert-circle-outline</v-icon>

        <!-- Código 404 grande -->
        <h1 class="display-3 font-weight-bold mb-2">404</h1>

        <!-- Mensaje descriptivo -->
        <h2 class="headline mb-6">Página no encontrada</h2>

        <!-- Botón para volver a la página principal -->
        <v-btn color="primary" @click="goHome">
            <v-icon left>mdi-home</v-icon>
            Ir al inicio
        </v-btn>
    </v-container>
</template>

<script setup>
    import { useRouter } from 'vue-router';
    const router = useRouter();
    function goHome() {
        router.push('/'); // Ajusta si tu ruta de inicio es distinta
    }
</script>

<style scoped>
.display-3 {
    font-size: 3.5rem;
}

.headline {
    font-size: 1.5rem;
    font-weight: 400;
}
</style>
