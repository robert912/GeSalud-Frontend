<template>
    <v-container class="fill-height" fluid>
        <v-row justify="center" align="center">
            <v-col cols="12" md="8" lg="6" class="text-center">
                <v-card class="pa-6" elevation="12" rounded="xl">
                    <!--v-img src="" class="mb-4" contain max-height="150" max-width="300"></v-img-->
                    <v-card-title class="text-h3 mb-6">
                        Bienvenido al Sistema Salud
                    </v-card-title>

                    <v-card-subtitle class="text-h6 mb-8">
                        Seleccione su rol para continuar
                    </v-card-subtitle>

                    <div class="d-flex flex-column flex-md-row justify-center gap-4">
                        <!-- Opción Médico -->
                        <v-btn to="/medico" color="primary" size="x-large" min-width="200" min-height="100"
                            class="flex-grow-1" variant="flat">
                            <v-icon size="60" class="mb-2">mdi-doctor</v-icon>
                            <div class="text-h5">Médico</div>
                        </v-btn>
                        <div class="my-2 d-md-none"></div> <!-- Solo visible en móvil -->
                        <div class="mx-2 d-none d-md-inline"></div> <!-- Solo visible en desktop -->
                        <!-- Opción Farmacéutico -->
                        <v-btn to="/farmaceutico" color="secondary" size="x-large" min-width="200" min-height="100"
                            class="flex-grow-1" variant="flat">
                            <v-icon size="60" class="mb-2">mdi-medication</v-icon>
                            <div class="text-h5">Farmacéutico</div>
                        </v-btn>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="text-caption text-medium-emphasis">
                        ¿No está seguro de qué seleccionar? Contacte al administrador del sistema
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
// No se necesita lógica adicional ya que los botones usan 'to' de vue-router
</script>

<style scoped>
.v-btn {
    display: flex;
    flex-direction: column;
    padding: 24px;
    transition: all 0.3s ease;
}

.v-btn:hover {
    transform: translateY(-5px);
}
</style>