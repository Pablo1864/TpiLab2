import express, { text } from 'express';
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

async function agruparData(data){
    const orden = {};
    //console.log("agrupando data: ", data);
    data.forEach(row => {
        if (!orden[row.nroOrden]) {
            orden[row.nroOrden] = {
                nroOrden: row.nroOrden,
                estado: row.estado,
                fechaCreacion: row.fechaCreacion,
                //muestrasEnEspera: row.muestrasEnEspera,
                //razonCancelacion: row.razonCancelacion,
                //muestrasEnEspera: row.muestrasEnEspera,
                paciente:{
                    idPaciente: row.idPaciente,
                    nombre: row.nombrePaciente,
                    apellido: row.apellidoPaciente,
                    dni: row.dni,
                    email: row.emailPaciente,
                    provincia: row.provincia,
                    localidad: row.localidad,
                    domicilio: row.domicilio,
                    fechaNacimiento: row.fechaNacimiento,
                    obraSocial: row.obraSocial,
                    nroAfiliado: row.nroAfiliado,
                    telefono: row.telefono,
                    sexo: row.sexo
                },
                medico:{
                    idMedico: row.idMedico,
                    nombre: row.nombreMedico,
                    apellido: row.apellidoMedico,
                    matricula: row.matricula,
                    email: row.emailMedico
                },
                examenes: [],
                muestras: [],
                diagnosticos: []
            }
        }
        if (row.idExamenes && !orden[row.nroOrden].examenes.some(e => e.idExamenes === row.idExamenes)) {
            orden[row.nroOrden].examenes.push({
                idExamenes: row.idExamenes,
                nombre: row.nombreExamen,
                requerimiento: row.requerimiento,
                tipoAnalisis: row.tipoRequerimientoExamen,
                diasDemora: row.diasDemora,
                otrosNombres: row.otrosNombres
            });
        }
        if (row.idMuestra && !orden[row.nroOrden].muestras.some(e => e.idMuestra === row.idMuestra)) {
            orden[row.nroOrden].muestras.push({
                idMuestra: row.idMuestra,
                tipo : row.tipoRequerimientoMuestra,
                estado: row.estadoMuestra
            });
        }
        if (row.idDiagnostico && !orden[row.nroOrden].diagnosticos.some(e => e.idDiagnostico === row.idDiagnostico)) {
            orden[row.nroOrden].diagnosticos.push({
                idDiagnostico: row.idDiagnostico,
                nombre: row.nombreDiagnostico,
                otrosTerminos: row.otrosTerminos
            });
        }
    })

    return Object.values(orden);
}

const renderCreateOrden = (req, res) => {
    res.locals.state = 'create';
    res.render('ordenes');
}

app.get('/ordenes/crear', renderCreateOrden);

app.get('/ordenes', renderCreateOrden);

app.get('/ordenes/editar/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        if (!validateNumber(id)) {
            const error = new Error('Datos invalidos');
            error.code = 'INVALID_DATA';
            throw error;
        }
        const ordenRes = await Orden.buscarDataOrden(id);
        const orden = await agruparData(ordenRes);
        res.locals.state = 'edit';
        res.locals.ordenData = orden;
        res.render('ordenes');

    } catch (error) {
        console.log("error en editar route", error);
        if (error.code === 'INVALID_DATA') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else {
            res.status(500).json({ error: 'Error al crear la orden!' });
        }
    }

});

