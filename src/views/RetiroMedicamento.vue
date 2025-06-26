<template>
  <v-layout>
    <!-- Sidebar -->
    <SidebarFarmaceutico />

    <!-- Main Content -->
    <v-main class="">
      <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Entrega de Medicamentos</h1>
            <span class="text-subtitle-1 text-medium-emphasis">Buscar paciente para entregar recetas</span>
          </div>
        </div>

        <!-- Buscador de Paciente -->
        <v-card class="mb-6">
          <v-card-text>
            <v-form @submit.prevent="buscarPaciente">
              <v-row align="center">
                <v-col cols="12" md="8">
                  <v-text-field 
                    v-model="rutPaciente" 
                    label="RUT del paciente" 
                    placeholder="Ej: 12345678-9"
                    :rules="[rules.required, rules.rut]"
                    @keyup.enter="buscarPaciente"
                  />
                </v-col>
                <v-col cols="12" md="4" class ="pb-5 pt-0">
                  <v-btn 
                    color="primary"
                    block 
                    size="large"
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
        <v-card v-if="paciente" class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account</v-icon>
            <span>Datos del Paciente</span>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Nombre:</v-list-item-title>
                <v-list-item-subtitle>{{ paciente.persona.nombre }} {{ paciente.persona.apellido }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">RUT:</v-list-item-title>
                <v-list-item-subtitle>{{ paciente.persona.rut }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Previsión:</v-list-item-title>
                <v-list-item-subtitle>{{ paciente.prevision }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Recetas Disponibles -->
        <template v-if="recetas.length > 0">
          <h2 class="text-h5 mb-4">Recetas Disponibles</h2>
          
          <v-expansion-panels>
            <v-expansion-panel v-for="receta in recetas" :key="receta.id">
              <v-expansion-panel-title>
                <div class="d-flex align-center gap-4">
                  <v-chip :color="receta.disponible ? 'success' : 'grey'" size="small">
                    {{ receta.disponible ? 'Disponible' : 'Entregada' }}
                  </v-chip>
                  <span>Receta #{{ receta.id }} - <strong>Medico:</strong> {{ receta.medico.persona.nombre }}  {{ receta.medico.persona.apellido }} - {{ formatFecha(receta.fechaCreacion) }}</span>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card v-if="detallesReceta[receta.id]" variant="flat">
                  <v-card-text>
                    <v-table density="comfortable">
                      <thead>
                        <tr>
                          <th>Medicamento</th>
                          <th>Presentación</th>
                          <th>Dosis</th>
                          <th>Stock</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="detalle in detallesReceta[receta.id]" :key="detalle.id">
                          <td>
                            <div class="font-weight-medium">{{ detalle.medicamento.nombre }}</div>
                            <div class="text-caption">{{ detalle.medicamento.concentracion }}</div>
                          </td>
                          <td>{{ detalle.medicamento.presentacion }}</td>
                          <td>{{ detalle.dosis }} {{ detalle.frecuencia }} * {{ detalle.duracion }}</td>
                          <td>
                            <v-chip :color="getStockColor(detalle.medicamento.stock)" size="small">
                              {{ detalle.medicamento.stock }}
                            </v-chip>
                          </td>
                          <td>
                            <v-btn 
                              v-if="receta.disponible && detalle.activo"
                              color="primary" 
                              size="small"
                              @click="entregarMedicamento(detalle, receta.id)"
                              :loading="detalle.entregando"
                              :disabled="detalle.medicamento.stock <= 0"
                            >
                              Entregar
                            </v-btn>
                            <v-chip v-else color="success" size="small">
                              Entregado
                            </v-chip>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
                <v-progress-circular v-else indeterminate color="primary" />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>

        <!-- Mensajes de estado -->
        <v-alert v-if="error" type="info" class="mt-4">
          {{ error }}
        </v-alert>

        <!-- Snackbar para notificaciones -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
          {{ snackbar.text }}
          <template v-slot:actions>
            <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import SidebarFarmaceutico from '@/components/SidebarFarmaceutico.vue'
import { BASE_API_URL, ID_FARMACEUTICO } from '@/constants/globals'

// Estado
const rutPaciente = ref('')
const buscandoPaciente = ref(false)
const paciente = ref(null)
const recetas = ref([])
const detallesReceta = ref({})
const error = ref('')
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Reglas de validación
const rules = {
  required: value => !!value || 'Campo requerido',
  rut: value => {
    const pattern = /^[0-9]{7,8}-[0-9kK]{1}$/
    return pattern.test(value) || 'RUT inválido (ej: 12345678-9)'
  }
}

// Métodos
const buscarPaciente = async () => {
  if (!rutPaciente.value) {
    error.value = 'Ingrese un RUT válido'
    return
  }
  
  buscandoPaciente.value = true
  error.value = ''
  paciente.value = null
  recetas.value = []
  detallesReceta.value = {}

  try {
    // Buscar paciente y recetas
    const response = await axios.get(`${BASE_API_URL}/receta/${rutPaciente.value}`)
    recetas.value = response.data.filter(r => r.disponible)
    
    if (recetas.value.length > 0) {
      paciente.value = recetas.value[0].paciente
      // Cargar detalles de cada receta
      await Promise.all(recetas.value.map(receta => cargarDetallesReceta(receta.id)))
    } else {
      error.value = recetas.data || 'No se encontraron recetas disponibles para este paciente'
    }
  } catch (err) {
    error.value = err.response.data || 'Paciente no encontrado o error en la búsqueda'
  } finally {
    buscandoPaciente.value = false
  }
}

const cargarDetallesReceta = async (recetaId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/detalle/receta/${recetaId}`)
    detallesReceta.value[recetaId] = response.data.map(d => ({
      ...d,
      entregando: false
    }))
  } catch (err) {
    console.error('Error al cargar detalles:', err)
    detallesReceta.value[recetaId] = []
  }
}

const entregarMedicamento = async (detalle, recetaId) => {
  detalle.entregando = true
  
  try {
    // 1. Desactivar el detalle
    await axios.put(`${BASE_API_URL}/detalle/desactivar/${detalle.id}`)
    
    // 2. Bajar el stock en 1
    const nuevoStock = detalle.medicamento.stock - 1;
    await axios.put(`${BASE_API_URL}/medicamento/${detalle.medicamento.id}`, {
      ...detalle.medicamento,
      stock: nuevoStock,
    });

    // 3. Registrar el retiro
    await axios.post(`${BASE_API_URL}/retiro`, {
      detalleReceta: detalle.id,
      farmaceutico: ID_FARMACEUTICO
    })
    
    // 4. Actualizar lista de detalles
    await cargarDetallesReceta(recetaId)
    
    // 5. Verificar si todos los detalles están entregados
    const todosEntregados = detallesReceta.value[recetaId].every(d => !d.activo)
    if (todosEntregados) {
      await axios.put(`${BASE_API_URL}/receta/bloquear/${recetaId}`)
      // Actualizar estado de la receta
      const recetaIndex = recetas.value.findIndex(r => r.id === recetaId)
      if (recetaIndex !== -1) {
        recetas.value[recetaIndex].disponible = false
      }
    }
    
    showNotification('Medicamento entregado correctamente')
  } catch (err) {
    console.error('Error al entregar medicamento:', err)
    showNotification('Error al entregar medicamento', 'error')
  } finally {
    detalle.entregando = false
  }
}

const getStockColor = (stock) => {
  if (stock <= 5) return 'error'
  if (stock <= 15) return 'warning'
  return 'success'
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24 horas
  })
}

const showNotification = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>