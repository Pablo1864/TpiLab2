import {conexion} from '../mysql.conexion.mjs';

export class Ordenes_diagnosticos{
    
    static async createRelationship(idOrden, idDiagnostico){
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO ordenes_diagnosticos (nroOrden, idDiagnostico) VALUES (?,?)';
            conexion.query(sql, [idOrden, idDiagnostico], (err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }



  
}