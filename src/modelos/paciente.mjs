import {conexion, query, getConnection} from '../mysql.conexion.mjs'

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
    static async crearPaciente(nombre, apellido, dni, telefono, sexo, fechaNacimiento, email, provincia, localidad, domicilio, obraSocial, nroAfiliado) {
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
//busca por DNI
    static async obtenerPacienteFiltrado(datoBuscado){
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM pacientes WHERE dni LIKE CONCAT(${datoBuscado},'%')`
            conexion.query(sql, function (err, result) {
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
            conexion.query(sql, (err, res) =>{
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
            conexion.query(sql, [mail], (err, res) =>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }


        static async obtenerPacientesPorApellido(nombreOrApellido){
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM pacientes WHERE nombre LIKE CONCAT(?, '%') OR apellido LIKE CONCAT(?, '%')`
                conexion.query(sql,[nombreOrApellido, nombreOrApellido], function (err, result) {
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
            conexion.query(sql, (err, result) =>{
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
            conexion.query(sql, (err, res) => {
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
            conexion.query(sql, (err, res)=>{
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

    //para buscar pacientes activos
    static async buscarPacientesActivos(){
        const con = await getConnection();
        try {
            const sql = `SELECT * FROM pacientes WHERE Activo = 1`;
            const res = await query(sql, [], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }
    static async buscarPacientesActivosPorID(id){
        const con = await getConnection();
        try {
            const sql = `SELECT * FROM pacientes WHERE idPaciente = ? AND Activo = 1`;
            const res = await query(sql, [ id], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }
    static async buscarPacientesActivosPorApellido(apellido){
        const con = await getConnection();
        try {
            const sql = `SELECT * FROM pacientes WHERE apellido LIKE ? AND Activo = 1`;
            const res = await query(sql, ['%'+apellido+'%'], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }
    static async buscarPacientesActivosPorDNI(dni){
        const con = await getConnection();
        try {
            const sql = `SELECT * FROM pacientes WHERE dni LIKE ? AND Activo = 1`;
            const res = await query(sql, [ '%'+dni+'%'], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }
    static async buscarPacientesActivosPorEmail(email){
        const con = await getConnection();
        try {
            const sql = `SELECT * FROM pacientes WHERE email LIKE ? AND Activo = 1`;
            const res = await query(sql, [ '%'+email+'%'], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

};





