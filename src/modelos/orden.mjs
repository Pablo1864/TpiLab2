import conexion from '../mysql.conexion.mjs';

export class Orden{

    
    static async buscarTodas(){
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion = ''`;
            conexion.query(sql, (err, res, field) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(err);
                }
            });
        })
    }

    
    static async buscarOrdenDataPorId(id){
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion = '' AND ordenes.nroOrden = ?`;
            conexion.query(sql, [id], (err, res, field) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(err);
                }
            });
        })
    }
    static async buscarOrdenPorApellidoPaciente(ape){
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion = '' AND pacientes.apellido LIKE (?)`;
            conexion.query(sql, ['%'+ape+ '%'], (err, res, field) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(err);
                }
            });
        })
    }
    
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

    static async traerExamenesDeOrden(idOrden){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT examenes.*, ordenes.nroOrden FROM ordenes JOIN ordenes_examenes JOIN examenes ON (ordenes.nroOrden = ordenes_examenes.nroOrden AND examenes.idExamenes = ordenes_examenes.idExamenes) WHERE ordenes.nroOrden = ?';
            conexion.query(sql, [idOrden], (err, res, f) =>{
                if (err){
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }

    static async updateExistingOrder(id, orden){
        try {
            const exists = await this.buscarOrdenPorID(id);
            if (exists.length > 0){
                return new Promise((resolve, reject) => {
                    const sql = 'UPDATE ordenes SET estado=?, idMedico=?, muestrasEnEspera=?, idPaciente=?, fechaModificacion=NOW() WHERE nroOrden=?';
                    conexion.query(sql, [orden.estado, orden.idMedico, orden.muestrasEnEspera, orden.idPaciente, id], (err, res, field) => {
                        if (res) {
                            resolve(res.affectedRows);
                        } else {
                            reject(err);
                        }
                    });
                });
            } else {
                return Promise.reject(new Error('No existe la orden a modificar!'));
            }
        } catch (err){
            return Promise.reject(err);
        }
    }
    
    static async crearOrden(orden){
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO ordenes (nroOrden, idMedico, idPaciente, estado, muestrasEnEspera, fechaModificacion) VALUES (NULL,?,?,?,1, NOW())'
            conexion.query(sql, [orden.idMedico, orden.idPaciente, orden.estado], (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
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

    static async cancelarOrden(idOrden, razon){
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ordenes SET razonCancelacion = ? WHERE nroOrden = ?`
            conexion.query(sql, [razon, idOrden], (err, res, field)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

};