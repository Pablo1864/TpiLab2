import express from 'express';
import * as examenesController from '../controladores/examenes.controlador.js'; // Asegúrate de que la ruta es correcta

const router = express.Router();

router.get('/examen', examenesController.renderExamen);
router.post('/nuevo-examen', examenesController.nuevoExamen);
router.get('/buscarexamen', examenesController.buscarExamen);
router.post('/editarExamen/:idExamen', examenesController.editarExamen);
router.post('/eliminarExamen/:idExamen', examenesController.eliminarExamen);
router.get('/ordenesanalitica', examenesController.obtenerOrdenesAnalitica);
router.get('/detalles-orden/:nroOrden', examenesController.detallesOrden);
router.get('/obtener-determinantes/:idExamen', examenesController.obtenerDeterminantes);
router.post('/cargar-resultado', examenesController.cargarResultado);
router.get('/valores-referencia', examenesController.obtenervaloresReferencia);
router.get('/obtenerResultados/:idMuestra', examenesController.obtenerResultados);
router.post('/agregarDeterminantes', examenesController.agregarDeterminantes);
router.post('/eliminarDetermintes/:idDeterminante', examenesController.eliminarDeterminante);
router.get('/obtener-valores-referencia/:idDeterminante', examenesController.obtenerValoresReferenciaPorDeterminante);
router.post('/agregarValoresReferencia', examenesController.agregarValorReferencia);
router.post('/obtener-valores-referencia/:idDeterminante', examenesController.obtenerValoresReferenciaPorDeterminante);
router.post('/validar-resultado', examenesController.validarResultado);
router.get('/imprimir-informe/:nroOrden', examenesController.imprimirInforme);

export default router;