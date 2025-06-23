<template>
  <v-layout>
    <!-- Sidebar -->
    <SidebarMedico />

    <!-- Main Content -->
    <v-main>
      <v-container class="py-8">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Recetas Médicas</h1>
            <span class="text-subtitle-1 text-medium-emphasis">Gestión de recetas médicas</span>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirModal">Nueva Receta</v-btn>
        </div>

        <!-- Modal de Receta -->
        <v-dialog v-model="modalActivo" max-width="900">
          <v-card>
            <v-toolbar color="primary" title="Nueva Receta Médica">
              <v-btn icon @click="cerrarModal"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar>

            <v-card-text class="pa-6">
              <!-- Buscador de Paciente -->
              <v-form @submit.prevent="buscarPaciente">
                <v-row>
                  <v-col cols="8">
                    <v-text-field v-model="rutPaciente" label="RUT del Paciente" :rules="[v => !!v || 'RUT requerido']"
                      required />
                  </v-col>
                  <v-col cols="4" class="d-flex align-center">
                    <v-btn color="primary" block @click="buscarPaciente">Buscar</v-btn>
                  </v-col>
                </v-row>
              </v-form>

              <!-- Datos del Paciente -->
              <template v-if="paciente">
                <v-divider class="my-4" />
                <div class="mb-4">
                  <h3 class="text-h6 mb-2">Datos del Paciente</h3>
                  <v-list density="compact" class="bg-grey-lighten-4 rounded-lg">
                    <v-list-item>
                      <template v-slot:prepend><v-icon>mdi-account</v-icon></template>
                      <v-list-item-title>{{ paciente.persona.nombre }} {{ paciente.persona.apellido
                        }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend><v-icon>mdi-email</v-icon></template>
                      <v-list-item-title>{{ paciente.persona.correo }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend><v-icon>mdi-card-account-details</v-icon></template>
                      <v-list-item-title>{{ paciente.prevision }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>

                <!-- Medicamentos -->
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Medicamentos Recetados</h3>
                  <v-btn color="secondary" prepend-icon="mdi-plus" @click="agregarDetalle">Añadir</v-btn>
                </div>

                <!-- Lista de Medicamentos -->
                <v-expansion-panels v-model="panelAbierto">
                  <v-expansion-panel v-for="(detalle, index) in detalles" :key="index" class="mb-4">
                    <v-expansion-panel-title>
                      <div class="d-flex align-center gap-2">
                        <v-chip v-if="detalle.medicamento" color="primary" size="small">
                          {{ detalle.medicamento.nombre }}
                        </v-chip>
                        <span v-else class="text-medium-emphasis">Medicamento no seleccionado</span>
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="pa-4">
                        <v-row>
                          <v-col cols="12" md="9">
                            <v-autocomplete v-model="detalle.medicamento" :items="medicamentos" item-title="nombre"
                              return-object label="Seleccionar Medicamento"
                              @update:model-value="actualizarCampos(index)">
                              <template v-slot:item="{ props, item }">
                                <v-list-item v-bind="props" :title="item.raw.nombre || 'Sin nombre'"
                                  :subtitle="`${item.raw.uso || 'Sin uso especificado'} | ${item.raw.presentacion || 'Sin presentación'}`"></v-list-item>
                              </template>
                            </v-autocomplete>
                          </v-col>
                          <v-col cols="12" md="3" class="d-flex align-center justify-end">
                            <v-btn icon="mdi-delete" variant="text" color="error" @click="eliminarDetalle(index)" />
                          </v-col>
                        </v-row>

                        <v-row class="mt-2">
                          <v-col cols="6" md="3"><v-text-field v-model="detalle.concentracion"
                              label="Concentración" /></v-col>
                          <v-col cols="6" md="3"><v-text-field v-model="detalle.dosis" label="Dosis" /></v-col>
                          <v-col cols="6" md="3"><v-text-field v-model="detalle.frecuencia"
                              label="Frecuencia" /></v-col>
                          <v-col cols="6" md="3"><v-text-field v-model="detalle.duracion" label="Duración" /></v-col>
                        </v-row>

                        <v-alert v-if="detalle.medicamento?.indicaciones" type="info" variant="tonal" class="mt-2">
                          <strong>Indicaciones:</strong> {{ detalle.medicamento.indicaciones }}
                        </v-alert>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Botones de Acción -->
                <div class="d-flex justify-end gap-2 mt-6">
                  <v-btn variant="text" @click="cerrarModal">Cancelar</v-btn>
                  <v-btn color="primary" @click="guardarReceta">Guardar Receta</v-btn>
                </div>
              </template>

              <!-- Mensaje de Error -->
              <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
    <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false"></v-btn>
            </template>
        </v-snackbar>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import SidebarMedico from '@/components/SidebarMedico.vue'

// Estado
const modalActivo = ref(false)
const rutPaciente = ref('')
const paciente = ref(null)
const error = ref('')
const detalles = ref([])
const medicamentos = ref([])
const panelAbierto = ref(null) // controla el panel abierto

// Métodos
const abrirModal = async () => {
  resetearFormulario()
  await cargarMedicamentos()
  modalActivo.value = true
}

const cerrarModal = () => {
  modalActivo.value = false
  resetearFormulario()
}

const resetearFormulario = () => {
  rutPaciente.value = ''
  paciente.value = null
  detalles.value = []
  error.value = ''
}

// Snackbar
const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
});

const showNotification = (text, color = 'success') => {
    snackbar.value = {
        show: true,
        text,
        color
    };
};

const cargarMedicamentos = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/medicamento')
    medicamentos.value = data.filter(m => m.activo)
  } catch (e) {
    console.error('Error cargando medicamentos:', e)
    error.value = 'Error al cargar medicamentos'
  }
}

