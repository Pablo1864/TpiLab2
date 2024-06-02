import {conexion} from "../mysql.conexion.mjs";

export class Muestra {
    static async buscarMuestrasPorNroOrden(id){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM muestras WHERE nroOrden = ?';
            conexion.query(sql, [id], (err, res, field) => {
                if (err){
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}