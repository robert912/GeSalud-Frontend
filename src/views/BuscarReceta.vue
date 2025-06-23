<template>
  <v-layout>
    <SidebarMedico />

    <v-main>
      <v-container class="py-8">
        <h1 class="text-h4 font-weight-bold mb-6">Listado de Recetas</h1>

        <!-- Filtros -->
        <v-card class="mb-6" variant="outlined" rounded="lg">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="filters.rut" label="Buscar por RUT"
                  prepend-inner-icon="mdi-account-search" variant="outlined" density="comfortable" hide-details
                  clearable @keyup.enter="buscarPorRut" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="filters.id" label="Buscar por ID de receta" type="number"
                  prepend-inner-icon="mdi-numeric" variant="outlined" density="comfortable" hide-details
                  clearable @keyup.enter="buscarPorId" />
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
            {{ new Date(item.fechaCreacion).toLocaleDateString() }}
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
                      {{ detalle.concentracion }} | {{ detalle.dosis }} | {{ detalle.frecuencia }} | {{ detalle.duracion }}
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

const cargarRecetas = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/receta')
    recetas.value = data
    recetasOriginal.value = data
  } catch (err) {
    console.error('Error al cargar recetas', err)
  }
}

const buscarPorRut = async () => {
  if (!filters.value.rut) {
    recetas.value = [...recetasOriginal.value]
    return
  }
  try {
    const { data } = await axios.get(`http://localhost:8080/receta/${filters.value.rut}`)
    recetas.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    console.error('Error al buscar por RUT', err)
    recetas.value = []
  }
}

const buscarPorId = () => {
  if (!filters.value.id) {
    recetas.value = [...recetasOriginal.value]
    return
  }
  recetas.value = recetasOriginal.value.filter(r => r.id === Number(filters.value.id))
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
.v-data-table {
  margin-top: 16px;
}
</style>
