<template>
  <v-layout>
    <SidebarMedico />

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">Listado de Recetas</h1>
            <span class="text-subtitle-1 text-medium-emphasis">Administrador de recetas</span>
          </div>
        </div>

        <!-- Filtros -->
        <v-card class="mb-6" variant="outlined" rounded="lg">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="filters.rut" label="Buscar por RUT" prepend-inner-icon="mdi-account-search"
                  variant="outlined" density="comfortable" hide-details @input="buscarPorRut" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="filters.id" label="Buscar por ID de receta" type="number"
                  prepend-inner-icon="mdi-numeric" variant="outlined" density="comfortable" hide-details
                  @input="buscarPorId" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="filters.estado" :items="['Todos', 'Disponible', 'Retirada']"
                  label="Filtrar por estado" clearable variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-filter" @update:model-value="filtrarEstado" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Tabla de recetas -->
         <v-card rounded="lg">
                    <v-card-text class="pa-0">
        <v-data-table :headers="headers" :items="recetas" item-value="id" class="elevation-1">
          <template v-slot:item.rut="{ item }">
            {{ item.paciente.persona.rut }}
          </template>

          <template v-slot:item.paciente="{ item }">
            {{ item.paciente.persona.nombre }} {{ item.paciente.persona.apellido }}
          </template>

          <template v-slot:item.medico="{ item }">
            {{ item.medico.persona.nombre }} {{ item.medico.persona.apellido }}
          </template>

          <template v-slot:item.fechaCreacion="{ item }">
            {{ formatDateTime(item.fechaCreacion) }}
          </template>

          <template v-slot:item.disponible="{ item }">
            <v-chip :color="item.disponible ? 'success' : 'grey'" variant="tonal">
              {{ item.disponible ? 'Disponible' : 'Retirada' }}
            </v-chip>
          </template>

          <template v-slot:item.accion="{ item }">
            <v-btn color="info" size="small" @click="verDetalles(item.id)">Ver Detalles</v-btn>
          </template>
        </v-data-table>
                    </v-card-text>
        </v-card>

        <!-- Dialogo Detalle Receta -->
        <v-dialog v-model="dialogoDetalle" max-width="800">
          <v-card>
            <v-toolbar color="primary" dark>
              <v-toolbar-title>Detalle de Receta #{{ recetaSeleccionada?.id }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="dialogoDetalle = false"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar>
            <v-card-text>
              <v-list two-line>
                <v-list-item v-for="(detalle, i) in detallesReceta" :key="i">
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ detalle.medicamento.nombre }}
                      <v-chip class="ml-2" size="x-small" :color="detalle.activo ? 'success' : 'grey'">
                        {{ detalle.activo ? 'Activa' : 'Retirada' }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ detalle.concentracion }} | {{ detalle.dosis }} | {{ detalle.frecuencia }} | {{ detalle.duracion
                      }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SidebarMedico from '@/components/SidebarMedico.vue'


const recetas = ref([])
const recetasOriginal = ref([])
const dialogoDetalle = ref(false)
const recetaSeleccionada = ref(null)
const detallesReceta = ref([])

const filters = ref({
  rut: '',
  id: '',
  estado: 'Todos'
})

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Rut', value: 'rut' },
  { title: 'Paciente', value: 'paciente' },
  { title: 'Médico', value: 'medico' },
  { title: 'Fecha', value: 'fechaCreacion' },
  { title: 'Estado', value: 'disponible' },
  { title: 'Acción', value: 'accion', sortable: false },
]

const formatDateTime = (fecha) => {
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24 horas
  })
}

const cargarRecetas = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/receta')
    recetas.value = data
    recetasOriginal.value = data
  } catch (err) {
    console.error('Error al cargar recetas', err)
  }
}

const buscarPorRut = () => {
  const rut = filters.value.rut?.trim().toLowerCase()
  if (!rut) {
    recetas.value = [...recetasOriginal.value]
    return
  }

  recetas.value = recetasOriginal.value.filter(r =>
    r.paciente.persona.rut.toLowerCase().includes(rut)
  )
}

const buscarPorId = () => {
  const id = filters.value.id
  if (!id) {
    recetas.value = [...recetasOriginal.value]
    return
  }

  recetas.value = recetasOriginal.value.filter(r => 
    r.id.toString().includes(id.toString())
  )
}

const filtrarEstado = () => {
  if (filters.value.estado === 'Todos' || !filters.value.estado) {
    recetas.value = [...recetasOriginal.value]
  } else {
    const estado = filters.value.estado === 'Disponible'
    recetas.value = recetasOriginal.value.filter(r => r.disponible === estado)
  }
}

const verDetalles = async (recetaId) => {
  try {
    const { data } = await axios.get(`http://localhost:8080/detalle/receta/${recetaId}`)
    detallesReceta.value = data
    recetaSeleccionada.value = recetas.value.find(r => r.id === recetaId)
    dialogoDetalle.value = true
  } catch (err) {
    console.error('Error al cargar detalles', err)
  }
}

onMounted(() => cargarRecetas())
</script>

<style scoped>
.v-data-table :deep(th) {
    background-color: #f5f5f5 !important;
    font-weight: 600 !important;
}
</style>
