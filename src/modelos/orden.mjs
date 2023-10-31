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
    
    static async crearOrden(idPaciente, diagnostico, medico, matriculaMedico){
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ordenes (nroOrden, diagnostico, medicoSolicitante, matriculaMedico, idPaciente, estado, muestrasEnEspera) VALUES (${null},'${diagnostico}','${medico}',${matriculaMedico},${idPaciente},'${'esperando toma de muestra'}',${1})`
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