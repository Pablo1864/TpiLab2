import { conexion } from '../mysql.conexion.mjs';

export class Orden {
    static async buscarTodas() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico 
                         FROM ordenes 
                         JOIN pacientes ON ordenes.idPaciente = pacientes.idPaciente 
                         JOIN medico ON medico.idMedico = ordenes.idMedico 
                         WHERE razonCancelacion = ''`;
            conexion.query(sql, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async buscarOrdenDataPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico 
                         FROM ordenes 
                         JOIN pacientes ON ordenes.idPaciente = pacientes.idPaciente 
                         JOIN medico ON medico.idMedico = ordenes.idMedico 
                         WHERE razonCancelacion = '' AND ordenes.nroOrden = ?`;
            conexion.query(sql, [id], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async buscarOrdenPorApellidoPaciente(ape) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico 
                         FROM ordenes 
                         JOIN pacientes ON ordenes.idPaciente = pacientes.idPaciente 
                         JOIN medico ON medico.idMedico = ordenes.idMedico 
                         WHERE razonCancelacion = '' AND pacientes.apellido LIKE ?`;
            conexion.query(sql, ['%' + ape + '%'], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async buscarOrdenPorID(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ordenes WHERE nroOrden = ?`;
            conexion.query(sql, [id], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async traerExamenesDeOrden(idOrden) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT examenes.*, ordenes.nroOrden 
                         FROM ordenes 
                         JOIN ordenes_examenes ON ordenes.nroOrden = ordenes_examenes.nroOrden 
                         JOIN examenes ON examenes.idExamen = ordenes_examenes.idExamen 
                         WHERE ordenes.nroOrden = ?`;
            conexion.query(sql, [idOrden], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async updateExistingOrder(id, orden) {
        try {
            const exists = await this.buscarOrdenPorID(id);
            if (exists.length > 0) {
                return new Promise((resolve, reject) => {
                    const sql = `UPDATE ordenes SET estado = ?, idMedico = ?, muestrasEnEspera = ?, idPaciente = ?, fechaModificacion = NOW() 
                                 WHERE nroOrden = ?`;
                    conexion.query(sql, [orden.estado, orden.idMedico, orden.muestrasEnEspera, orden.idPaciente, id], (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.affectedRows);
                        }
                    });
                });
            } else {
                return Promise.reject(new Error('No existe la orden a modificar!'));
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async crearOrden(orden) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ordenes (nroOrden, idMedico, idPaciente, estado, muestrasEnEspera, fechaModificacion) 
                         VALUES (NULL, ?, ?, ?, 1, NOW())`;
            conexion.query(sql, [orden.idMedico, orden.idPaciente, orden.estado], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async relacionarExamenes(idOrden, idExamenes) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ordenes_examenes (nroOrden, idExamen) VALUES (?, ?)`;
            conexion.query(sql, [idOrden, idExamenes], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async cancelarOrden(idOrden, razon) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ordenes SET razonCancelacion = ? WHERE nroOrden = ?`;
            conexion.query(sql, [razon, idOrden], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async obtenerOrdenesAnalitica() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ordenes.*, 
                    pacientes.nombre AS nombrePaciente, 
                    pacientes.apellido AS apellidoPaciente
                FROM 
                    ordenes 
                JOIN 
                    pacientes 
                ON 
                    ordenes.idPaciente = pacientes.idPaciente 
                WHERE 
                    ordenes.estado IN ('Analítica', 'Pre Informe')
            `;
            conexion.query(sql, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async buscarDetallesOrden(nroOrden) {
        return new Promise((resolve, reject) => {
            const queryOrden = `
                SELECT o.nroOrden, p.nombre AS nombrePaciente, p.apellido AS apellidoPaciente, o.fechaCreacion, o.estado, 
                       e.idExamenes AS idExamen, e.nombre AS nombreExamen, e.requerimiento, e.horaDemora, e.tipoAnalisis
                FROM ordenes o
                JOIN pacientes p ON o.idPaciente = p.idPaciente
                JOIN ordenes_examenes oe ON o.nroOrden = oe.nroOrden
                JOIN examenes e ON oe.idExamenes = e.idExamenes
                WHERE o.nroOrden = ?
            `;
            conexion.query(queryOrden, [nroOrden], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    if (res.length > 0) {
                        const orden = {
                            nroOrden: res[0].nroOrden,
                            nombrePaciente: res[0].nombrePaciente,
                            apellidoPaciente: res[0].apellidoPaciente,
                            fechaCreacion: res[0].fechaCreacion,
                            estado: res[0].estado,
                            examenes: res.map(row => ({
                                idExamen: row.idExamen,
                                nombre: row.nombreExamen,
                                requerimiento: row.requerimiento,
                                horaDemora: row.horaDemora,
                                tipoAnalisis: row.tipoAnalisis
                            }))
                        };
                        resolve(orden);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
}