app.post(('/ordenes/crear'), async (req, res) =>{
    const dataOrden = req.body;
    console.log(dataOrden);
    try {
        if (!dataOrden || validateNumber(dataOrden.idPaciente) == false || 
        validateNumber(dataOrden.idMedico) == false ||
        (
        dataOrden.estado.toLowerCase() != 'ingresada' && dataOrden.estado.toLowerCase() != 'analitica' && 
        dataOrden.estado.toLowerCase() != 'analítica' && dataOrden.estado.toLowerCase() != 'esperando toma de muestras')
    ){
            const error = new Error('No se enviaron datos validos!');
            error.code = 'INVALID_DATA';
            throw error;
        }
        for (const id of dataOrden.idDiagnosticosArr){
            if (validateNumber(id) == false){
                const error = new Error('No se enviaron datos validos!');
                error.code = 'INVALID_DATA';
                console.log("Error en segundo if");
                throw error;
            }
        }
        for (const obj of dataOrden.examenesArr){
            if (validateNumber(obj.idExamen) == false){
                const error = new Error('No se enviaron datos validos!');
                error.code = 'INVALID_DATA';
                console.log("Error en tercer if");
                throw error;
            }
        }

        const ordenRes = await Orden.crearOrdenConRelaciones(dataOrden.idMedico, dataOrden.idPaciente, dataOrden.estado, dataOrden.idDiagnosticosArr, dataOrden.examenesArr) //idDiagnosticosArr es un array de ids, examenesArr es un array de objectos({idExamen, tipo})
        res.json(ordenRes);
    } catch(err){
        console.log(err);
        if (err.code === 'INVALID_DATA') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else {
            res.status(500).json({ error: 'Error al crear la orden.' });
        }
    }
});

app.put('/ordenes/editar/:id', async (req, res) => {  //check
    const id = parseInt( req.params.id, 10 );
    const body = req.body;
    try {
        console.log("body: ", body);
        if (!id || !validateNumber(id) || !body || !validateNumber(body.idPaciente) || !validateNumber(body.idMedico)
        || !body.estado || !body.idDiagnosticosArr || !body.idExamenesArr
        || body.idDiagnosticosArr.some(e => !validateNumber(e)) || body.idExamenesArr.some(e => !validateNumber(e))
        || (body.estado.toLowerCase() != 'ingresada' && body.estado.toLowerCase() != 'esperando toma de muestras')
        ) {
            const error = new Error('No se enviaron datos validos!');
            console.log("Error en primer if");
            error.code = 'INVALID_DATA';
            throw error;
        }
        
        //const resultado = await Orden.updateOrden(id, body);
        //console.log("resultado: ", resultado);
        res.json(id);
        
    } catch (err) {
        console.log(err);
        if (err.code === 'INVALID_DATA') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else {
            res.status(500).json({ error: 'Error al editar la orden.' });
        }
    }
});

