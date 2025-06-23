import { createRouter, createWebHistory } from "vue-router";
import RetiroMedicamento from "@/views/RetiroMedicamento.vue";
import SeleccionRol from "@/views/SeleccionRol.vue";
import CrearReceta from "@/views/CrearReceta.vue";
import BuscarReceta from "@/views/BuscarReceta.vue";
import Medicamentos from "@/views/Medicamentos.vue";
import NotFound from "@/views/NotFound.vue";


const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/seleccion-rol'
    },
    {
        path: '/seleccion-rol',
        name: 'SeleccionRol',
        component: SeleccionRol,
        meta: {
            title: 'Sistema de Gestión de Salud'
        }
    },
    {
        path: '/medico',
        redirect: '/buscar-receta'
    },
    {
        path: '/farmaceutico',
        redirect: '/medicamentos'
    },
    {
        path: '/retiro',
        name: 'RetiroMedicamentos',
        component: RetiroMedicamento,
        meta: {
            title: 'Retiro de Medicamentos'
        }
    },
    {
        path: '/buscar-receta',
        name: 'BuscarReceta',
        component: BuscarReceta,
        meta: {
            title: 'Buscar Receta Médica'
        }
    },
    {
        path: '/crear-receta',
        name: 'CrearReceta',
        component: CrearReceta,
        meta: {
            title: 'Crear Receta Médica'
        }
    },
    {
        path: '/medicamentos',
        name: 'Medicamentos',
        component: Medicamentos,
        meta: {
            title: 'Gestión de Medicamentos'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: {
            title: 'Página no encontrada'
        }
    },
];



const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Sistema de Gestión de Salud';
    next();
});

export default router;