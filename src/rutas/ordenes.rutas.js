import {Router} from 'express'

const router= Router();

// importar el controlador que se utilice
//import * as controler_usuario from '../controladores/usuario.controlador.js'

/* Ejemplo misma ruta post y get
// solo devuelve la vista registro de paciente
router.get('/registro', pacienteController.registro);
// registra al paciente
router.post('/registro', pacienteController.registrarPaciente);
*/

export default router;