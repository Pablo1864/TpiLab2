import {Usuario} from '../modelos/usuario.mjs';
import jwt from 'jsonwebtoken';
import config from '../config.js'


export const loginView= async (req, res)=>{
        res.render('login')
};

export const login= async (req, res)=>{
    const{usuario, pass}= req.body;
   
    //si el usuario exite devuelve la passhash sino 0
    const user = await Usuario.verificarUsuario(usuario);
    if(user===0)
       //res.json("EL usuario no existe")
    res.render('login',{validacion: false})
          
    else{
       //el usuario exite controlo que coincida su pass y user
        const passhash= user.password;
        const id= user.idUsuario;
        const rol= user.rol_id;

        const controlUsuario= await Usuario.login(pass,passhash);
        if(controlUsuario){
          const token = jwt.sign({id:user.idUsuario},config.SECRET,{
                expiresIn:'12h' //tiempo en que expira el token
            })

            if(rol){
                console.log('el token es :  '+token+'  el rol es: ' + rol);
                res.cookie('token', token, { httpOnly: true });
                res.cookie('id', id, { httpOnly: true });
                //renderiza a la home, con nav dependiendo el rol
                res.render('home', {rol:rol})
          
            }
        
            else{
                //No tiene rol
            }

            //res.json( 'las credenciales son correctas tome el token '+ token)
        }
        else res.render('login',{validacion: false}) //res.json("La contraseña es incorrecta")
        
     }  
    };

export const logout= async (req, res)=>{
    res.clearCookie('token'); // Eliminar la cookie
    res.clearCookie('id');
    //res.render('home', {rol:0})
    res.redirect('/')
};

export const registroUsuariosVista= async (req, res)=>{
  
    res.render('registro')

    };

export const registroUsuario= async (req, res)=>{
//recupero el id del usuario logueado
const id= req.cookies.id;

const user=await Usuario.verificarUsuarioPorId(id)
//datos registro del nuevo usuario del sistema
 const {usuario,rol,pass}= req.body;

if(user){
  const user= await Usuario.crearUsuario(usuario,pass, rol);

    res.render('registro',{validacion:true})
   // res.json("se creo el usuario")
}
else res.json("No se pudo crear al usuario")
        };

