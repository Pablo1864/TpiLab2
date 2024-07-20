//controlador interactua con los metodos del modelo import objeto
import{Paciente} from "../modelos/paciente.mjs";
import {Usuario} from"../modelos/usuario.mjs";


export const registrarPaciente= async (req,res)=>{
    try {
        const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.body;

        const verificarSiExistePaciente= await Paciente.verificarPaciente(dni,email);
            if(verificarSiExistePaciente===0) {
              const pacienteCreado = await Paciente.crearPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);
              // registro usuario username=email, pass=dni, rol=paciente
              const registrarUsuario= await Usuario.crearUsuario(email,dni,6)    
              res.render( 'registrarPaciente', {validacionExitosa: true});                           } 
           else{
              res.render( 'registrarPaciente', {validacionError: true});
         }     
    } catch (error) {
             res.status(500).json({status:500, mensaje:"error de servidor"})
    }
                                        }
export const registro= async (req,res)=>{
        res.render('registrarPaciente');
           }
export const pacienteBuscarView= async (req,res)=>{
        const userId= req.cookies.id

        if(userId){
            const user= await Usuario.verificarUsuarioPorId(userId)
            res.render('buscarPaciente',{rol:user.rol_id});
        }
        else   {
            res.render('/')
        }
           }      

export const obtenerPacientes= async(req, res)=>{
       try {
        const pacientes = await Paciente.obtenerPacientesTodos();
        res.json(pacientes);
    } catch (err){
        res.status(500).json({error: 'Internal Server Error'})
    }
             
        }

export const actualizarPaciente= async(req, res)=>{
            const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado,idPaciente } = req.body;
            //console.log(req.body)
            try {
                const pacienteActualizar = await Paciente.actualizarPaciente(idPaciente,nombre,apellido,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,numeroAfiliado,fechaNac,dni);
                res.render('buscarPaciente',{validacionExitosa: true});
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
        
export const buscarPorEmail=async(req,res)=>{
    
        const mail = req.params.mail;
        try {
            const pacientes = await Paciente.obtenerPacientePorMail(mail);
            const data = pacientes;
            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }

}

export const buscarPorDni=async(req,res)=>{
    
        const dni = req.params.dni;
        try {
            const pacientes = await Paciente.obtenerPacienteFiltrado(dni);
            const data = pacientes;
            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    
}

export const buscarPorApellido=async(req,res)=>{
    
    const apellido = req.params.apellido;
    try {
        const pacientes = await Paciente.obtenerPacientesPorApellido(apellido);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
