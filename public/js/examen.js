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

router.get('/examen', (req, res) => {
    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error al obtener la conexión de la base de datos:', error);
            res.status(500).send('Error al obtener la conexión de la base de datos');
            return;
        }

        const query = 'SELECT * FROM exams'; // Cambia esto según el nombre de tu tabla.

        connection.query(query, (error, results) => {
            connection.release(); // Devuelve la conexión al pool.

            if (error) {
                console.error('Error al obtener los exámenes:', error);
                res.status(500).send('Error al obtener los exámenes de la base de datos');
            } else {
                res.render('examen', {
                    titulo: 'Gestión de Exámenes',
                    exams: results,
                });
            }
        });
    });
});

// Exporta el módulo router
module.exports = router;




