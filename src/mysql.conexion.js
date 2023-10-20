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
 const agregarPaciente = (nombre,apellido,dni,telefono) => {
   const sql = `INSERT INTO pacientes(idPaciente,nombre,apellido,dni,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado)
VALUES (${null},"${nombre}","${apellido}",${dni},"","","","",${telefono},"","",111222333444555)`;
   conexion.query(sql, function (err, result, filed) {
     if (err) throw err;
     console.log(result);
   });
 };

//OBTENER PACIENTES
const obtenerPacientes=()=>{
    const sql= 'SELECT idPaciente, nombre, apellido FROM pacientes'
    conexion.query(sql, function(err, result, field){
        todosPacientes= result;
    })
return todosPacientes //array de objetos

}


export{conectar,agregarPaciente,obtenerPacientes}