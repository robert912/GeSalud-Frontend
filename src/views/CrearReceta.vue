<template>
  <v-layout>
    <!-- Sidebar -->
    <SidebarMedico />

    <!-- Main Content -->
    <v-main class="">
      <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Crear Nueva Receta</h1>
            <span class="text-subtitle-1 text-medium-emphasis">Complete los datos para generar una nueva receta médica</span>
          </div>
        </div>

        <!-- Buscador de Paciente -->
        <v-card class="mb-6" rounded="lg">
          <v-card-text>
            <v-form @submit.prevent="buscarPaciente">
              <v-row align="center">
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="rutPaciente"
                    label="RUT del Paciente"
                    placeholder="Ej: 12345678-9"
                    :rules="[rules.required, rules.rut]"
                    prepend-inner-icon="mdi-magnify"
                    @keyup.enter="buscarPaciente"
                  />
                </v-col>
                <v-col cols="12" md="4" class ="pb-5 pt-0">
                  <v-btn
                    color="primary"
                    block
                    size="large"
                    prepend-icon="mdi-account-search"
                    @click="buscarPaciente"
                    :loading="buscandoPaciente"
                  >
                    Buscar Paciente
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Datos del Paciente -->
        <v-card v-if="paciente" class="mb-6" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-details</v-icon>
            <span class="text-h6">Datos del Paciente</span>
          </v-card-title>
          <v-card-text>
            <v-list density="compact" class="rounded-lg">
              <v-list-item>
                <template v-slot:prepend><v-icon>mdi-account</v-icon></template>
                <v-list-item-title class="font-weight-medium">{{ paciente.persona.nombre }} {{ paciente.persona.apellido }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend><v-icon>mdi-identifier</v-icon></template>
                <v-list-item-title>{{ paciente.persona.rut }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend><v-icon>mdi-card-account-details</v-icon></template>
                <v-list-item-title>{{ paciente.prevision }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Sección de Medicamentos -->
        <template v-if="paciente">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h5">Medicamentos Recetados</h2>
            <v-btn 
              color="secondary" 
              prepend-icon="mdi-plus"
              @click="agregarDetalle"
            >
              Añadir Medicamento
            </v-btn>
          </div>

          <!-- Lista de Medicamentos -->
          <v-expansion-panels v-model="panelAbierto" variant="accordion">
            <v-expansion-panel 
              v-for="(detalle, index) in detalles" 
              :key="index" 
              class="mb-4"
              rounded="lg"
            >
              <v-expansion-panel-title expand-icon="mdi-chevron-down">
                <div class="d-flex align-center gap-4">
                  <v-chip 
                    :color="detalle.medicamento ? 'primary' : 'grey'" 
                    variant="outlined" 
                    size="small"
                  >
                    {{ detalle.medicamento ? detalle.medicamento.nombre : 'Sin seleccionar' }}
                  </v-chip>
                  <div v-if="detalle.medicamento" class="text-caption text-medium-emphasis">
                    {{ detalle.dosis }} {{ detalle.frecuencia }}
                  </div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-4">
                  <v-row>
                    <v-col cols="12" md="9">
                      <v-autocomplete 
                        v-model="detalle.medicamento"
                        :items="medicamentos.filter(m => !medicamentosSeleccionados.includes(m.id) || m.id === detalle.medicamento?.id)"
                        item-title="nombre"
                        placeholder="Seleccionar Medicamento"
                        :rules="[rules.required]"
                        return-object
                        label="Seleccionar Medicamento"
                        variant="outlined"
                        @update:model-value="actualizarCampos(index)"
                      >
                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="item.raw.nombre"
                            :subtitle="`${item.raw.uso || 'Sin uso'} | ${item.raw.presentacion || 'Sin presentación'}`"
                          />
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="3" class="d-flex align-center justify-end">
                      <v-btn 
                        icon="mdi-delete" 
                        variant="text" 
                        color="error" 
                        @click="eliminarDetalle(index)" 
                      />
                    </v-col>
                  </v-row>

                  <v-row class="mt-2">
                    <v-col cols="6" md="3">
                      <v-text-field 
                        v-model="detalle.concentracion"
                        label="Concentración"
                        variant="outlined"
                        hint="Indica la concentración del principio activo (ej: 500mg)"
                        persistent-hint
                        :rules="[v => !!v || 'Indica la concentración del principio activo (ej: 500mg)']"
                      />
                    </v-col>

                    <v-col cols="6" md="3">
                      <v-text-field 
                        v-model="detalle.dosis"
                        label="Dosis"
                        variant="outlined"
                        hint="Cantidad a administrar por toma (ej: 1 comprimido)"
                        persistent-hint
                        :rules="[v => !!v || 'Cantidad a administrar por toma (ej: 1 comprimido)']"
                      />
                    </v-col>

                    <v-col cols="6" md="3">
                      <v-text-field 
                        v-model="detalle.frecuencia"
                        label="Frecuencia"
                        variant="outlined"
                        hint="Frecuencia de administración (ej: cada 8 horas)"
                        persistent-hint
                        :rules="[v => !!v || 'Frecuencia de administración (ej: cada 8 horas)']"
                      />
                    </v-col>

                    <v-col cols="6" md="3">
                      <v-text-field 
                        v-model="detalle.duracion"
                        label="Duración"
                        variant="outlined"
                        hint="Duración del tratamiento (ej: 7 días)"
                        persistent-hint
                        :rules="[v => !!v || 'Duración del tratamiento (ej: 7 días)']"
                      />
                    </v-col>
                  </v-row>

                  <v-alert 
                    v-if="detalle.medicamento?.indicaciones" 
                    type="info" 
                    variant="tonal" 
                    class="mt-4"
                  >
                    <strong>Indicaciones:</strong> {{ detalle.medicamento.indicaciones }}
                  </v-alert>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Botones de Acción -->
          <div class="d-flex justify-end gap-4 mt-6">
            <v-btn 
              variant="tonal" 
              color="grey-darken-2"
              @click="resetearFormulario"
            >
              Limpiar Formulario
            </v-btn>
            <v-btn 
              color="primary" 
              @click="guardarReceta"
              :loading="guardando"
              :disabled="!formularioValido"
            >
              Guardar Receta
            </v-btn>
          </div>
        </template>

        <!-- Mensajes de estado -->
        <v-alert v-if="error" type="info" variant="tonal" class="mt-4">
          {{ error }}
        </v-alert>
      </v-container>
    </v-main>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      <v-icon :icon="snackbar.icon" class="mr-2" />
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" :icon="snackbar.btnIcon" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import SidebarMedico from '@/components/SidebarMedico.vue'
import { BASE_API_URL, ID_MEDICO } from '@/constants/globals'

const rutPaciente = ref('')
const buscandoPaciente = ref(false)
const paciente = ref(null)
const detalles = ref([])
const medicamentos = ref([])
const panelAbierto = ref(null)
const guardando = ref(false)
const error = ref('')
const medicamentosSeleccionados = computed(() => 
  detalles.value
    .map(d => d.medicamento?.id)
    .filter(id => !!id)
)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  icon: 'mdi-check-circle',
  btnIcon: 'mdi-close'
})

// Reglas de validación
const rules = {
  required: value => !!value || 'Campo requerido',
  rut: value => {
    const pattern = /^[0-9]{7,8}-[0-9kK]{1}$/
    return pattern.test(value) || 'RUT inválido (ej: 12345678-9)'
  }
}

// Cargar medicamentos al montar el componente
onMounted(async () => {
  await cargarMedicamentos()
})

// Métodos
const buscarPaciente = async () => {
  if (!rutPaciente.value) {
    error.value = 'Ingrese un RUT válido'
    return
  }

  buscandoPaciente.value = true
  error.value = ''

  try {
    const { data } = await axios.get(`${BASE_API_URL}/paciente/${rutPaciente.value}`)
    paciente.value = data
  } catch (err) {
    paciente.value = null
    error.value = err.response.data || 'Paciente no encontrado'
  } finally {
    buscandoPaciente.value = false
  }
}

const cargarMedicamentos = async () => {
  try {
    const { data } = await axios.get(`${BASE_API_URL}/medicamento`)
    medicamentos.value = data.filter(m => m.activo)
  } catch (e) {
    console.error('Error cargando medicamentos:', e)
    showNotification('Error al cargar medicamentos', 'error', 'mdi-alert-circle')
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
  panelAbierto.value = detalles.value.length - 1
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

const resetearFormulario = () => {
  rutPaciente.value = ''
  paciente.value = null
  detalles.value = []
  error.value = ''
}

const formularioValido = computed(() => {
  // Verificar paciente
  if (!paciente.value) return false
  
  // Verificar al menos un medicamento
  if (detalles.value.length === 0) return false
  
  // Verificar cada detalle completo
  return detalles.value.every(detalle => 
    detalle.medicamento && 
    detalle.concentracion?.trim() && 
    detalle.dosis?.trim() && 
    detalle.frecuencia?.trim() && 
    detalle.duracion?.trim()
  )
})

const guardarReceta = async () => {
  if (!formularioValido.value) {
    showNotification('Complete todos los campos requeridos', 'error', 'mdi-alert-circle')
    // Abrir todos los paneles para mostrar errores
    panelAbierto.value = [...Array(detalles.value.length).keys()]
    return
  }

  guardando.value = true
  error.value = ''

  try {
    // 1. Guardar receta
    const recetaPayload = {
      paciente: paciente.value.id,
      medico: ID_MEDICO
    }

    const recetaRes = await axios.post(`${BASE_API_URL}/receta`, recetaPayload)
    const recetaId = recetaRes.data.id

    // 2. Guardar detalles de receta
    for (const detalle of detalles.value) {
      const detallePayload = {
        receta: recetaId,
        medicamento: detalle.medicamento.id,
        concentracion: detalle.concentracion,
        dosis: detalle.dosis,
        frecuencia: detalle.frecuencia,
        duracion: detalle.duracion
      }

      await axios.post(`${BASE_API_URL}/detalle`, detallePayload)
    }

    // 3. Limpiar y notificar
    resetearFormulario()
    showNotification('Receta creada exitosamente', 'success', 'mdi-check-circle')
  } catch (err) {
    console.error('Error al guardar receta:', err)
    showNotification('Error al guardar la receta', 'error', 'mdi-alert-circle')
  } finally {
    guardando.value = false
  }
}

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

const showNotification = (text, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = {
    show: true,
    text,
    color,
    icon,
    btnIcon: color === 'success' ? 'mdi-close' : 'mdi-alert-circle'
  }
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}

.v-expansion-panel {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
