import {Router} from 'express'

const router= Router();

import {verificarToken, esAdmin, esAdminOrRecepcionista} from '../middlewares/autorizacion.js';

import * as controler_authUsuarios from '../controladores/authUsuarios.controlador.js'


//devuelve vista login
router.get('/login',controler_authUsuarios.loginView);

//router.get('/logout',controler_authUsuarios.logout)

router.get('/crear', [verificarToken, esAdmin],controler_authUsuarios.registroUsuariosVista);

router.post('/crear', [verificarToken,esAdmin], controler_authUsuarios.registroUsuario)

export default router;