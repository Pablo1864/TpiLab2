import express from 'express'
import {agregarPaciente,obtenerPacientes } from './src/mysql.conexion.js';
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

//ruta inicial renderiza a paciente.pug
app.get('/', function(req,res){
    todosPacientes=obtenerPacientes();
    res.render('paciente', {
        titulo:'Laboratorio de analisis',
        pacientes:todosPacientes});
       
    //res.send('se inicio la aplicación')

});

//RUTA PARA AGREGAR PACIENTE, uso funcion agregarPaciente
app.get('/agregar/:nombre/:apellido/:dni/:telefono', function(req, res)
{
    let nombre= req.params.nombre;
    let apellido=req.params.apellido;
    let dni = req.params.dni;
    let telefono = req.params.telefono;
    agregarPaciente(nombre,apellido,dni,telefono);
    console.log(nombre, apellido);

    res.redirect('/')
    //renderiza a app
    
});