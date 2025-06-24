<template>
    <v-layout>
        <!-- Sidebar Component -->
        <SidebarFarmaceutico />

        <!-- Main Content -->
        <v-main class="bg-grey-lighten-5">
            <v-container fluid class="pa-6">
                <!-- Header -->
                <div class="d-flex justify-space-between align-center mb-6">
                    <div>
                        <h1 class="text-h4 font-weight-bold mb-1">Gestión de Medicamentos</h1>
                        <span class="text-subtitle-1 text-medium-emphasis">Administra tu inventario de
                            medicamentos</span>
                    </div>

                    <v-btn color="primary" size="large" prepend-icon="mdi-plus" rounded="pill"
                        @click="showCreateDialog">
                        Nuevo Medicamento
                    </v-btn>
                </div>

                <!-- Filters Card -->
                <v-card class="mb-6" variant="outlined" rounded="lg">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="filters.busqueda" label="Buscar por nombre"
                                    prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable"
                                    hide-details></v-text-field>
                            </v-col>

                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="filters.controlado" label="Tipo" :items="tiposMedicamento"
                                    item-title="text" item-value="value" variant="outlined" density="comfortable"
                                    clearable hide-details></v-select>
                            </v-col>

                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="filters.stockLevel" :items="[
                                    { text: 'Crítico (≤5)', value: 'critical' },
                                    { text: 'Bajo (6-10)', value: 'low' },
                                    { text: 'Normal (11-50)', value: 'normal' },
                                    { text: 'Alto (>50)', value: 'high' }
                                ]" item-title="text" item-value="value" label="Nivel de stock" clearable></v-select>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Medicamentos Table -->
                <v-card rounded="lg">
                    <v-card-text class="pa-0">
                        <v-data-table :headers="headers" :items="medicamentosFiltrados" :loading="loading"
                            class="elevation-0">
                            <!-- Controlado Column -->
                            <template v-slot:item.controlado="{ item }">
                                <v-chip :color="item.controlado ? 'orange' : 'green'" size="small">
                                    {{ item.controlado ? 'Controlado' : 'No controlado' }}
                                </v-chip>
                            </template>

                            <!-- Stock Column -->
                            <template v-slot:item.stock="{ item }">
                                <v-chip :color="getStockColor(item.stock)" size="small">
                                    {{ item.stock }}
                                </v-chip>
                            </template>

                            <!-- Valor Column -->
                            <template v-slot:item.valor="{ item }">
                                <span class="font-weight-medium">
                                    {{ formatPrecio(item.valor) }}
                                </span>
                            </template>

                            <!-- Actions Column -->
                            <template v-slot:item.actions="{ item }">
                                <div class="d-flex gap-2">
                                    <v-btn icon="mdi-pencil" variant="text" color="primary" size="small"
                                        @click="editMedicamento(item)"></v-btn>

                                    <v-btn icon="mdi-delete" variant="text" color="error" size="small"
                                        @click="confirmDelete(item)"></v-btn>

                                    <v-btn icon="mdi-eye" variant="text" color="info" size="small"
                                        @click="viewMedicamentoDetails(item)"></v-btn>
                                </div>
                            </template>

                            <!-- Empty State -->
                            <template v-slot:no-data>
                                <div class="d-flex flex-column align-center pa-12">
                                    <v-icon icon="mdi-pill" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
                                    <h3 class="text-h5 font-weight-medium mb-2">No hay medicamentos</h3>
                                    <p class="text-body-1 text-medium-emphasis mb-6">
                                        Comienza añadiendo medicamentos a tu inventario
                                    </p>
                                    <v-btn color="primary" prepend-icon="mdi-plus" rounded="pill"
                                        @click="showCreateDialog">
                                        Nuevo Medicamento
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>

        <!-- Create/Edit Medicamento Dialog -->
        <v-dialog v-model="dialogs.medicamento" max-width="800px" persistent>
            <v-card>
                <v-toolbar :color="modoEdicion ? 'primary' : 'primary'"
                    :title="modoEdicion ? 'Editar Medicamento' : 'Nuevo Medicamento'">
                    <v-btn icon="mdi-close" variant="text" @click="dialogs.medicamento = false"></v-btn>
                </v-toolbar>

                <v-card-text class="pt-4">
                    <v-form ref="form" v-model="formValid" @submit.prevent="saveMedicamento">
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.nombre" label="Nombre del medicamento"
                                        required :rules="[v => !!v || 'El nombre es requerido']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.uso" label="Uso" required
                                        :rules="[v => !!v || 'El uso es requerido']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select v-model="medicamentoActual.controlado" :items="[
                                        { text: 'Sí', value: true },
                                        { text: 'No', value: false }
                                    ]" item-title="text" item-value="value" label="¿Es controlado?" required
                                        :rules="[v => v !== null || 'Este campo es requerido']"></v-select>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.presentacion" label="Presentación" required
                                        :rules="[v => !!v || 'La presentación es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.dosis" label="Dosis" required
                                        :rules="[v => !!v || 'La dosis es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.concentracion" label="Concentración"
                                        :rules="[v => !!v || 'La concentración es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model.number="medicamentoActual.stock" label="Stock" type="number"
                                        required :rules="[
                                            v => v !== null || 'El stock es requerido',
                                            v => v >= 0 || 'El stock no puede ser negativo'
                                        ]"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model.number="medicamentoActual.valor" label="Valor" type="number"
                                        prefix="$" required :rules="[
                                            v => v !== null || 'El valor es requerido',
                                            v => v >= 0 || 'El valor no puede ser negativo'
                                        ]"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.frecuencia" label="Frecuencia"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.duracion" label="Duración"></v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-textarea v-model="medicamentoActual.indicaciones" label="Indicaciones"
                                        rows="3"></v-textarea>
                                </v-col>

                                <!--v-col cols="12">
                                    <v-switch v-model="medicamentoActual.activo" label="Activo"
                                        color="primary"></v-switch>
                                </v-col-->
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>

                <v-card-actions class="pb-4 px-6">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="dialogs.medicamento = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" @click="saveMedicamento" :loading="saving" :disabled="!formValid">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="dialogs.delete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5 bg-error text-white">
                    Confirmar eliminación
                </v-card-title>

                <v-card-text class="pt-4">
                    <p>¿Estás seguro que deseas eliminar el medicamento "{{ medicamentoAEliminar?.nombre }}"?</p>
                    <p class="text-caption text-medium-emphasis mt-2">Esta acción no se puede deshacer</p>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="dialogs.delete = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="error" @click="deleteMedicamento" :loading="deleting">
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- View Medicamento Details Dialog -->
        <v-dialog v-model="dialogs.view" max-width="700px">
            <v-card v-if="medicamentoDetalle">
                <v-toolbar color="info" :title="medicamentoDetalle.nombre">
                    <v-btn icon="mdi-close" variant="text" @click="dialogs.view = false"></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-list>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-information-outline</v-icon>
                            </template>
                            <v-list-item-title>Uso</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.uso || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-pill</v-icon>
                            </template>
                            <v-list-item-title>Tipo</v-list-item-title>
                            <v-list-item-subtitle>
                                <v-chip :color="medicamentoDetalle.controlado ? 'orange' : 'green'" size="small">
                                    {{ medicamentoDetalle.controlado ? 'Controlado' : 'No controlado' }}
                                </v-chip>
                            </v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-package-variant</v-icon>
                            </template>
                            <v-list-item-title>Presentación</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.presentacion || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-medication</v-icon>
                            </template>
                            <v-list-item-title>Dosis</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.dosis || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-test-tube</v-icon>
                            </template>
                            <v-list-item-title>Concentración</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.concentracion || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-clock-outline</v-icon>
                            </template>
                            <v-list-item-title>Frecuencia</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.frecuencia || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-calendar-clock</v-icon>
                            </template>
                            <v-list-item-title>Duración</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.duracion || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-numeric</v-icon>
                            </template>
                            <v-list-item-title>Stock</v-list-item-title>
                            <v-list-item-subtitle>
                                <v-chip :color="getStockColor(medicamentoDetalle.stock)" size="small">
                                    {{ medicamentoDetalle.stock || '-' }}
                                </v-chip>
                            </v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-cash</v-icon>
                            </template>
                            <v-list-item-title>Valor</v-list-item-title>
                            <v-list-item-subtitle>{{ formatPrecio(medicamentoDetalle.valor) }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-text</v-icon>
                            </template>
                            <v-list-item-title>Indicaciones</v-list-item-title>
                            <v-list-item-subtitle>{{ medicamentoDetalle.indicaciones || '-' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-check-circle</v-icon>
                            </template>
                            <v-list-item-title>Estado</v-list-item-title>
                            <v-list-item-subtitle>
                                <v-chip :color="medicamentoDetalle.activo ? 'success' : 'error'" size="small">
                                    {{ medicamentoDetalle.activo ? 'Activo' : 'Inactivo' }}
                                </v-chip>
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" prepend-icon="mdi-pencil"
                        @click="editMedicamento(medicamentoDetalle)">
                        Editar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import SidebarFarmaceutico from '@/components/SidebarFarmaceutico.vue';

// Table headers
const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Nombre', key: 'nombre', sortable: true },
    { title: 'Uso', key: 'uso', sortable: true },
    { title: 'Tipo', key: 'controlado', sortable: true, align: 'center' },
    { title: 'Presentación', key: 'presentacion', sortable: true },
    { title: 'Dosis', key: 'dosis', sortable: false },
    { title: 'Concentración', key: 'concentracion', sortable: false },
    { title: 'Stock', key: 'stock', sortable: true, align: 'center' },
    { title: 'Valor', key: 'valor', sortable: true, align: 'end' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
];

// Estado
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const medicamentos = ref([]);
const stockMinimoCritico = ref({
    danger: 5,    // Umbral para color rojo
    warning: 10,   // Umbral para color amarillo
    info: 50   // Umbral para color celeste
});

// Filtros
const filters = ref({
    busqueda: '',
    controlado: null,
    stockLevel: null
});

// Tipos de medicamento para filtro
const tiposMedicamento = [
    { text: 'Controlados', value: true },
    { text: 'No controlados', value: false }
];

// Dialog states
const dialogs = ref({
    medicamento: false,
    delete: false,
    view: false
});

// Form state
const formValid = ref(false);
const form = ref(null);
const modoEdicion = ref(false);
const medicamentoActual = ref({
    id: null,
    nombre: '',
    uso: '',
    controlado: false,
    presentacion: '',
    dosis: '',
    concentracion: '',
    frecuencia: '',
    duracion: '',
    indicaciones: '',
    stock: 0,
    valor: 0,
    activo: true
});
const medicamentoAEliminar = ref(null);
const medicamentoDetalle = ref(null);

// Snackbar
const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
});

// API URL
const API_URL = '/medicamento';

// Computed
const medicamentosFiltrados = computed(() => {
    return medicamentos.value.filter(med => {
        // Filtro por búsqueda
        if (filters.value.busqueda &&
            !med.nombre.toLowerCase().includes(filters.value.busqueda.toLowerCase())) {
            return false;
        }

        // Filtro por tipo (controlado/no controlado)
        if (filters.value.controlado !== null &&
            med.controlado !== filters.value.controlado) {
            return false;
        }

        // Filtro por stock
        if (filters.value.stockLevel) {
            const stock = med.stock || 0;
            const { stockLevel } = filters.value;

            const conditions = {
                critical: stock <= 5,
                low: stock > 5 && stock <= 10,
                normal: stock > 10 && stock <= 50,
                high: stock > 50
            };

            if (!conditions[stockLevel]) return false;
        }

        return true;
    });
});

// Métodos de utilidad
const formatPrecio = (valor) => {
    if (valor === null || valor === undefined) return "-";
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(valor);
};

const getStockColor = (stock) => {
    if (stock === null || stock === undefined) return "grey";
    if (stock <= stockMinimoCritico.value.danger) return 'error';
    if (stock <= stockMinimoCritico.value.warning) return 'warning';
    if (stock <= stockMinimoCritico.value.info) return 'info';
    return 'success';
};

const showNotification = (text, color = 'success') => {
    snackbar.value = {
        show: true,
        text,
        color
    };
};

// Métodos principales
const cargarMedicamentos = async () => {
    loading.value = true;
    try {
        const response = await axios.get(API_URL);

        // Asegurar que todos los campos numéricos estén como números
        medicamentos.value = response.data.map(med => ({
            ...med,
            stock: Number(med.stock),
            valor: Number(med.valor)
        }));

    } catch (error) {
        console.error('Error al cargar medicamentos:', error);
        showNotification('Error al cargar medicamentos', 'error');
        medicamentos.value = [];
    } finally {
        loading.value = false;
    }
};

const showCreateDialog = () => {
    modoEdicion.value = false;
    medicamentoActual.value = {
        id: null,
        nombre: '',
        uso: '',
        controlado: false,
        presentacion: '',
        dosis: '',
        concentracion: '',
        frecuencia: '',
        duracion: '',
        indicaciones: '',
        stock: 0,
        valor: 0,
        activo: true
    };
    dialogs.value.medicamento = true;
};

const editMedicamento = (medicamento) => {
    modoEdicion.value = true;
    medicamentoActual.value = { ...medicamento };
    dialogs.value.medicamento = true;

    // Si estamos viendo los detalles, cerramos ese diálogo
    if (dialogs.value.view) {
        dialogs.value.view = false;
    }
};

const saveMedicamento = async () => {
    if (!formValid.value) return;

    saving.value = true;
    try {
        if (modoEdicion.value) {
            // Actualizar medicamento existente
            await axios.put(`${API_URL}/${medicamentoActual.value.id}`, medicamentoActual.value);
            showNotification('Medicamento actualizado correctamente', 'success');
        } else {
            // Crear nuevo medicamento
            await axios.post(API_URL, medicamentoActual.value);
            showNotification('Medicamento creado correctamente', 'success');
        }

        // Recargar medicamentos
        await cargarMedicamentos();

        // Cerrar diálogo
        dialogs.value.medicamento = false;
    } catch (error) {
        console.error('Error al guardar medicamento:', error);
        showNotification('Error al guardar medicamento', 'error');
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (medicamento) => {
    medicamentoAEliminar.value = medicamento;
    dialogs.value.delete = true;
};

const deleteMedicamento = async () => {
    if (!medicamentoAEliminar.value) return;

    deleting.value = true;
    try {
        await axios.delete(`${API_URL}/${medicamentoAEliminar.value.id}`);

        // Recargar medicamentos
        await cargarMedicamentos();

        // Cerrar diálogo
        dialogs.value.delete = false;

        showNotification('Medicamento eliminado correctamente', 'success');
    } catch (error) {
        console.error('Error al eliminar medicamento:', error);
        showNotification('Error al eliminar medicamento', 'error');
    } finally {
        deleting.value = false;
    }
};

const viewMedicamentoDetails = (medicamento) => {
    medicamentoDetalle.value = { ...medicamento };
    dialogs.value.view = true;
};

// Lifecycle hooks
onMounted(() => {
    cargarMedicamentos();
});
</script>

<style scoped>
.v-data-table :deep(th) {
    background-color: #f5f5f5 !important;
    font-weight: 600 !important;
}

.v-list-item {
    padding-left: 0;
    padding-right: 0;
}
</style>