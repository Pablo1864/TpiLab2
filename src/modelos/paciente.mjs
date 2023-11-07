import conexion from '../mysql.conexion.mjs'

export class Paciente {

    //verifica si esta el paciente antes de guardarlo
    static async verificarPaciente(dni,email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) As count FROM pacientes
            WHERE email="${email}" And dni = ${dni};`;
            conexion.query(sql, function (err, result, filed) {
                if (err) {
                    reject(err);
                } else {
                    const count = result[0].count;
                    console.log(count)
                    resolve(count);
                }
            });
        });
    }
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

    static async obtenerPacientesTodos(){
        return new Promise((resolve, reject)=>{
            const sql = 'SELECT * FROM pacientes';
            conexion.query(sql, (err, res, field) =>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }

    static async obtenerPacientePorMail(mail){
        return new Promise((resolve, reject)=>{
            const sql = 'SELECT * FROM pacientes WHERE email LIKE ?';
            conexion.query(sql, [mail], (err, res, field) =>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }

    static async obtenerPacientesPorApellido(apellido){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM pacientes WHERE apellido LIKE ?';
            conexion.query(sql, ['%'+apellido+'%'], (err, res, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
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

    static async actualizarPaciente(idPaciente,nombre,apellido,provincia,localidad,domicilio,email,telefono,sexo,obraSocial,nroAfiliado,fechaNacimiento,dni){
        return new Promise((resolve, reject) => {
            const sql = `UPDATE pacientes SET nombre="${nombre}",apellido="${apellido}",
            provincia="${provincia}",localidad="${localidad}",domicilio="${domicilio}",email="${email}",
            telefono=${telefono},sexo="${sexo}",obraSocial="${obraSocial}",nroAfiliado=${nroAfiliado},
            fechaNacimiento="${fechaNacimiento}",dni=${dni} WHERE idPaciente=${idPaciente}`
            conexion.query(sql, (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async actualizarEstado(idPaciente,activo){
        return new Promise((resolve, reject) => {
            const sql = `UPDATE pacientes SET Activo="${activo}" WHERE idPaciente=${idPaciente}`
            conexion.query(sql, (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
};





