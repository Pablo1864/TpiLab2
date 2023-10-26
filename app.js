import express from 'express';
import bodyParser from 'body-parser'; // Importa body-parser
import { agregarPaciente, obtenerPacientes, obtenerPacienteFiltrado,borrarPaciente, buscarOrdenPorID, insertarExamen } from './src/mysql.conexion.js';

const app = express();

// Configura body-parser para analizar los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('La aplicación se inició en el puerto 3000');
});

app.set('views', './view');
app.set('view engine', 'pug');

// app.use(express.static('./view'));
// app.use(express.static('./src'));
// app.use(express.static('./css'));
// app.use(express.static('./src/styles'));
// app.use(express.static('./src/js'));

app.use(express.static('./public'));

//ruta inicial renderiza a paciente.pug
app.get('/', function(req,res){
   
  const todosPacientes=obtenerPacientes();
    res.render('paciente', {
        titulo:'Laboratorio de analisis',
        pacientes:todosPacientes});
    
});

app.get('/registrarPaciente',function(req, res){
    res.render('registrarPaciente')
})

app.get('/paciente', function (req, res) {
    res.render('paciente');
});

app.get('/registrarPaciente/:nombre/:apellido/:dni/:telefono/:sexo/:fechaNac/:email/:provincia/:localidad/:domicilio/:obraSocial/:numeroAfiliado', function (req, res) {
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.params;

    agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);
    res.redirect('/');
});


//RUTA PARA BUSCAR PACIENTE  
app.get('/buscarPaciente',function(req, res){
    const todosPacientes=obtenerPacientes();
    if (todosPacientes && todosPacientes.length)
       {todosPacientes.forEach(paciente => {
        console.log(paciente.apellido)
       });
    }
    res.render('buscarPaciente', {pacientes:todosPacientes})
})

app.get('/buscarPaciente/:datoBuscado',function(req, res){
    const datoBuscado= req.params.datoBuscado;
    if (datoBuscado && datoBuscado !== '')
    {
    const pacienteBuscado= obtenerPacienteFiltrado(datoBuscado); 
    if(pacienteBuscado){ res.render('buscarPaciente', {pacientes:pacienteBuscado})}
    else{console.log('no se encontro el paciente')}
    }
    })

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
            orden: {
                'numero de orden': orden[0].nroOrden,
                'estado': orden[0].estado,
                'diagnostico': orden[0].diagnostico,
                'matricula de medico': orden[0].matriculaMedico,
                'paciente': orden[0].idPaciente
            }
        });
    }
});

app.get('/gestion-examenes', function (req, res) {
    res.render('examenes.pug');
});

app.post('/nuevo-examen', (req, res) => {
    // Recuperar los datos del formulario
    const nuevoExamen = {
        nombreExamen: req.body.nombreExamen,
        fechaModif: req.body.fechaModif,
        requerimiento: req.body.requerimiento,
        idDeterminante: req.body.idDeterminante,
        diasDemora: req.body.diasDemora,
        tipoAnalisis: req.body.tipoAnalisis,
        estado: req.body.estado,
        fechaCreacion: req.body.fechaCreacion,
    };

    // Llama a la función para insertar el examen en la base de datos
    insertarExamen(nuevoExamen, (error, results) => {
        if (error) {
            console.error('Error al insertar el examen:', error);
            res.redirect('/gestion-examenes?error=1'); // Redirige a la página de gestión de exámenes con un indicador de error
        } else {
            console.log('Examen insertado con éxito');
            res.redirect('/gestion-examenes');
        }
    });
});

