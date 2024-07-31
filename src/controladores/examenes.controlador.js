
import { Examen } from "../modelos/examen.mjs";


export const renderExamen = (req, res) => {
    res.render('examen', { titulo: 'Gestión de Exámenes' });
};



export const nuevoExamen = (req, res) => {
    const nuevoExamen = {
        nombre: req.body.nombreExamen,
        requerimiento: req.body.requerimiento,
        diasDemora: req.body.diasDemora,
        tipoAnalisis: req.body.tipoAnalisis,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        habilitado: 1
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
};

export const buscarExamen = async (req, res) => {

    try {
        const exams = await Examen.obtenerTodosLosExamenes();
        res.json(exams);
    } catch (error) {
        console.error('Error al obtener los exámenes:', error);
        res.status(500).send('Error al obtener los exámenes de la base de datos');
    }
};

export const editarExamen = async (req, res) => {
    try {
        const idExamen = req.params.idExamen;
        const datosActualizados = {
            nombre: req.body.nombre,
            requerimiento: req.body.requerimiento,
            diasDemora: req.body.diasDemora,
            tipoAnalisis: req.body.tipoAnalisis,
            fechaModificacion: new Date()
        };

        await Examen.actualizarExamen(idExamen, datosActualizados);
        res.json({ message: 'Cambios guardados exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el examen:', error);
        res.status(500).json({ message: 'Error al actualizar el examen' });
    }
};

export const eliminarExamen = async (req, res) => {
    try {
        const idExamen = req.params.idExamen;
        await Examen.actualizarEstadoExamen(idExamen, 0);
        res.json({ message: 'Examen eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el examen:', error);
        res.status(500).json({ message: 'Error al eliminar el examen' });
    }
};

export const obtenerOrdenesAnalitica = async (req, res) => {
    try {
        const ordenes = await Examen.obtenerOrdenesAnalitica();
        res.render('listaOrdenes', { titulo: 'Órdenes en Analítica', ordenes });
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).send('Error al obtener las órdenes');
    }
};

export const detallesOrden = async (req, res) => {
    const nroOrden = parseInt(req.params.nroOrden, 10);

    try {
        const ordenDetalles = await Examen.buscarDetallesOrden(nroOrden);

        if (ordenDetalles) {
            res.render('detallesOrden', { orden: ordenDetalles });
        } else {
            res.status(404).json({ error: 'Orden no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener los detalles de la orden:', error);
        res.status(500).json({ error: 'Error al obtener los detalles de la orden' });
    }
};

export const obtenerDeterminantes = async (req, res) => {
    const idExamen = req.params.idExamen;

    try {
        const determinantes = await Examen.obtenerDeterminantesPorIdExamen(idExamen);
        res.json(determinantes);
    } catch (error) {
        console.error('Error al obtener los determinantes:', error);
        res.status(500).json({ error: 'Error al obtener los determinantes' });
    }
};

export const cargarResultado = (req, res) => {
    const { idMuestra, valores, idExamen, nroOrden } = req.body;
    const fechaResultado = new Date();

    const promises = Object.entries(valores).map(([idDeterminante, valor]) => {
        const nuevoResultado = {
            idMuestra,
            fechaResultado,
            valor,
            idDeterminante
        };

        const actualizarEstado = {
            nroOrden,
            idExamen
        };

        return new Promise((resolve, reject) => {
            Examen.insertarResultado(nuevoResultado, actualizarEstado, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            console.log('Resultados cargados exitosamente');
            res.status(200).json({ message: 'Resultados cargados exitosamente' });
        })
        .catch(error => {
            console.error('Error al cargar los resultados:', error);
            res.status(500).json({ message: 'Error al cargar los resultados' });
        });
};

export const obtenervaloresReferencia = async (req, res) => {
    try {
        const { idDeterminante, edad, genero } = req.query;
        const valoresReferencia = await Examen.obtenerValoresReferencias(idDeterminante, edad, genero);
        res.json(valoresReferencia);
    } catch (error) {
        console.error('Error al obtener los valores de referencia:', error);
        res.status(500).json({ error: 'Error al obtener los valores de referencia' });
    }
};

export const obtenerResultados = async (req, res) => {
    const idMuestra = req.params.idMuestra;
    try {
        const resultados = await Examen.obtenerResultadosPorOrden(idMuestra);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener los resultados:', error);
        res.status(500).send('Error al obtener los resultados');
    }
};

export const agregarDeterminantes = async (req, res) => {
    const { idExamen, nuevosDeterminantes, determinantesActualizados } = req.body;

    try {
        console.log('Datos recibidos:', { idExamen, nuevosDeterminantes, determinantesActualizados });

        const parsedNuevosDeterminantes = JSON.parse(nuevosDeterminantes);
        const parsedDeterminantesActualizados = JSON.parse(determinantesActualizados);

        if (!Array.isArray(parsedNuevosDeterminantes) || !Array.isArray(parsedDeterminantesActualizados)) {
            throw new Error('El campo determinantes no es un arreglo');
        }

        if (parsedNuevosDeterminantes.length === 0) {
            // Solo actualizar los determinantes
            await Examen.actualizarDeterminantes(parsedDeterminantesActualizados);
        } else {
            // Actualizar los determinantes y agregar nuevos determinantes
            await Examen.actualizarDeterminantes(parsedDeterminantesActualizados);
            await Examen.agregarDeterminantes(parsedNuevosDeterminantes, idExamen);
        }

        res.status(200).json({ message: 'Determinantes agregados/actualizados exitosamente' });
    } catch (error) {
        console.error('Error al agregar/actualizar determinantes:', error);
        res.status(500).json({ message: 'Error al agregar/actualizar determinantes', error: error.message });
    }
};
export const agregarValorReferencia = async (req, res) => {
    const { idDeterminante, valorMin, valorMax, edadMin, edadMax, sexo } = req.body;

    if (!idDeterminante || valorMin == null || valorMax == null || edadMin == null || edadMax == null || !sexo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const valorReferencia = {
            valorMin: valorMin,
            valorMax: valorMax,
            edadMin: edadMin,
            edadMax: edadMax,
            sexo: sexo
        };

        const resultado = await Examen.agregarValorReferencia(idDeterminante, valorReferencia);
        res.status(200).json({ message: 'Valor de referencia agregado con éxito', data: resultado });
    } catch (err) {
        console.error('Error al agregar el valor de referencia:', err);
        res.status(500).json({ error: 'Error al agregar el valor de referencia' });
    }
};
export const obtenerValoresReferenciaPorDeterminante = async (req, res) => {
    const idDeterminante = req.params.idDeterminante;

    if (!idDeterminante) {
        return res.status(400).json({ error: 'El idDeterminante es obligatorio' });
    }

    try {
        const valoresReferencia = await Examen.obtenerValoresReferenciaPorIdDeterminante(idDeterminante);
        res.status(200).json(valoresReferencia);
    } catch (error) {
        console.error('Error al obtener los valores de referencia:', error);
        res.status(500).json({ error: 'Error al obtener los valores de referencia' });
    }
};

export const eliminarDeterminante = async (req, res) => {
    try {
        const idDeterminante = req.params.idDeterminante;
        await Examen.eliminarDeterminante(idDeterminante, 0);
        res.json({ message: 'Determinante eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la determinante:', error);
        res.status(500).json({ message: 'Error al eliminar la determinante' });
    }
};
export const validarResultado = async (req, res) => {
    const { idMuestra } = req.body;

    try {
        const resultado = await Examen.validarResultado(idMuestra);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const imprimirInforme = async (req, res) => {
    try {
        const nroOrden = req.params.nroOrden;
        const orden = await Examen.obtenerResultados(nroOrden); // Ajusta según tu método de obtención de orden
        console.log(orden.nroOrden);
        if (!orden) {
            return res.status(404).send('Orden no encontrada');
        }

        res.render('informe', { orden }); // Renderiza una vista 'informe.pug' con los datos de la orden
    } catch (error) {
        console.error('Error al generar el informe:', error);
        res.status(500).send('Hubo un problema al generar el informe');
    }
};
