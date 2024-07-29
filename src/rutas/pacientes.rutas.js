import {Router} from 'express'
import {verificarToken, esAdminOrRecepcionista,todosMenosPaciente} from '../middlewares/autorizacion.js'
const router= Router();


import* as pacienteController from '../controladores/pacientes.controlador.js';

// solo devuelve la vista registro de paciente
router.get('/registro',[verificarToken,esAdminOrRecepcionista], pacienteController.registro);
// registra al paciente
router.post('/registro',[verificarToken,esAdminOrRecepcionista], pacienteController.registrarPaciente);
// solo devuelve la vista de buscar paciente
router.get('/buscar',[verificarToken,todosMenosPaciente],pacienteController.pacienteBuscarView);
// actualiza paciente y mantiene ruta de la vista actual
router.put('/buscar',[verificarToken,todosMenosPaciente,esAdminOrRecepcionista], pacienteController.actualizarPaciente);

router.get('/buscarPorMail/:mail', pacienteController.buscarPorEmail);

router.get('/buscarPorDni/:dni', pacienteController.buscarPorDni);

router.get('/buscarTodos', pacienteController.obtenerPacientes);

router.get('/buscarPorApellido/:apellido', pacienteController.buscarPorApellido);



export default router;