app.get('/ordenes/buscarPorMail/:mail', async (req, res) => {  //check
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

app.get('/ordenes/buscarPorApe/:apellido', async (req, res) => {  //check
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

app.get('/ordenes/buscarPorDni/:dni', async (req, res) => {  //check
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

app.get('/ordenes/buscarTodos', async (req, res) => {  //check
    try {
        const pacientes = await Paciente.obtenerPacientesTodos();
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    } catch (err){
        if (err.code === 'ECCONNREFUSED') {
            res.status(500).json({error: 'Error de conexión con la base de datos'});
        } else {
            res.status(500).json({error: 'Error al buscar Pacientes'})
        }
        
    }
});

app.get('/ordenes/diagnosticos/buscarPorId/:id', async (req, res) => {  //check
    const id = req.params.id;
    try {
        const diagno = await Diagnostico.buscarDiagnosticoPorId(id);
        res.json(diagno);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    } catch (err){
        res.status(500).json({error: 'Error al buscar Diagnosticos por id'})
    }
})

app.get('/ordenes/diagnosticos/buscarPorNombre/:nombre', async (req, res) => {  //check
    const nombre = req.params.nombre;
    try {
        const diagnos = await Diagnostico.buscarDiagnosticosPorNombres(nombre);
        res.json(diagnos);
    } catch (err){
        res.status(500).json({error: 'Error al buscar Diagnosticos por nombre'})
    }
})

app.get('/ordenes/diagnosticos/buscarTodos', async (req, res) => {  //check
    try {
        const diagnos = await Diagnostico.buscarDiagnosticosTodos();
        res.json(diagnos);
    } catch (err){
        res.status(500).json({error: 'Error al buscar Diagnosticos'})
    }
})

app.get('/ordenes/examenes/buscarTodos', async (req, res) =>{  //check
    const id = req.params.id;
    try {
        const examenes = await Examen.buscarExamenesActivo();
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener los examenes.' });
    } 
})

app.get('/ordenes/examenes/buscarPorId/:id', async (req, res) => {  //check
    const id = req.params.id;
    try {
        const examenes = await Examen.buscarExamenPorID(id);
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener los examenes por id.' });
    }
});

app.get('/ordenes/examenes/buscarPorNombre/:nombre', async (req, res) => {  //check
    const nombre = req.params.nombre;
    try {
        const examenes = await Examen.buscarExamenPorNombre(nombre);
        res.json(examenes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener los examenes por nombre.' });
    }
});

app.get('/buscarMedicosPorApellido/:apellido', async (req, res) => { //check
    const apellido = req.params.apellido;
    try {
        const medicos = await Medico.buscarMedicoPorApellido(apellido);
        res.json(medicos);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener los medicos por apellido.' });
    }
});

app.get('/buscarTodosLosMedicos', async (req, res) => {  //check
    try {
        const medicos = await Medico.buscarTodosMedicos();
        res.json(medicos);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener los medicos' });
    }
});

app.get('/ordenesAdministracion', async (req, res)=>{  //check
    res.render('ordenesAdmins')
});

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

app.get('/buscarMuestraNecesariasPorOrden/:id', async (req, res) => {  //check
    const idOrden = req.params.id;
    try {
        const muestras = await Examen.buscarMuestrasNecesariasPorNroOrden(idOrden);
        res.json(muestras);
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

app.patch('/ordenes/modificarMuestras', async (req, res) => {
    const dataMuestra = req.body; //datos = {arrayidMuestras, idOrden, estado}
    try {
        
        if (!dataMuestra || !dataMuestra.arrayidMuestras || !dataMuestra.idOrden || !validateNumber(dataMuestra.idOrden) ||
            dataMuestra.arrayidMuestras.length < 1 || 
            dataMuestra.arrayidMuestras.some(e => !validateNumber(e)) ||
            (dataMuestra.estado != 0 && dataMuestra.estado != 1)
        ) {
            const error = new Error('No se enviaron datos validos!');
            error.code = 'INVALID_DATA';
            throw error;
        }
        const result = await Muestra.actualizarEstadoMuestras(dataMuestra.arrayidMuestras, dataMuestra.estado, dataMuestra.idOrden);
        res.json(result);
    } catch (err) {
        console.log(err);
        if (err.code == 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intente mas tarde.' });
        } else if (err.code == 'INVALID_DATA') {
            res.status(400).json({ error: 'No se enviaron datos validos.' });
        } else {
            res.status(500).json({ error: 'Error al agregar muestra.' });
        }
        
    }
});

app.post('/ordenes/datasample', async (req, res) => {
    const data = req.body; // data = {idOrden, tipoMuestra}
    try {
        if (!data || !data.idOrden || !validateNumber(data.idOrden) || !data.tipoMuestra) {
            const error = new Error('No se enviaron datos validos!');
            error.code = 'INVALID_DATA';
            throw error;
        }
        const result = await Orden.buscarOrdenDataPorOrdenTipo(data.idOrden, data.tipoMuestra);
        res.json(result);
    } catch (err) {
        console.log("en app", err);
        if (err.code === 'ER_NO_REFERENCED_ROW_1') {
            res.status(400).json({ error: 'No se encontro la orden!' });
        } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json({ error: 'No se encontro la muestra!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo más tarde.' });
        } else {
            res.status(500).json({ error: 'Error al buscar la muestra.' });
        }
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

function validateNumber(data){
    if (typeof data === 'number' && !isNaN(data) && data > 0) {
        return true;
    } else {
        return false;
    }
}

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

