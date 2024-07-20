import {Router} from 'express'
import * as controler_authUsuarios from '../controladores/authUsuarios.controlador.js'
import * as controler_home from '../controladores/home.controlador.js'
const router= Router();

//devuelve vista home según usuario logueado
router.post('/home',controler_authUsuarios.login);

router.get('/home', controler_home.home)

// Ruta inicial renderiza a la home.pug
router.get('/',controler_home.home )
router.get('/logout',controler_authUsuarios.logout)

export default router;