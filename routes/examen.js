// routes/examen.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { insertarExamen } = require('../src/mysql.conexion'); // Importa la función para insertar exámenes

// Ruta para mostrar la página que incluye los formularios para la gestión de exámenes
router.get('/gestion-examenes', (req, res) => {
    res.render('examenes.pug');
});

// Ruta para manejar el ingreso de nuevos exámenes
router.post('/nuevo-examen', (req, res) => {
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
            // Maneja el error de inserción según tus necesidades
            res.redirect('/gestion-examenes?error=1'); // Redirige a la página de gestión de exámenes con un indicador de error
        } else {
            console.log('Examen insertado con éxito');
            // Realiza cualquier otra acción o redirige según tus necesidades
            res.redirect('/gestion-examenes');
        }
    });
});

// Ruta para manejar la actualización de exámenes existentes
router.post('/actualizar-examen', (req, res) => {
    // Recuperar los datos del formulario
    const idExamen = req.body.idExamen;
    const examenActualizado = {
        nombreExamen: req.body.nuevoNombreExamen,
        fechaModif: req.body.nuevaFechaModif,
        requerimiento: req.body.nuevoRequerimiento,
        idDeterminante: req.body.nuevoIdDeterminante,
        diasDemora: req.body.nuevoDiasDemora,
        tipoAnalisis: req.body.nuevoTipoAnalisis,
        estado: req.body.nuevoEstado,
        fechaCreacion: req.body.nuevaFechaCreacion,
    };

    // Realiza la actualización en la tabla 'examenes' basada en el ID
    connection.query(
        'UPDATE examenes SET ? WHERE idExamen = ?',
        [examenActualizado, idExamen],
        (error, results) => {
            if (error) {
                console.error('Error al actualizar el examen:', error);
                // Maneja el error de actualización según tus necesidades
                res.redirect('/gestion-examenes?error=2'); // Redirige a la página de gestión de exámenes con un indicador de error
            } else {
                console.log('Examen actualizado con éxito');
                // Realiza cualquier otra acción o redirige según tus necesidades
                res.redirect('/gestion-examenes');
            }
        }
    );
});

module.exports = router;




