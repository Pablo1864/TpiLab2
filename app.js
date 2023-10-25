import express from 'express';
import bodyParser from 'body-parser'; // Importa body-parser
import { agregarPaciente, obtenerPacientes, borrarPaciente, buscarOrdenPorID, insertarExamen } from './src/mysql.conexion.js';

const app = express();

// Configura body-parser para analizar los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('La aplicación se inició en el puerto 3000');
});

app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('./view'));
app.use(express.static('./src'));
app.use(express.static('./css'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/paciente', function (req, res) {
    res.render('paciente');
});

app.get('/paciente', function (req, res) {
    res.render('paciente');
});

app.get('/agregar/:nombre/:apellido/:dni/:telefono/:sexo/:fechaNac/:email/:provincia/:localidad/:domicilio/:obraSocial/:numeroAfiliado', function (req, res) {
    const nombre = req.params.nombre;
    const apellido = req.params.apellido;
    const dni = req.params.dni;
    const telefono = req.params.telefono;
    const sexo = req.params.sexo;
    const fechaNac = req.params.fechaNac;
    const email = req.params.email;
    const provincia = req.params.provincia;
    const localidad = req.params.localidad;
    const domicilio = req.params.domicilio;
    const obraSocial = req.params.obraSocial;
    const numeroAfiliado = req.params.numeroAfiliado;

    agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNac, email, provincia, localidad, domicilio, obraSocial, numeroAfiliado);

    res.redirect('/');
});

app.get('/delete/:id', function (req, res) {
    const id = req.params.id;
    borrarPaciente(id);
    res.redirect('/');
});

app.get('/resultados', (req, res) => {
    res.render('resultados', {
        orden: {
            'numero de orden': null,
            'estado': null,
            'diagnostico': null,
            'matricula de medico': null,
            'paciente': null,
        }
    });
});

app.get('/buscar/:id', async (req, res) => {
    const id = req.params.id;
    const orden = await buscarOrdenPorID(id);
    if (orden.length > 0) {
        res.render('resultados', {
            orden: {
                'numero de orden': orden[0].nroOrden,
                'estado': orden[0].estado,
                'diagnostico': orden[0].diagnostico,
                'matricula de medico': orden[0].matriculaMedico,
                'paciente': orden[0].idPaciente
            }
        });
    }
});

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
    insertarExamen(nuevoExamen, (error, results) => {
        if (error) {
            console.error('Error al insertar el examen:', error);
            res.redirect('/gestion-examenes?error=1'); // Redirige a la página de gestión de exámenes con un indicador de error
        } else {
            console.log('Examen insertado con éxito');
            res.redirect('/gestion-examenes');
        }
    });
});

