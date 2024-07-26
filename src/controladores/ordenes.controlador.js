import { Usuario } from "../modelos/usuario.mjs";
import { Orden } from "../modelos/orden.mjs";
import { Paciente } from "../modelos/paciente.mjs";
import { Medico } from "../modelos/medico.mjs";
import { Diagnostico } from "../modelos/diagnostico.mjs";
import { Muestra } from "../modelos/muestra.mjs";
import { Examen } from "../modelos/examen.mjs";

import config from '../config.js';
import jwt from 'jsonwebtoken';

// region FUN
async function agruparData(data){
    const orden = {};
    //console.log("agrupando data: ", data);
    data.forEach(row => {
        if (!orden[row.nroOrden]) {
            orden[row.nroOrden] = {
                nroOrden: row.nroOrden,
                estado: row.estado,
                fechaCreacion: row.fechaCreacion,
                fechaModif: row.fechaModificacion,
                muestrasEnEspera: row.muestrasEnEspera,
                razonCancelacion: row.razonCancelacion,
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
                estado: row.estadoMuestra,
                idExamenes: row.idExamenesMuestra
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

function checkAlpha(value) {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ-\s]+$/.test(value)) {
        return false;
    }
    return true;
}

function checkNumeric(value) {
    if (!/^[0-9]+$/.test(value)) {
        return false;
    }
    return true;
}

// region RENDER

export const renderCreateOrden = async(req, res) => {
    try {
        const token = req.cookies.token;
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        let rol = user.rol_id;
        if (!user || user === 0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'USER_NOT_FOUND';
            throw error;
        } else {
            if (rol !== 1 && rol !== 4) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            }
        }
        res.locals.state = 'create';
        res.render('ordenes', {rol});
    } catch (err) {
        console.log(err);
        if (err.code === 'USER_NOT_FOUND') {
            res.redirect('/login');
        } else if (err.code === 'FORBIDDEN') {
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    }
}

export const renderEditOrdenAdmin = async (req, res) => { //working on it
    const id = parseInt(req.params.id, 10);
    const token = req.cookies.token;
    try {
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        console.log("user: ", user);
        if (!user || user===0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'FORBIDDEN';
            throw error;
        } else {
            if (user.rol_id !== 1) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            } else if (user.rol_id === 1) {
                res.locals.adminEdit = true;
            }
        }
        if (req.accepts('html')) {
            return renderEditOrden(req, res);
        } else {
            return res.json({ success: true });
        }
    } catch (error) {
        console.log("error en editar route", error);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else if (error.code === 'BAD_REQUEST') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else if (error.code === 'FORBIDDEN') {
            if (req.accepts('html')) {
                res.status(403).json({ error: (error.message || 'Usuario no autorizado!')+ " html-header" });
            } else {
                res.status(403).json({ error: error.message || 'Usuario no autorizado!' });
            }
        } else {
            res.status(500).json({ error: 'Error al buscar la orden!' });
        }
    }

}
export const renderEditOrden = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const token = req.cookies.token;

    try {
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        console.log("user: ", user);
        if (!user || user===0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'FORBIDDEN';
            throw error;
        } else {
            if (user.rol_id !== 1 && user.rol_id !== 4) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            } else {
                const rol = user.rol_id;
                res.locals.rol = rol;
            }
        }
        if (!checkNumeric(id)) {
            const error = new Error('Datos invalidos');
            error.code = 'BAD_REQUEST';
            throw error;
        }
        const ordenRes = await Orden.buscarDataOrden(id);
        const orden = await agruparData(ordenRes);
        if (!ordenRes || ordenRes.length === 0) {
            const error = new Error('Orden no encontrada');
            error.code = 'NOT_FOUND';
            throw error;
        }
        if (req.accepts('html')) {
            res.locals.state = 'edit';
            res.locals.ordenData = orden;
            res.render('ordenes');
        } else {
            res.json({ success: true });
        }
    } catch (error) {
        console.log("error en editar route", error);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else if (error.code === 'BAD_REQUEST') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else if (error.code === 'NOT_FOUND') {
            if (req.accepts('html')) {
                console.log("es html");
                res.status(404).json({ error: 'Orden no encontrada(aun sin html)!' });
                //res.status(404).sendFile('404.html'); //todo: renderizar 404 en img o algo
            } else {
                res.status(404).json({ error: 'Orden no encontrada!' });
            }
        } else if (error.code === 'FORBIDDEN') {
            res.status(403).json({ error: error.message || 'Usuario no autorizado!' });
        } else {
            res.status(500).json({ error: 'Error al buscar la orden!' });
        }
    }
}

