import express from 'express';
import bodyParser from 'body-parser'; 
import cookieParser from 'cookie-parser'//para manejar las cookies del navegador, convierte las cookies entrantes en un objeto JavaScript fácil de usar
//import { Paciente } from './modelos/paciente.mjs'
import { Orden } from './modelos/orden.mjs';
import { Examen } from './modelos/examen.mjs';
import { Muestra } from './modelos/muestra.mjs';
import { Diagnostico } from './modelos/diagnostico.mjs';
import { Medico } from './modelos/medico.mjs';
import { Ordenes_diagnosticos } from './modelos/ordenes_diagnosticos.mjs';
import { Ordenes_examenes } from './modelos/ordenes_examenes.mjs';
//Rutas 
import pacienteRutas from './rutas/pacientes.rutas.js'
import authRutas from './rutas/auth.rutas.js'
import homeRutas from './rutas/home.rutas.js'
import ordenRutas from './rutas/ordenes.rutas.js'

import methodOverride from 'method-override';
const app = express();

//Configura method-override para manejar los métodos PUT y DELETE
app.use(methodOverride('_method'));

app.use(bodyParser.json());//body-parser para analizar los datos del formulario formato json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // Hace lo mismo que bodyParser (bodyParser es su versión anterior).
app.use(cookieParser());
app.listen(3000, function () {
    console.log('La aplicación se inició en el puerto 3000');
});

app.set('views', './view');
app.set('view engine', 'pug');
app.use('/paciente',pacienteRutas);
app.use('/usuario',authRutas);
app.use('/ordenes',ordenRutas);
app.use('/',homeRutas);
app.use(express.static('./public'));



app.get('/ordenes/buscarTodos', async (req, res) => {
    try {
        const pacientes = await Paciente.obtenerPacientesTodos();
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
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

app.get('/resultados', (req, res) => {
    res.render('resultados', {
        estado: 'noHuboBusqueda'
    });
});

// ÓRDENES
/*

app.patch('/cancelarOrden/:id', async (req, res) => {  //check
    const idOrden = req.params.id;
    const razon = req.body;
    try {
        const estadoCancel = await Orden.cancelarOrden(idOrden, razon.razon);
        res.json(estadoCancel);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/Ordenes/buscarOrdenesTodas', async (req, res) => {  //check
    try {
        const ordenes = await Orden.buscarTodas();
        res.json(ordenes);
    } catch (err) {
        if (err.code == 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intente mas tarde.' });
        } else {
            res.status(500).json({ error: 'Error al obtener las ordenes.' });
        }
        
    }
});

 app.get('/ordenes/buscarOrdenesPorApellido/:apellido', async (req, res)=>{  //check
    const ape = req.params.apellido;
    try {
        const ordenes = await Orden.buscarOrdenPorApellidoPaciente(ape);
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener las ordenes por apellido del paciente.' });
    }
});

app.get('/ordenes/buscarOrdenesPorId/:id', async (req, res)=>{ //check
    const id = req.params.id;
    try {
        const ordenes = await Orden.buscarOrdenDataPorId(id);
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener las ordenes por Id.' });
    }
});

app.patch('/ordenes/updateEstado/:id', async (req, res) => {
    const id = parseInt( req.params.id, 10 );
    const data = req.body;
    console.log(id, data, req.body);
    console.log(validateNumber(id));
    try {
        if (validateNumber(id) && data.estado.length > 0 ) {
            const result = await Orden.cambiarEstado(id, data.estado);
            res.json(result);
        } else {
            const error = new Error('No se enviaron datos validos!');
            error.code = 'INVALID_DATA';
            throw error;
        }
    } catch (err) {
        console.log(err);
        if (err.code === 'INVALID_DATA') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else if (err.code === 'ER_NO_REFERENCED_ROW_1') {
            res.status(400).json({ error: 'No se encontro la orden!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo mas tarde.' });
        } else {
            res.status(500).json({ error: 'Error al actualizar el estado de la orden.' });
        }
    }
})
// FIN DE ÓRDENES*/

////////////////////////////////////////////////////////////////////////////////
//region examen
app.get('/examen', (req, res) => {
    res.render('examen', { titulo: 'Gestión de Exámenes' });
});
app.get('/resultados', (req, res) => {
    res.render('resultados', { titulo: 'Carga de resultados' });
});

app.post('/nuevo-examen', (req, res) => {
    const nuevoExamen = {
        nombre: req.body.nombreExamen,
        requerimiento: req.body.requerimiento,
        horaDemora: req.body.diasDemora,
        tipoAnalisis: req.body.tipoAnalisis,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        estado: 1
    };

    Examen.insertarExamen(nuevoExamen, (error, results) => {
        if (error) {
            console.error('Error al insertar el examen:', error);
            res.status(500).json({ message: 'Error al crear el examen' });
        } else {
            console.log('Examen insertado con éxito');
            res.status(200).json({ message: 'Examen creado exitosamente' });
        }
    });
});

app.get('/buscarexamen', async (req, res) => {
    try {
        const exams = await Examen.obtenerTodosLosExamenes();
        res.json(exams);
    } catch (error) {
        console.error('Error al obtener los exámenes:', error);
        res.status(500).send('Error al obtener los exámenes de la base de datos');
    }
});

app.post('/editarExamen/:idExamen', async (req, res) => {
    try {
        const idExamen = req.params.idExamen;
        const datosActualizados = {
            nombre: req.body.nombre,
            requerimiento: req.body.requerimiento,
            horaDemora: req.body.horaDemora,
            tipoAnalisis: req.body.tipoAnalisis,
            fechaModificacion: new Date()
        };

        await Examen.actualizarExamen(idExamen, datosActualizados);
        res.json({ message: 'Cambios guardados exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el examen:', error);
        res.status(500).json({ message: 'Error al actualizar el examen' });
    }
});

app.post('/eliminarExamen/:idExamen', async (req, res) => {
    try {
        const idExamen = req.params.idExamen;
        await Examen.actualizarEstadoExamen(idExamen, 0);
        res.json({ message: 'Examen eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el examen:', error);
        res.status(500).json({ message: 'Error al eliminar el examen' });
    }
});
app.get('/ordenesanalitica', async (req, res) => {
    try {
        const ordenes = await Orden.obtenerOrdenesAnalitica();
        res.render('listaOrdenes', { titulo: 'Órdenes en Analítica', ordenes });
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).send('Error al obtener las órdenes');
    }
});
app.get('/detalles-orden/:nroOrden', async (req, res) => {
    const nroOrden = parseInt(req.params.nroOrden, 10);

    try {
        const ordenDetalles = await Orden.buscarDetallesOrden(nroOrden);

        if (ordenDetalles) {
            res.render('detallesOrden', { orden: ordenDetalles });
        } else {
            res.status(404).json({ error: 'Orden no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener los detalles de la orden:', error);
        res.status(500).json({ error: 'Error al obtener los detalles de la orden' });
    }
});

