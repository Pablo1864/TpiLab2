import conexion from '../mysql.conexion.mjs'

export class Paciente {

    static async agregarPaciente(nombre, apellido, dni, telefono, sexo, fechaNacimiento, email, provincia, localidad, domicilio, obraSocial, nroAfiliado) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO pacientes(idPaciente,nombre,apellido,dni,fechaNacimiento,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado) VALUES (${null},"${nombre}","${apellido}",${dni},"${fechaNacimiento}","${provincia}","${localidad}","${domicilio}","${email}",${telefono},"${sexo}","${obraSocial}",${nroAfiliado})`;
            conexion.query(sql, function (err, result, filed) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    static async obtenerPacientes(){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idPaciente, nombre, apellido, email, dni FROM pacientes'
            conexion.query(sql, function (err, result, field) {
                if (err){
                    reject(err);
                } else {
                    resolve(result); //array de objetos
                }
            });
        });
    }
    static async obtenerPacienteFiltrado(datoBuscado){
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM pacientes WHERE dni LIKE ${datoBuscado}`
            conexion.query(sql, function (err, result, field) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async borrarPaciente(id){
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM pacientes WHERE idPaciente=${id}`
            conexion.query(sql, (err, result, field) =>{
                if (err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    static async buscarPacientePorId(id){
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM pacientes WHERE idPaciente=${id}`;
            conexion.query(sql, (err, res, field) => {
                if (err){
                    reject(err)
                } else {
                    resolve(res);
                }
            })
        })
    };
    
};





