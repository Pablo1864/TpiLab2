import conexion from '../mysql.conexion.mjs';

export class Examen{

    //Trae un join entre ordenes y examenes por nroOrden 
    static async buscarExamenxOrdenPorIdOrden(id){
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ordenes_examenes NATURAL JOIN examenes WHERE nroOrden=${id}`;
            conexion.query(sql, (err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            })
        })
    }

    static async insertarExamen(nuevoExamen, callback){
        conexion.query('INSERT INTO examenes SET ?', nuevoExamen, (error, results, fields) => {
            if (error) {
                console.error('Error al insertar el examen:', error);
            } else {
                console.log('Examen insertado con éxito');
            }
            callback(error, results);
        });
    };
}
