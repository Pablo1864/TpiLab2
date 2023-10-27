import{conexion} from '../mysql.conexion.js'

class Paciente{
static agregarPaciente = (nombre, apellido, dni, telefono, sexo, fechaNacimiento, email, provincia, localidad, domicilio,
    obraSocial, nroAfiliado) => {
    const sql = `INSERT INTO pacientes(idPaciente,nombre,apellido,dni,fechaNacimiento,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado)
VALUES (${null},"${nombre}","${apellido}",${dni},"${fechaNacimiento}","${provincia}","${localidad}","${domicilio}","${email}",${telefono},"${sexo}","${obraSocial}",${nroAfiliado})`;
    conexion.query(sql, function (err, result, filed) {
        if (err) throw err;
        console.log(result);
    });
};

static obtenerPacientes = () => {
        const sql = 'SELECT idPaciente, nombre, apellido, email, dni FROM pacientes'
        conexion.query(sql, function (err, result, field) {
            if (result) {
                todosPacientes = result;
            }
            else console.log(err)
        })
        return todosPacientes //array de objetos
    };

static obtenerPacienteFiltrado = datoBuscado => {
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
    };

static  borrarPaciente = id => {
        const sql = `DELETE FROM pacientes WHERE idPaciente=${id}`
        conexion.query(sql)
    };

static  buscarPacientePorId = id => {
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
    };
    
};

export default Paciente





