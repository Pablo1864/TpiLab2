import express from 'express';
import bodyParser from 'body-parser'; // Importa body-parser
import { Paciente } from './modelos/paciente.mjs'
import { Orden } from './modelos/orden.mjs';
import { Examen } from './modelos/examen.mjs';
import { Muestra } from './modelos/muestra.mjs';
import { Diagnostico } from './modelos/diagnostico.mjs';
import { Medico } from './modelos/medico.mjs';
import { Ordenes_diagnosticos } from './modelos/ordenes_diagnosticos.mjs';
import { Ordenes_examenes } from './modelos/ordenes_examenes.mjs';

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

    //console.log(req.body);
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.body;

    const verificarSiExistePaciente = await Paciente.verificarPaciente(dni, email);
    console.log(verificarSiExistePaciente)
    if (verificarSiExistePaciente === 0) {
        const data = await Paciente.agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);
        res.render('registrarPaciente', { validacionExitosa: true });
    } else {
        res.render('registrarPaciente', { validacionError: true });

    }

});

// RUTA PARA BUSCAR PACIENTE
app.get('/buscarPaciente', async function (req, res) {
    const todosPacientes = await Paciente.obtenerPacientes();
    if (todosPacientes && todosPacientes.length) {
        todosPacientes.forEach(paciente => {
            //console.log(paciente.apellido);
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

app.post('/actualizarPaciente', async function (req, res) {
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado, idPaciente } = req.body;
    console.log(req.body)
    try {
        const pacientes = await Paciente.actualizarPaciente(idPaciente, nombre, apellido, provincia, localidad, domicilio, email, telefono, sexo, obraSocial, numeroAfiliado, fechaNac, dni);
        // render('buscarPaciente',{modalExito:true},{dataTableVisible:true});
        res.redirect('/buscarPaciente')
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
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
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

app.get('/ordenes/diagnosticos/buscarPorId/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const diagno = await Diagnostico.buscarDiagnosticoPorId(id);
        res.json(diagno);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.get('/ordenes/diagnosticos/buscarPorNombre/:nombre', async (req, res) => {
    const nombre = req.params.nombre;
    try {
        const diagnos = await Diagnostico.buscarDiagnosticosPorNombres(nombre);
        res.json(diagnos);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.get('/ordenes/diagnosticos/buscarTodos', async (req, res) => {
    try {
        const diagnos = await Diagnostico.buscarDiagnosticosTodos();
        res.json(diagnos);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

async function iterarArrOrden(array, nroOrden, fun) {
    const errores = [];
    for (const id of array) {
        try {
            await fun(nroOrden, id);
        } catch (err) {
            errores.push({ id: id, error: err });
        }
    }
    return errores;
}

app.post(('/ordenes/crearOrden'), async (req, res) => {
    const dataOrden = req.body;
    try {
        const ordenRes = await Orden.crearOrden(dataOrden);
        let diagnosticosRes = [];
        let examenesRes = [];
        if (ordenRes.affectedRows > 0) {
            diagnosticosRes = await iterarArrOrden(dataOrden.arrayIdsDiagnosticos, ordenRes.insertId, Ordenes_diagnosticos.createRelationship);
            examenesRes = await iterarArrOrden(dataOrden.arrayIdsExamenes, ordenRes.insertId, Ordenes_examenes.createRelationship);
        }
        res.json({
            orden: ordenRes,
            diagnostico: diagnosticosRes,
            examenes: examenesRes
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put(('/ordenes/updateOrden/:id'), async (req, res) => {
    const idOrden = req.params.id;
    const dataOrden = req.body;
    try {
        const resp = await Orden.updateExistingOrder(id, dataOrden);
        let diagnosticosRes = [];
        let examenesRes = [];
        if (res.affectedRows > 0) {
            diagnosticosRes = await iterarArrOrden(dataOrden.arrayIdsDiagnosticos, res.insertId, Ordenes_diagnosticos.createRelationship);
            examenesRes = await iterarArrOrden(dataOrden.arrayIdsExamenes, res.insertId, Ordenes_examenes.createRelationship);
        }
        res.json(resp);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//examenes en ordenes - busqueda

app.get('/ordenes/examenes/buscarTodos', async (req, res) => {
    const id = req.params.id;
    try {
        const examenes = await Examen.buscarExamenesActivo();
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
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

app.get('/buscarMedicosPorApellido/:apellido', async (req, res) => {
    const apellido = req.params.apellido;
    try {
        const medicos = await Medico.buscarMedicoPorApellido(apellido);
        res.json(medicos);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/buscarTodosLosMedicos', async (req, res) => {
    try {
        const medicos = await Medico.buscarTodosMedicos();
        res.json(medicos);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenesAdministracion', async (req, res) => {
    res.render('ordenesAdmins')
});

app.patch('/cancelarOrden/:id', async (req, res) => {
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

app.get('/buscarMuestraNecesariasPorOrden/:id', async (req, res) => {
    const idOrden = req.params.id;
    try {
        const muestras = await Examen.buscarMuestrasNecesariasPorNroOrden(idOrden);
        res.json(muestras);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/Ordenes/buscarOrdenesTodas', async (req, res) => {
    try {
        const ordenes = await Orden.buscarTodas();
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarOrdenesPorApellido/:apellido', async (req, res) => {
    const ape = req.params.apellido;
    try {
        const ordenes = await Orden.buscarOrdenPorApellidoPaciente(ape);
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ordenes/buscarOrdenesPorId/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const ordenes = await Orden.buscarOrdenDataPorId(id);
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/*
app.get('/cargarMuestras/:id', async (req, res) => {
    const IdOrden = req.params.id;
    try {
        const resp = await Orden.traerExamenesDeOrden(IdOrden);
        console.log(resp);
        res.render('cargarMuestras', {
            ordenData: resp,
        })
    } catch (err){
        res.status(500).json({error: 'Internal Server Error'})
    }
   
}); */

// FIN DE ÓRDENES

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

