import express from 'express'
import {agregarPaciente,obtenerPacientes,borrarPaciente, buscarOrdenPorID, buscarPacientePorId, buscarExamenPorIdOrden } from './src/mysql.conexion.js';

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
/*
app.get('/', (req, res) =>{
    res.render('Resultados');
})*/


//ruta inicial renderiza a paciente.pug
app.get('/', function(req,res){

    //res.render('home')

    todosPacientes = obtenerPacientes();
    res.render('paciente', {
        titulo: 'Laboratorio de analisis',
        pacientes: todosPacientes
    });

    //res.send('se inicio la aplicación')

});

app.get('/paciente',function(req, res){
    res.render('paciente')
})

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


app.get('/resultados', (req, res)=>{
    res.render('resultados', {
        datos_paciente: {
            'Paciente': null ,
            'Nombre y Apellido': null ,
            'Fecha nacimiento': null ,
            'Nro.Telefono': null ,
        },
        estado: 'noHuboBusqueda'
    })
})

//RUTA PARA BUSCAR ORDEN en View resultados
app.get('/resultados/buscar/:id', async (req, res) =>{
    let id = req.params.id;

    let orden = await buscarOrdenPorID(id); //recupero la orden

    if (orden.length > 0){

        let paciente = await buscarPacientePorId(orden[0].idPaciente); //recupero el paciente con el idPaciente en orden
        let examenes = await buscarExamenPorIdOrden(id); //recupero los examenes segun el nroOrden
        res.render('resultados', {
            datos_paciente: {
                'Paciente': paciente[0].idPaciente,
                'Nombre y Apellido': paciente[0].nombre + " " + paciente[0].apellido,
                'Fecha nacimiento': paciente[0].fechaNacimiento,
                'Nro.Telefono': paciente[0].telefono,
            },
            examenes: examenes,
            order: {
                'nro Orden': orden[0].nroOrden
            },
            estado: 'seEncontroOrden' 
        })

    } else {

        res.render('resultados', {
            datos_paciente: {
                'Paciente': null ,
                'Nombre y Apellido': null ,
                'Fecha nacimiento': null ,
                'Nro.Telefono': null ,
            },
            estado: 'SinResultadosOError'//para definir que no se encontro ninguna orden
        })
    }
    
}) 