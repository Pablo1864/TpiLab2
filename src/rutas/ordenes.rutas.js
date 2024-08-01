import {Router} from 'express'
import {verificarToken, esAdminOrRecepcionista, esAdmin} from '../middlewares/autorizacion.js'

const router= Router();

import* as ordenController from '../controladores/ordenes.controlador.js';

router.get('/crear', [verificarToken,esAdminOrRecepcionista] , ordenController.renderCreateOrden); //se encarga de renderizar la vista de crear
router.get('/editar/:id', [verificarToken, esAdminOrRecepcionista], ordenController.renderEditOrden); //se encarga de renderizar la vista de editar orden
router.get('/editar/admin/:id', [verificarToken, esAdmin], ordenController.renderEditOrdenAdmin);
router.get('/administracion', [verificarToken, esAdminOrRecepcionista], ordenController.renderAdministracion); //se encarga de renderizar la vista de administrar ordenes

//routas para buscar (searching btns en la vista de crear y editar)
router.get('/buscar/pacientes', ordenController.buscarPacientes);//se encarga de busqueda por paciente(email, apellido, id, dni o vacio)
router.get('/buscar/medicos', ordenController.buscarMedicos);
router.get('/buscar/diagnosticos', ordenController.buscarDiagnosticos);
router.get('/buscar/examenes', ordenController.buscarExamenes);

//routas para buscar ordenes 
router.get('/administracion/search', [verificarToken, esAdminOrRecepcionista], ordenController.buscarOrdenesAdministracion);//se encarga de renderizar la vista de administrar ordenes

router.post('/crear', [verificarToken, esAdminOrRecepcionista], ordenController.crearOrden); //se encarga de crear una nueva orden
router.patch('/modificarMuestras', [verificarToken, esAdminOrRecepcionista], ordenController.modificarMuestras);
router.post('/imprimir/datasample', [verificarToken, esAdminOrRecepcionista], ordenController.buscarDataParaImprimir);
router.post('/editar/:id', [verificarToken, esAdminOrRecepcionista], ordenController.modificarOrden);//se encarga de modificar una orden
router.post('/editar/admin/:id', [verificarToken, esAdmin], ordenController.modificarOrdenAdmin);

router.get('/detalle/:id', [verificarToken, esAdminOrRecepcionista], ordenController.getDetalleOrden);//se encarga de returnar el detalle de una orden
router.patch('/desactivar/:id', [verificarToken, esAdminOrRecepcionista], ordenController.desactivarOrden);//se encarga de desactivar una orden
router.patch('/cambiarEstado/:id', [verificarToken, esAdminOrRecepcionista], ordenController.cambiarEstado);//se encarga de cambiar el estado de una orden
router.patch('/activar/:id', [verificarToken, esAdmin], ordenController.activarOrden);//se encarga de activar una orden
// importar el controlador que se utilice
//import * as controler_usuario from '../controladores/usuario.controlador.js'

/* Ejemplo misma ruta post y get
// solo devuelve la vista registro de paciente
router.get('/registro', pacienteController.registro);
// registra al paciente
router.post('/registro', pacienteController.registrarPaciente);
*/

export default router;