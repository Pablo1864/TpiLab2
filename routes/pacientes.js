import express from 'express';
import { agregarPaciente, obtenerPacientes, borrarPaciente } from '../src/mysql.conexion.js';

const router = express.Router();

// Ruta principal para mostrar la lista de pacientes
router.get('/', (req, res) => {
    const todosPacientes = obtenerPacientes();
    res.render('paciente', {
        titulo: 'Laboratorio de análisis',
        pacientes: todosPacientes,
    });
});

// Ruta para agregar un nuevo paciente
router.get('/agregar/:nombre/:apellido/:dni/:telefono/:sexo/:fechaNac/:email/:provincia/:localidad/:domicilio/:obraSocial/:numeroAfiliado', (req, res) => {
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.params;

    agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);

    res.redirect('/');
});

// Ruta para eliminar un paciente
router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    borrarPaciente(id);
    res.redirect('/');
});


router.get('/registrarPaciente/:nombre/:apellido/:dni/:telefono/:sexo/:fechaNac/:email/:provincia/:localidad/:domicilio/:obraSocial/:numeroAfiliado', (req, res) => {
    const { nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado } = req.params;

    agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);

    res.redirect('/');
});

export default router;
