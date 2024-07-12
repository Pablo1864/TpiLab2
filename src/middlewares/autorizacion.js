import {Usuario} from '../modelos/usuario.mjs';
import config from '../config.js';
import jwt from 'jsonwebtoken';


//verifica si el usuario tiene el token y el rol que tiene
export const verificarToken=async(req, res, next)=>{
const token= req.cookies.token
    //const token=req.headers["x-access-token"];
    console.log('autorizacion.js en metodo verificarToken, token: ' + token)
    if(!token)
        return res.json('no tiene token');

    //decodifica el token y recupero el id del usuario para consultar su rol
    else{
        const decoded= jwt.verify(token,config.SECRET);
       // const usuarioId= await Usuario.verificarUsuarioPorId(decoded.id);
        console.log('el id del usuario es: ' + decoded.id);
       
        next()
    }
    
}
export const esAdmin = async(req, res, next)=>{
    const userId= req.cookies.id;
    console.log('esAdmin UserId: '+ userId)
    const user= await Usuario.verificarUsuarioPorId(userId);
    console.log(user);
    if (user.rol_id == 1){
        console.log('autorizacion.js-> es Admin rol del usuario: '+user.rol_id + ' es admin')
        next()
    }
    else return false//user
}

export const esAdminOrRecepcionista = async(req, res, next)=>{
    const userId= req.body.id;

    const user=Usuario.verificarUsuarioPorId(userId);
    if (user===4 || user===1){
        console.log(' rol del usuario: '+user.rol)
        next()
    }
    else return false
}