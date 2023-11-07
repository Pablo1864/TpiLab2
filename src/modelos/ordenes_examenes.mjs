import conexion from '../mysql.conexion.mjs';

export class Ordenes_examenes{
    
    static async createRelationship(idOrden, idExamen){
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?,?)';
            conexion.query(sql, [idOrden, idExamen], (err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }



  
}