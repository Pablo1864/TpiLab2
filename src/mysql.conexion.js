import mysql from 'mysql';
let todosPacientes;

const conexion= mysql.createConnection(
    {
        user:'root',
        host:'127.0.0.1',
        password:'',
        database:'labanalisis'
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

export{conectar,agregarPaciente,obtenerPacientes,borrarPaciente}