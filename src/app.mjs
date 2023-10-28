import express from 'express';
import bodyParser from 'body-parser'; // Importa body-parser
import { Paciente } from './modelos/paciente.mjs'
import { Orden } from './modelos/orden.mjs'; 
import { Examen } from './modelos/examen.mjs';

const app = express();

// Configura body-parser para analizar los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('La aplicación se inició en el puerto 3000');
});


app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('./public'));

//ruta inicial renderiza a paciente.pug
app.get('/', async function(req,res){
   
    const todosPacientes = await Paciente.obtenerPacientes();
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

    Paciente.agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);
    res.redirect('/');
});


//RUTA PARA BUSCAR PACIENTE  
app.get('/buscarPaciente',async function(req, res){
    const todosPacientes= await Paciente.obtenerPacientes();
    if (todosPacientes && todosPacientes.length)
       {todosPacientes.forEach(paciente => {
        console.log(paciente.apellido)
       });
    }
    res.render('buscarPaciente', {pacientes:todosPacientes})
})

app.get('/buscarPaciente/:datoBuscado',async function(req, res){
    const datoBuscado= req.params.datoBuscado;
    if (datoBuscado && datoBuscado !== '')
    {
    const pacienteBuscado= await Paciente.obtenerPacienteFiltrado(datoBuscado); 
    if(pacienteBuscado){ res.render('buscarPaciente', {pacientes:pacienteBuscado})}
    else{console.log('no se encontro el paciente')}
    }
    })

//RUTA PARA ELIMINAR PACIENTE
app.get('/delete/:id', function(req, res){
    let id= req.params.id;
    Paciente.borrarPaciente(id);
    res.redirect('/')

})

app.get('/resultados', (req, res)=>{
    res.render('resultados', {
        estado: 'noHuboBusqueda'
    })
})

//RUTA PARA BUSCAR ORDEN en View resultados
app.get('/resultados/buscar/:id', async (req, res) =>{
    let id = req.params.id;

    let orden = await Orden.buscarOrdenPorID(id); //recupero la orden
    try {
    if (orden.length > 0){

        let paciente = await buscarPacientePorId(orden[0].idPaciente); //recupero el paciente con el idPaciente en orden
        let examenes = await buscarExamenPorIdOrden(id); //recupero los examenes segun el nroOrden
        let muestras = await buscarMuestrasPorNroOrden(id);
        res.render('resultados', {
            datos_paciente: paciente,
            muestras:muestras,
            examenes: examenes,
            order: {
                'nro Orden': orden[0].nroOrden
            },
            estado: 'seEncontroOrden' 
        })

    } else {

        res.render('resultados', {
           
            estado: 'SinResultadosOError'
        });
    }
} catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error'});
}
});

app.put('/resultados/muestra/:id', async(req, res)=>{
    const id = req.params.id;
    const data = req.body;
    try {
        const muestraActualizado = await updateEstadoMuestraById(data.estado, id);

        res.render('resultados', {
            
        })
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})

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
    Examen.insertarExamen(nuevoExamen, (error, results) => {
        if (error) {
            console.error('Error al insertar el examen:', error);
            res.redirect('/gestion-examenes?error=1'); // Redirige a la página de gestión de exámenes con un indicador de error
        } else {
            console.log('Examen insertado con éxito');
            res.redirect('/gestion-examenes');
        }
    });
});

