import{Usuario} from '../modelos/usuario.mjs'

export const home= async function (req, res) {
    const userId= req.cookies.id;
if(userId){
    const user= await Usuario.verificarUsuarioPorId(userId);
    res.render('home',{rol:user.rol_id});
}
else {res.render('home',{rol:0})}
}

