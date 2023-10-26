import mysql from 'mysql';
let todosPacientes;
let paciente;
const conexion = mysql.createConnection(
    {
        user: 'root',
        host: 'localhost',
        password: '',
        database: 'labanalisis'
    }
)

const conectar = () => {
    conexion.connect(err => {
        if (err) throw err
        console.log('conectado')
    })
};

//si filed.lenght es mayor a cero hay algun registro mal, ver capturar la excepción
//AGREGAR PACIENTE
const agregarPaciente = (nombre, apellido, dni, telefono, sexo, fechaNacimiento, email, provincia, localidad, domicilio,
    obraSocial, nroAfiliado) => {
    const sql = `INSERT INTO pacientes(idPaciente,nombre,apellido,dni,fechaNacimiento,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado)
VALUES (${null},"${nombre}","${apellido}",${dni},"${fechaNacimiento}","${provincia}","${localidad}","${domicilio}","${email}",${telefono},"${sexo}","${obraSocial}",${nroAfiliado})`;
    conexion.query(sql, function (err, result, filed) {
        if (err) throw err;
        console.log(result);
    });
};


//OBTENER PACIENTES
const obtenerPacientes = () => {
    const sql = 'SELECT idPaciente, nombre, apellido, email, dni FROM pacientes'
    conexion.query(sql, function (err, result, field) {
        if (result) {
            todosPacientes = result;
        }
        else console.log(err)
    })
    return todosPacientes //array de objetos

}
//OBTENER PACIENTE FILTRADO
const obtenerPacienteFiltrado = datoBuscado => {
    const sql = `SELECT * FROM pacientes WHERE dni LIKE ${datoBuscado}`
    conexion.query(sql, function (err, result, field) {
        if (result){
            paciente=result
        } 
        
        else {
             console.log(err);
        }
    })
    return paciente //array de objetos

}

//BORRAR PACIENTE
const borrarPaciente = id => {
    const sql = `DELETE FROM pacientes WHERE idPaciente=${id}`
    conexion.query(sql)
}

//BUSCAR PACIENTE BY ID
const buscarPacientePorId = id => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM pacientes WHERE idPaciente=${id}`;
        conexion.query(sql, (err, res, field) => {
            if (res){
                resolve(res)
            } else {
                reject(err);
            }
        })
    })
}



//BUSCAR ORDER BY ID
const buscarOrdenPorID = id => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ordenes WHERE nroOrden=${id}`;
        conexion.query(sql, (err, res, field) => {
            if (res) {
                resolve(res)
            } else {
                reject(err);
            }
        });
    })

}

//BUSCAR EXAMENES BY ID DE ORDER
const buscarExamenPorIdOrden = id =>{
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ordenes_examenes NATURAL JOIN examenes WHERE nroOrden=${id}`;
        conexion.query(sql, (err, res, field) => {
            if (res){
                resolve(res);
            } else {
                reject(err);
            }
        })
    })
}
const insertarExamen = (nuevoExamen, callback) => {
    conexion.query('INSERT INTO examenes SET ?', nuevoExamen, (error, results, fields) => {
        if (error) {
            console.error('Error al insertar el examen:', error);
        } else {
            console.log('Examen insertado con éxito');
        }
        callback(error, results);
    });
};

export { conectar,obtenerPacienteFiltrado, agregarPaciente, obtenerPacientes, borrarPaciente, buscarOrdenPorID, insertarExamen , buscarPacientePorId, buscarExamenPorIdOrden}