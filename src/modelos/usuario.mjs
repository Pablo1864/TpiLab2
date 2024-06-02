import {conexion} from '../mysql.conexion.mjs'

export class Paciente {

    //verifica si esta el paciente antes de guardarlo
    static async verificarUsuario(dni,email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*)
            FROM usuarios
            WHERE email = email="${email}" And dni = ${dni};`;
            conexion.query(sql, function (err, result, filed) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}