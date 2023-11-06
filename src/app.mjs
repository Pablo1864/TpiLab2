import express from 'express';
import bodyParser from 'body-parser'; // Importa body-parser
import { Paciente } from './modelos/paciente.mjs'
import { Orden } from './modelos/orden.mjs';
import { Examen } from './modelos/examen.mjs';
import { Muestra } from './modelos/muestra.mjs';

const app = express();

// Configura body-parser para analizar los datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // Hace lo mismo que bodyParser (bodyParser es su versión anterior, por así decirlo)
// express.json viene ya con express sin necesidad de importarlo de otro módulo para obtener los JSON de los bodies.

app.listen(3000, function () {
    console.log('La aplicación se inició en el puerto 3000');
});

app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('./public'));

// Ruta inicial renderiza a paciente.pug
app.get('/', async function (req, res) {

    res.render('home');

});

/////////////////////////////////////////////////////////////
//region Pacientes

//Registrar Paciente form registro paciente
app.get('/registrarPaciente', function (req, res) {
    res.render('registrarPaciente');
});

app.get('/paciente', function (req, res) {
    res.render('dataTablePaciente');
});

//guarda datos paciente y redirije a vista Registrar Paciente
app.post('/registrarPaciente', async function (req, res) {

    console.log(req.body);
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.body;

    const verificarSiExistePaciente= await Paciente.verificarPaciente(dni,email);
    console.log(verificarSiExistePaciente)
     if(verificarSiExistePaciente===0)
     {
    const data = await Paciente.agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);
    res.render( 'registrarPaciente', {validacionExitosa: true});
} else{
    res.render( 'registrarPaciente', {validacionError: true});

}
    
});

// RUTA PARA BUSCAR PACIENTE
app.get('/buscarPaciente', async function (req, res) {
    const todosPacientes = await Paciente.obtenerPacientes();
    if (todosPacientes && todosPacientes.length) {
        todosPacientes.forEach(paciente => {
            console.log(paciente.apellido);
        });
    }
    res.render('buscarPaciente', { pacientes: todosPacientes });
});

app.get('/buscarPaciente/:datoBuscado', async function (req, res) {
    const datoBuscado = req.params.datoBuscado;
    if (datoBuscado && datoBuscado !== '') {
        const pacienteBuscado = await Paciente.obtenerPacienteFiltrado(datoBuscado);
        if (pacienteBuscado) {
            res.render('buscarPaciente', { pacientes: pacienteBuscado });
        } else {
            console.log('No se encontró el paciente');
        }
    }
});

// RUTA PARA ELIMINAR PACIENTE
app.get('/delete/:id', function (req, res) {
    let id = req.params.id;
    Paciente.borrarPaciente(id);
    res.redirect('/');
});

app.get('/resultados', (req, res) => {
    res.render('resultados', {
        estado: 'noHuboBusqueda'
    });
});

app.get('/paciente/buscarPorMail/:mail', async (req, res) => {
    const mail = req.params.mail;
    try {
        const pacientes = await Paciente.obtenerPacientePorMail(mail);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/paciente/buscarPorApe/:apellido', async (req, res) => {
    const apellido = req.params.apellido;
    try {
        const pacientes = await Paciente.obtenerPacientesPorApellido(apellido);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/paciente/buscarPorDni/:dni', async (req, res) => {
    const dni = req.params.dni;
    try {
        const pacientes = await Paciente.obtenerPacienteFiltrado(dni);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarTodos', async (req, res) => {
    try {
        const pacientes = await Paciente.obtenerPacientesTodos();
        res.json(pacientes);
    } catch (err){
        res.status(500).json({error: 'Internal Server Error'})
    }
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////
//region Ordenes
// RUTA PARA BUSCAR ORDEN en View resultados
app.get('/resultados/buscar/:id', async (req, res) => {
    let id = req.params.id;

    let orden = await Orden.buscarOrdenPorID(id); // Recupero la orden
    try {
        if (orden.length > 0) {
            let paciente = await Paciente.buscarPacientePorId(orden[0].idPaciente); // Recupero el paciente con el idPaciente en orden
            let examenes = await Examen.buscarExamenxOrdenPorIdOrden(id); // Recupero los exámenes según el nroOrden
            let muestras = await Muestra.buscarMuestrasPorNroOrden(id);
            res.render('resultados', {
                datos_paciente: paciente,
                muestras: muestras,
                examenes: examenes,
                order: {
                    'nro Orden': orden[0].nroOrden
                },
                estado: 'seEncontroOrden'
            });
        } else {
            res.render('resultados', {
                estado: 'SinResultadosOError'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error ' + err });
    }
});

app.put('/resultados/muestra/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const muestraActualizado = await updateEstadoMuestraById(data.estado, id);
        res.render('resultados', {});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ÓRDENES

app.get('/ordenes', (req, res) => {
    res.render('ordenes');
});

app.get('/ordenes/buscarPorMail/:mail', async (req, res) => {
    const mail = req.params.mail;
    try {
        const pacientes = await Paciente.obtenerPacientePorMail(mail);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarPorApe/:apellido', async (req, res) => {
    const apellido = req.params.apellido;
    try {
        const pacientes = await Paciente.obtenerPacientesPorApellido(apellido);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarPorDni/:dni', async (req, res) => {
    const dni = req.params.dni;
    try {
        const pacientes = await Paciente.obtenerPacienteFiltrado(dni);
        const data = pacientes;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarTodos', async (req, res) => {
    try {
        const pacientes = await Paciente.obtenerPacientesTodos();
        res.json(pacientes);
    } catch (err){
        res.status(500).json({error: 'Internal Server Error'})
    }
});

app.post(('/ordenes/crearOrden'), async (req, res) =>{
    const dataOrden = req.body;

    try {
        const resp = await Orden.crearOrden(dataOrden.idPaciente, dataOrden.diagnostico, dataOrden.nombreMedico, dataOrden.matricula);
        res.json(resp);


    } catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//examenes en ordenes - busqueda

app.get('/ordenes/examenes/buscarTodos', async (req, res) =>{
    const id = req.params.id;
    try {
        const examenes = await Examen.buscarExamenesActivo();
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error'});
    } 
})

app.get('/ordenes/examenes/buscarPorId/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const examenes = await Examen.buscarExamenPorID(id);
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/examenes/buscarPorNombre/:nombre', async (req, res) => {
    const nombre = req.params.nombre;
    try {
        const examenes = await Examen.buscarExamenPorNombre(nombre);
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// FIN DE ÓRDENES

////////////////////////////////////////////////////////////////////////////////
//region examen
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

app.get('/examen', async (req, res) => {
    try {

        res.render('examen', {
            titulo: 'Gestión de Exámenes',

        });
    } catch (error) {
        console.error('Error al obtener los exámenes:', error);
        res.status(500).send('Error al obtener los exámenes de la base de datos');
    }
});
app.get('/buscarexamen', async (req, res) => {
    try {
        const exams = await Examen.obtenerTodosLosExamenes(); // Debes implementar esta función en tu modelo Examen.
        res.json(exams);
    } catch (error) {
        console.error('Error al obtener los exámenes:', error);
        res.status(500).send('Error al obtener los exámenes de la base de datos');
    }
});