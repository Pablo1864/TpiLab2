import conexion from '../mysql.conexion.mjs';

export class Orden{
    static async buscarOrdenPorID(id){
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
    
};