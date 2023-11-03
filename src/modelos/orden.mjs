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
            const sql = `INSERT INTO ordenes (nroOrden, diagnostico, medicoSolicitante, matriculaMedico, idPaciente, estado, muestrasEnEspera, fechaModificacion) VALUES (${null},'${diagnostico}','${medico}',${matriculaMedico},${idPaciente},'${'esperando toma de muestra'}','${1}', NOW())`
            conexion.query(sql, (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    let idQuery = 'SELECT LAST_INSERT_ID() as id';
                    conexion.query(idQuery, (err, res, f) =>{
                        if (err){
                            reject(err);
                        } else {
                            let lastId = res[0].id;
                            resolve(lastId);
                        }
                    });
                    //resolve(res);
                }
            });
        });
    }

    static async relacionarExamenes(idOrden, idExamenes){
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?, ?)`
            conexion.query(sql, [idOrden, idExamenes], (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

};