const buscarPaciente = async () => {
  if (!rutPaciente.value) {
    error.value = 'Ingrese un RUT válido'
    return
  }

  try {
    const { data } = await axios.get(`http://localhost:8080/paciente/${rutPaciente.value}`)
    paciente.value = data
    error.value = ''
  } catch (err) {
    paciente.value = null
    error.value = 'Paciente no encontrado'
  }
}

const agregarDetalle = () => {
  detalles.value.push({
    medicamento: null,
    concentracion: '',
    dosis: '',
    frecuencia: '',
    duracion: ''
  })
  panelAbierto.value = detalles.value.length - 1 // abrir solo el nuevo panel
}

const eliminarDetalle = (index) => {
  detalles.value.splice(index, 1)
}

const actualizarCampos = (index) => {
  const detalle = detalles.value[index]
  if (detalle.medicamento) {
    detalle.concentracion = detalle.medicamento.concentracion || ''
    detalle.dosis = detalle.medicamento.dosis || ''
    detalle.frecuencia = detalle.medicamento.frecuencia || ''
    detalle.duracion = detalle.medicamento.duracion || ''
  }
}

const guardarReceta = async () => {
  if (!validarReceta()) return;

  try {
    // 1. Guardar receta
    const recetaPayload = {
      paciente: paciente.value.id,
      medico: 1 // puedes reemplazarlo con el ID del médico logueado si lo tienes
    };

    const recetaRes = await axios.post('http://localhost:8080/receta', recetaPayload);
    const recetaId = recetaRes.data.id;

    // 2. Guardar detalles de receta
    for (const detalle of detalles.value) {
      const detallePayload = {
        receta: recetaId,
        medicamento: detalle.medicamento.id,
        concentracion: detalle.concentracion,
        dosis: detalle.dosis,
        frecuencia: detalle.frecuencia,
        duracion: detalle.duracion
      };

      await axios.post('http://localhost:8080/detalle', detallePayload);
    }

    // 3. Cerrar modal y limpiar
    cerrarModal();
    showNotification('Receta guardada correctamente.', 'success');
  } catch (error) {
    console.error('Error al guardar la receta:', error);
    error.value = 'Hubo un error al guardar la receta';
  }
};

const validarReceta = () => {
  if (!paciente.value) {
    error.value = 'Seleccione un paciente primero'
    return false
  }

  if (detalles.value.length === 0) {
    error.value = 'Agregue al menos un medicamento'
    return false
  }

  return true
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>