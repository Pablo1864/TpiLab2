import express from 'express'
import {agregarPaciente,obtenerPacientes,borrarPaciente } from './src/mysql.conexion.js';

const app= express();
let todosPacientes

app.listen('3000',function(){
    console.log('la app se inicio en el puerto 3000')
});

//configuración pug
app.set('views','./view');
app.set('view engine','pug');


//configuración de archivos estaticos
app.use(express.static('./view'));
app.use(express.static('./src'));
app.use(express.static('./css'));

app.get('/', (req, res) =>{
    res.render('index');
})

app.get('/registrarOrden', (req, res) =>{
    res.render('registrarOrden');
})


//ruta inicial renderiza a paciente.pug
app.get('/', function(req,res){
   
    todosPacientes=obtenerPacientes();
    res.render('paciente', {
        titulo:'Laboratorio de analisis',
        pacientes:todosPacientes});
       
    //res.send('se inicio la aplicación')

}); 

//RUTA PARA AGREGAR PACIENTE, uso funcion agregarPaciente /:fechaNac
app.get('/agregar/:nombre/:apellido/:dni/:telefono/:sexo/:fechaNac/:email/:provincia/:localidad/:domicilio/:obraSocial/:numeroAfiliado', function(req, res)
{
    let nombre= req.params.nombre;
    let apellido=req.params.apellido;
    let dni = req.params.dni;
    let telefono = req.params.telefono;
    let sexo = req.params.sexo;
    let fechaNac = req.params.fechaNac;
    let email = req.params.email;
    let provincia = req.params.provincia;
    let localidad = req.params.localidad;
    let domicilio = req.params.domicilio;
    let obraSocial = req.params.obraSocial;
    let numeroAfiliado = req.params.numeroAfiliado;




    agregarPaciente(nombre,apellido,dni,telefono,sexo,fechaNac,email, provincia, localidad, domicilio,obraSocial,numeroAfiliado);

    console.log(nombre, apellido,dni,telefono,sexo,fechaNac, email, provincia, localidad, domicilio,obraSocial,numeroAfiliado);

    res.redirect('/')
    //renderiza a app
    
});
//RUTA PARA ELIMINAR PACIENTE
app.get('/delete/:id', function(req, res){
    let id= req.params.id;
    borrarPaciente(id);
    res.redirect('/')
    

})