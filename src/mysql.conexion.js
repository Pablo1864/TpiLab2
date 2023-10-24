import mysql from 'mysql';
let todosPacientes;

const conexion= mysql.createConnection(
    {
        user:'root',
        host:'localhost',
        password:'',
        database:'lab'
    }
)

const conectar=() =>{
    conexion.connect(err => {
        if(err) throw err 
        console.log('conectado')
    })
};

//si filed.lenght es mayor a cero hay algun registro mal, ver capturar la excepción
//AGREGAR PACIENTE
 const agregarPaciente = (nombre,apellido,dni,telefono,sexo,fechaNacimiento,email,provincia,localidad,domicilio,
    obraSocial, nroAfiliado) => {
   const sql = `INSERT INTO pacientes(idPaciente,nombre,apellido,dni,fechaNacimiento,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado)
VALUES (${null},"${nombre}","${apellido}",${dni},"${fechaNacimiento}","${provincia}","${localidad}","${domicilio}","${email}",${telefono},"${sexo}","${obraSocial}",${nroAfiliado})`;
   conexion.query(sql, function (err, result, filed) {
     if (err) throw err;
     console.log(result);
   });
 };

 
//OBTENER PACIENTES
const obtenerPacientes=()=>{
    const sql= 'SELECT idPaciente, nombre, apellido, fechaNacimiento FROM pacientes'
    conexion.query(sql, function(err, result, field){
        if(result){
            todosPacientes= result;
        }
        else console.log(err)
    })
return todosPacientes //array de objetos

}


//BORRAR PACIENTE
const borrarPaciente =id =>{
    const sql= `DELETE FROM pacientes WHERE idPaciente=${id}`
    conexion.query(sql)
}

//BUSCAR PACIENTE BY ID
const buscarPacientePorId = id =>{
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM pacientes WHERE idPaciente=${id}`;
        conexion.query(sql, (err, res, field) => {
            //in process..
        })
    })
}

//BUSCAR ORDER BY ID
const buscarOrdenPorID = id =>{
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ordenes WHERE nroOrden=${id}`;
        conexion.query(sql, (err, res, field) => {
            if (res){
                resolve(res)
            } else {
                reject(err);
            }
        });
    })
    
}

export{conectar,agregarPaciente,obtenerPacientes,borrarPaciente, buscarOrdenPorID}