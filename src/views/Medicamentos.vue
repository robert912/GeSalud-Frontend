<template>
    <v-layout>
        <!-- Sidebar Component -->
        <SidebarFarmaceutico />

        <!-- Main Content -->
        <v-main class="">
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
                                <v-select v-model="filters.controlado" label="Tipo" prepend-inner-icon="mdi-pill-off"
                                    :items="tiposMedicamento" item-title="text" item-value="value" variant="outlined"
                                    density="comfortable" clearable hide-details></v-select>
                            </v-col>

                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="filters.stockLevel" prepend-inner-icon="mdi-barcode-scan" :items="[
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

                            <template v-for="header in headers" :key="header.key" v-slot:[`header.${header.key}`]>
                                <v-tooltip location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">{{ header.title }}</span>
                                    </template>
                                    <span>{{ header.description }}</span>
                                </v-tooltip>
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
                                    <v-text-field v-model="medicamentoActual.nombre" placeholder="Medicamento"
                                        label="Nombre del medicamento" hint="Ej: Paracetamol, Ibuprofeno"
                                        persistent-hint required
                                        :rules="[v => !!v || 'El nombre es requerido']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.uso"
                                        placeholder="Inflamación, Fiebre, Alergia" label="Uso"
                                        hint="Uso terapéutico, ej: Analgésico, Antiinflamatorio" persistent-hint
                                        required :rules="[v => !!v || 'El uso es requerido']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select v-model="medicamentoActual.controlado" :items="[
                                        { text: 'Sí', value: true },
                                        { text: 'No', value: false }
                                    ]" item-title="text" item-value="value" label="¿Es controlado?"
                                        hint="Indica si requiere receta retenida" persistent-hint required
                                        :rules="[v => v !== null || 'Este campo es requerido']"></v-select>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.presentacion"
                                        placeholder="Comprimidos, Jarabe, Capsulas" label="Presentación"
                                        hint="Ej: Caja x 10 comprimidos, Frasco de 120 ml" persistent-hint required
                                        :rules="[v => !!v || 'La presentación es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.dosis"
                                        placeholder="1 Comprimido, 1 Capsula" label="Dosis"
                                        hint="Ej: 1 comprimido cada 8 horas" persistent-hint required
                                        :rules="[v => !!v || 'La dosis es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.concentracion" placeholder="500 mg"
                                        label="Concentración" hint="Ej: 500 mg, 5 mg/ml" persistent-hint
                                        :rules="[v => !!v || 'La concentración es requerida']"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model.number="medicamentoActual.stock" label="Stock" type="number"
                                        hint="Cantidad en inventario (ej: 50 unidades)" persistent-hint required :rules="[
                                            v => v !== null || 'El stock es requerido',
                                            v => v >= 0 || 'El stock no puede ser negativo'
                                        ]"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model.number="medicamentoActual.valor" label="Valor" type="number"
                                        prefix="$" hint="Precio unitario (ej: $1500)" persistent-hint required :rules="[
                                            v => v !== null || 'El valor es requerido',
                                            v => v >= 0 || 'El valor no puede ser negativo'
                                        ]"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.frecuencia" placeholder="Cada 8 horas.."
                                        label="Frecuencia" hint="Frecuencia de administración, ej: Cada 12 horas"
                                        persistent-hint></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="medicamentoActual.duracion" placeholder="5 días"
                                        label="Duración" hint="Duración del tratamiento, ej: 5 días"
                                        persistent-hint></v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-textarea v-model="medicamentoActual.indicaciones"
                                        placeholder="Tomar en ayunas..." label="Indicaciones"
                                        hint="Instrucciones adicionales para el paciente" persistent-hint
                                        rows="3"></v-textarea>
                                </v-col>

                                <!--v-col cols="12">
                                    <v-switch v-model="medicamentoActual.activo" label="Activo"
                                        hint="Indica si el medicamento está disponible"
                                        persistent-hint
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
            <v-card v-if="medicamentoDetalle" rounded="lg">
                <v-toolbar color="info" density="compact" :title="medicamentoDetalle.nombre">
                    <v-btn icon="mdi-close" variant="text" @click="dialogs.view = false"></v-btn>
                </v-toolbar>

                <v-card-text class="pa-6">
                    <v-row>
                        <!-- Columna Izquierda -->
                        <v-col cols="12" md="6">
                            <!-- Uso -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-information-outline</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Uso</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.uso || '-' }}</div>
                                </div>
                            </div>

                            <!-- Tipo -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-pill</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Tipo</div>
                                    <v-chip :color="medicamentoDetalle.controlado ? 'orange' : 'green'" size="small"
                                        class="mt-1">
                                        {{ medicamentoDetalle.controlado ? 'Controlado' : 'No controlado' }}
                                    </v-chip>
                                </div>
                            </div>

                            <!-- Presentación -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-package-variant</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Presentación</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.presentacion || '-' }}</div>
                                </div>
                            </div>

                            <!-- Dosis -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-medication</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Dosis</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.dosis || '-' }}</div>
                                </div>
                            </div>

                            <!-- Concentración -->
                            <div class="d-flex align-center">
                                <v-icon color="primary" class="mr-3">mdi-test-tube</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Concentración</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.concentracion || '-' }}</div>
                                </div>
                            </div>
                        </v-col>

                        <!-- Columna Derecha -->
                        <v-col cols="12" md="6">
                            <!-- Frecuencia -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-clock-outline</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Frecuencia</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.frecuencia || '-' }}</div>
                                </div>
                            </div>

                            <!-- Duración -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-calendar-clock</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Duración</div>
                                    <div class="text-body-1">{{ medicamentoDetalle.duracion || '-' }}</div>
                                </div>
                            </div>

                            <!-- Stock -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-numeric</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Stock</div>
                                    <v-chip :color="getStockColor(medicamentoDetalle.stock)" size="small" class="mt-1">
                                        {{ medicamentoDetalle.stock || '-' }}
                                    </v-chip>
                                </div>
                            </div>

                            <!-- Valor -->
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-3">mdi-cash</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Valor</div>
                                    <div class="text-body-1">{{ formatPrecio(medicamentoDetalle.valor) }}</div>
                                </div>
                            </div>

                            <!-- Estado -->
                            <div class="d-flex align-center">
                                <v-icon color="primary" class="mr-3">mdi-check-circle</v-icon>
                                <div>
                                    <div class="text-caption text-medium-emphasis">Estado</div>
                                    <v-chip :color="medicamentoDetalle.activo ? 'success' : 'error'" size="small"
                                        class="mt-1">
                                        {{ medicamentoDetalle.activo ? 'Activo' : 'Inactivo' }}
                                    </v-chip>
                                </div>
                            </div>
                        </v-col>
                    </v-row>

                    <!-- Indicaciones (full width) -->
                    <v-divider class="my-4"></v-divider>
                    <div class="d-flex align-start">
                        <v-icon color="primary" class="mr-3 mt-1">mdi-text</v-icon>
                        <div>
                            <div class="text-caption text-medium-emphasis mb-2">Indicaciones</div>
                            <div class="text-body-1">{{ medicamentoDetalle.indicaciones || '-' }}</div>
                        </div>
                    </div>
                </v-card-text>

                <v-card-actions class="px-6 pb-4">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil"
                        @click="editMedicamento(medicamentoDetalle)">
                        Editar Medicamento
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
    { title: 'ID', key: 'id', description: 'Identificador único del medicamento', sortable: true },
    { title: 'Nombre', key: 'nombre', description: 'Nombre comercial del medicamento', sortable: true },
    { title: 'Uso', key: 'uso', description: 'Uso terapéutico del medicamento', sortable: true },
    { title: 'Tipo', key: 'controlado', description: 'Indica si el medicamento es controlado', sortable: true, align: 'center' },
    { title: 'Presentación', key: 'presentacion', description: 'Forma en que se presenta el medicamento', sortable: true },
    { title: 'Dosis', key: 'dosis', description: 'Cantidad a administrar', sortable: false },
    { title: 'Concentración', key: 'concentracion', description: 'Concentración del principio activo', sortable: false },
    { title: 'Stock', key: 'stock', description: 'Cantidad disponible en inventario', sortable: true, align: 'center' },
    { title: 'Valor', key: 'valor', description: 'Precio unitario del medicamento', sortable: true, align: 'end' },
    { title: 'Acciones', key: 'actions', description: 'Editar, eliminar o ver detalles', sortable: false, align: 'center' }
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