export const renderAdministracion = async (req, res) => {
   
    try{
        const token = req.cookies.token;
        let rol = 0;
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        const filters = {
            estado: 'todas',
            sortBy: 'fechaCreacion',
            direction: 'DESC',
        };
        
        if (!user || user===0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'USER_NOT_FOUND';
            throw error;
        } else {
            if (user.rol_id !== 1 && user.rol_id !== 4) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            } else {
                rol = user.rol_id;
            }
        }
        const ordenesActivas = await Orden.buscarDatasOrdenesActivas(filters);
        if (req.accepts('html')) {
            res.render('ordenesAdmins', {rol : rol, ordenes: ordenesActivas || []});
        } else {
            res.json({ success: true });
        }
    } catch (err) {
        console.log(err);
        if (err.code === 'USER_NOT_FOUND' ) {
            res.status(404).json({ error: 'Usuario no encontrado!' });
        } else if (err.code === 'FORBIDDEN') {
            res.status(403).json({ error: err.message || 'Usuario no autorizado!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo mas tarde.' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message || 'No se enviaron datos validos.' });
        } else {
            res.status(500).json({ error: 'Error al editar la orden.' });
        }
    }
}

// region BUSQUEDAS
export const buscarPacientes = async (req, res) => { //trae pacientes activos en base a query(-Valen)
    const { apellido, dni, email, id } = req.query;
    try {
        let data = null;
        if (apellido) {
            if (!checkAlpha(apellido) || apellido.trim() === '') {
                const error = new Error('El apellido debe ser una cadena de texto valida');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            const paciente = await Paciente.buscarPacientesActivosPorApellido(apellido);
            data = paciente;
        } else if (dni) {
            if (!checkNumeric(dni) || dni.trim() === '') {
                const error = new Error('El dni debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            const paciente = await Paciente.buscarPacientesActivosPorDNI(dni);
            data = paciente;
        } else if (email) {
            if (email.trim() === '') {
                const error = new Error('El email debe ser una cadena de texto valida');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            const paciente = await Paciente.buscarPacientesActivosPorEmail(email);
            data = paciente;
        } else if (id){
            if (id !== '' && checkNumeric(id)) {
                console.log("buscando por id")
                const paciente = await Paciente.buscarPacientesActivosPorID(id);
                data = paciente;
            } else {
                const error = new Error('El ID debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
        } else {
            console.log("buscando todos")
            const paciente = await Paciente.buscarPacientesActivos();
            data = paciente;
        }
        res.json(data);
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        
    }
}

export const buscarMedicos = async (req, res) => { //trae todos los medicos activos
    const {apellido, id, email, matricula} = req.query;
    try {
        let data = null;
        if (apellido) {
            if (!checkAlpha(apellido) || apellido.trim() === '') {
                const error = new Error('El apellido debe ser una cadena de texto valida');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por apellido");
            const medicos = await Medico.buscarMedicoPorApellido(apellido);
           data = medicos;
            
        } else if (id) {
            if (!checkNumeric(id) || id.trim() === '') {
                const error = new Error('El id debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por id");
            const medicos = await Medico.buscarMedicoPorID(id);
            data = medicos;
            
        } else if (email) {
            console.log("buscando por email");
            const medicos = await Medico.buscarMedicosPorEmail(email);
            data = medicos;
            
        } else if (matricula) {
            if (!checkNumeric(matricula) || matricula.trim() === '') {
                const error = new Error('La matricula debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por matricula");
            const medicos = await Medico.buscarMedicosPorMatricula(matricula);
            data = medicos;
            
        } else {
            console.log("buscando todos");
            const medicos = await Medico.buscarTodosMedicos();
            data = medicos;
            
        }
        res.json(data);
        
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        
    }
}

export const buscarDiagnosticos = async (req, res) => { //trae todos los diagnosticos activos
    const {termino, id} = req.query;
    try {
        let data = null;
        if (termino) {
            if (!checkAlpha(termino) || termino.trim() === '') {
                const error = new Error('El termino debe ser una cadena de texto valida');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por termino");
            const diagnosticos = await Diagnostico.buscarDiagnosticosPorNombres(termino);
            data = diagnosticos;
            
        } else if (id) {
            if (!checkNumeric(id) || id.trim() === '') {
                const error = new Error('El id debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por id");
            const diagnosticos = await Diagnostico.buscarDiagnosticoPorId(id);
            data = diagnosticos;
            
        } else {
            console.log("buscando todos");
            const diagnosticos = await Diagnostico.buscarDiagnosticosTodos();
            data = diagnosticos;
        }

        res.json(data);
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        
    }
}

export const buscarExamenes = async (req, res) => { //trae todos los examenes activos
    const {termino, id} = req.query;
    try {
        let data = null;
        if (termino) {
            if (!checkAlpha(termino) || termino.trim() === '') {
                const error = new Error('El termino debe ser una cadena de texto valida');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por termino");
            const examenes = await Examen.buscarExamenesActivosPorNombre(termino);
            data = examenes;
            
        } else if (id) {
            if (!checkNumeric(id) || id.trim() === '') {
                const error = new Error('El id debe ser un valor numérico');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            console.log("buscando por id");
            const examenes = await Examen.buscarExamenPorID(id);
            data = examenes;
            
        } else {
            console.log("buscando todos");
            const examenes = await Examen.buscarExamenesActivo();
            data = examenes;
        }

        res.json(data);
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        
    }
}

export const buscarOrdenesAdministracion = async (req, res) => {
    //const filter = {apellidoPaciente, apellidoMedico, nroOrden} = req.query;
    //const filterEstado = {todas, ingresadas, esperando, analiticas, canceladas, asc, des} = req.query;
    try {
        const filter = {
            apellidoPaciente: req.query.apellidoPaciente,
            apellidoMedico: req.query.apellidoMedico,
            nroOrden: req.query.nroOrden,
            sortBy: req.query.sortBy,
            direction: req.query.direction,
            estado: req.query.estado,
            sortBy: 'o.fechaCreacion',
            direction: 'DESC',
        };
        console.log(filter);
        const ordenes = await Orden.buscarDatasOrdenesActivas(filter);
        res.json(ordenes);
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        
    }
}

// region CREAR/EDITAR/ELIMINAR/GET
export const crearOrden = async (req, res) => {
    const dataOrden = req.body;
    try {
        if (!dataOrden || checkNumeric(dataOrden.idPaciente) == false ||
            checkNumeric(dataOrden.idMedico) == false ||
            (
                dataOrden.estado.toLowerCase() != 'ingresada' && dataOrden.estado.toLowerCase() != 'analitica' &&
                dataOrden.estado.toLowerCase() != 'analítica' && dataOrden.estado.toLowerCase() != 'esperando toma de muestras')
        ) {
            const error = new Error('No se enviaron datos de la orden validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        }
        for (const id of dataOrden.idDiagnosticosArr){
            if (checkNumeric(id) == false){
                const error = new Error('No se enviaron diagnosticos validos!');
                error.code = 'BAD_REQUEST';
                console.log("Error en segundo if");
                throw error;
            }
        }
        for (const obj of dataOrden.examenesArr){
            if (checkNumeric(obj.idExamen) == false){
                const error = new Error('No se enviaron examenes validos!');
                error.code = 'BAD_REQUEST';
                console.log("Error en tercer if");
                throw error;
            }
        }

        const ordenRes = await Orden.crearOrdenConRelaciones(dataOrden.idMedico, dataOrden.idPaciente, dataOrden.estado, dataOrden.idDiagnosticosArr, dataOrden.examenesArr) //idDiagnosticosArr es un array de ids, examenesArr es un array de objectos({idExamen, tipo})
        res.json(ordenRes);
    } catch(err){
        console.log(err);
        if (err.code === 'ECCONREFUSED') {
            res.status(500).json({ error: 'Se ha perdido la conexión con la base de datos' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else {
            res.status(500).json({ error: 'Error al crear la orden.' });
        }
    }
};

export const modificarMuestras = async (req, res) => {
    const dataMuestra = req.body; //datos = {arrayidMuestras, idOrden, estado}
    try {
        console.log(dataMuestra);
        console.log(dataMuestra.arrayidMuestras);
        if (!dataMuestra || !dataMuestra.arrayidMuestras || !dataMuestra.idOrden || dataMuestra.arrayidMuestras.length < 1) {
            const error = new Error('No se enviaron datos validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        } else if (!checkNumeric(dataMuestra.idOrden) || dataMuestra.arrayidMuestras.some(e => !checkNumeric(e))) {
            const error = new Error('No se enviaron datos numéricos validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        } else if (dataMuestra.estado != 0 && dataMuestra.estado != 1) {
            const error = new Error('No se envio un estado validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        }
        const result = await Muestra.actualizarEstadoMuestras(dataMuestra.arrayidMuestras, dataMuestra.estado, dataMuestra.idOrden);
        res.json(result);
    } catch (err) {
        console.log(err);
        if (err.code == 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intente mas tarde.' });
        } else if (err.code == 'BAD_REQUEST') {
            res.status(400).json({ error: 'No se enviaron datos validos.' });
        } else {
            res.status(500).json({ error: 'Error al agregar muestra.' });
        }
    }
};

export const buscarDataParaImprimir = async (req, res) => {
    const data = req.body; // data = {idOrden, tipoMuestra}
    try {
        if (!data || !data.idOrden || !checkNumeric(data.idOrden) || !data.tipoMuestra) {
            const error = new Error('No se enviaron datos validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        }
        const result = await Orden.buscarOrdenDataPorOrdenTipo(data.idOrden, data.tipoMuestra);
        res.json(result);
    } catch (err) {
        console.log("en Ordenes buscarDataParaImprimir", err);
        if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: 'No se enviaron datos validos!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo más tarde.' });
        } else {
            res.status(500).json({ error: 'Error al buscar la muestra.' });
        }
    }
};

export const modificarOrden = async (req, res) => {
    const id = parseInt( req.params.id, 10 );
    const body = req.body;
    const ordenNueva = body.ordenNueva;
    const ordenAnterior = body.ordenAnterior;
    try {
        console.log("body: ", body);
        if (!id || !checkNumeric(id)) {
            const error = new Error('No es encontro un ID valido!');
            error.code = 'BAD_REQUEST';
            throw error;
        } else if (!body || !ordenNueva.idPaciente || !ordenNueva.idMedico || !ordenNueva.idDiagnosticosArr || !ordenNueva.idExamenesArr){
            const error = new Error('No se enviaron los datos de la orden!');
            error.code = 'BAD_REQUEST';
            throw error;
        } else if (ordenNueva.idDiagnosticosArr.some(e => !checkNumeric(e)) || ordenNueva.idExamenesArr.some(e => !checkNumeric(e))) {
            const error = new Error('No se enviaron los examenes o diagnosticos validos!');
            error.code = 'BAD_REQUEST';
            throw error;
        } else if (ordenNueva.estado.toLowerCase() != 'ingresada' && ordenNueva.estado.toLowerCase() != 'esperando toma de muestras') {
            const error = new Error('El estado de la orden no es valido!');
            error.code = 'BAD_REQUEST';
            throw error;
        }
        console.log(ordenAnterior, ordenNueva);
        const resultado = await Orden.updateOrden( ordenAnterior, ordenNueva);
        console.log("resultado: ", resultado);
        res.json(resultado);
    } catch (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo mas tarde.' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message || 'No se enviaron datos validos.' });
        } else if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'La orden ya tiene esos datos' });
        } else {
            res.status(500).json({ error: 'Error al editar la orden.' });
        }
    }
};

export const desactivarOrden = async (req, res) => {
    const token = req.cookies.token;
    const id = parseInt(req.params.id, 10);
    const razonCancelacion = req.body.razon;
    let rol = 0;
    try{
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        console.log("user: ", user);
        if (!user || user===0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'USER_NOT_FOUND';
            throw error;
        } else {
            if (user.rol_id !== 1 && user.rol_id !== 4) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            } else {
                rol = user.rol_id;
            }
        }
        if (checkNumeric(id) && id > 0 && (rol === 1 || rol === 4) && razonCancelacion) {
            const resultado = await Orden.desactivarOrden(id, razonCancelacion);
            console.log("resultado desactivar: ", resultado);
            if (!resultado) {
                const error = new Error('No se pudo desactivar la orden');
                error.code = 'BAD_REQUEST';
                throw error;
            }
            res.json(resultado);
        } else {
            const error = new Error('No se pudo desactivar la orden.');
            error.code = 'BAD_REQUEST';
            throw error;
        }
    } catch (err) {
        console.log(err);
        if (err.code === 'USER_NOT_FOUND' ) {
            res.status(404).json({ error: 'Usuario no encontrado!' });
        } else if (err.code === 'FORBIDDEN') {
            res.status(403).json({ error: err.message || 'Usuario no autorizado!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo mas tarde.' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message || 'No se enviaron datos validos.' });
        } else {
            res.status(500).json({ error: 'Error al editar la orden.' });
        }
    }
}

export const getDetalleOrden = async (req, res) => {
    const token = req.cookies.token;
    const id = parseInt(req.params.id, 10);
    let rol = 0;
    try{
        const usuario = jwt.verify(token, config.SECRET);
        const user = await Usuario.verificarUsuarioPorId(usuario.id);
        console.log("user: ", user);
        if (!user || user===0 || !token) {
            const error = new Error('Usuario no encontrado');
            error.code = 'USER_NOT_FOUND';
            throw error;
        } else {
            if (user.rol_id !== 1 && user.rol_id !== 4) {
                const error = new Error('Usuario no autorizado');
                error.code = 'FORBIDDEN';
                throw error;
            } else {
                rol = user.rol_id;
            }
        }
        if (checkNumeric(id) && id > 0 && (rol === 1 || rol === 4)) {
            const resultado = await agruparData(await Orden.buscarDataOrden(id));
            res.json(resultado);
        } else {
            const error = new Error('No se pudo obtener la orden.');
            error.code = 'BAD_REQUEST';
            throw error;
        }
    } catch (err) {
        console.log(err);
        if (err.code === 'USER_NOT_FOUND' ) {
            res.status(404).json({ error: 'Usuario no encontrado!' });
        } else if (err.code === 'FORBIDDEN') {
            res.status(403).json({ error: err.message || 'Usuario no autorizado!' });
        } else if (err.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'No se pudo conectar con la base de datos. Intentelo mas tarde.' });
        } else if (err.code === 'BAD_REQUEST') {
            res.status(400).json({ error: err.message || 'No se enviaron datos validos.' });
        } else {
            res.status(500).json({ error: 'Error al obtener la orden.' });
        }
    }
}