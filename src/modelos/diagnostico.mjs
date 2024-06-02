import {conexion} from '../mysql.conexion.mjs';

export class Diagnostico{
    
    static async buscarDiagnosticoPorId(id){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM diagnosticos WHERE idDiagnostico = ?';
            conexion.query(sql, [id], (err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    static async buscarDiagnosticosTodos(){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM diagnosticos';
            conexion.query(sql, (err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    static async buscarDiagnosticosPorNombres(nombre){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM diagnosticos WHERE nombre LIKE ? OR otrosTerminos LIKE ?';
            conexion.query(sql, ['%'+nombre+'%','%'+ nombre+'%'],(err, res, field) => {
                if (res){
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

}