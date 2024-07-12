import { conexion, query, getConnection, beginTransaction, commit, rollback } from '../mysql.conexion.mjs';

export class Orden {


    static async buscarDataOrden(idOrden) {
        const con = await getConnection();
        try {
            const sql = `SELECT 
    o.*, 
    p.idPaciente, 
    p.nombre AS nombrePaciente, 
    p.apellido AS apellidoPaciente, 
    p.dni, 
    p.email AS emailPaciente, 
    p.provincia, 
    p.localidad, 
    p.domicilio, 
    p.fechaNacimiento, 
    p.sexo, 
    p.telefono, 
    p.obraSocial, 
    p.nroAfiliado, 
    m.idMedico, 
    m.nombre AS nombreMedico, 
    m.apellido AS apellidoMedico, 
    m.matricula, 
    m.email AS emailMedico, 
    e.idExamenes, 
    e.nombre AS nombreExamen, 
    e.requerimiento, 
    e.tipoAnalisis AS tipoRequerimientoExamen, 
    e.diasDemora,
    e.otrosNombres, 
    d.idDiagnostico, 
    d.nombre AS nombreDiagnostico,
    d.otrosTerminos,
    mu.idMuestra, 
    mu.tipo AS tipoRequerimientoMuestra,
    mu.estado AS estadoMuestra
FROM 
    ordenes AS o 
JOIN 
    pacientes AS p ON p.idPaciente = o.idPaciente 
JOIN 
    medico AS m ON m.idMedico = o.idMedico 
LEFT JOIN 
    ordenes_examenes AS o_exam ON o_exam.nroOrden = o.nroOrden 
LEFT JOIN 
    examenes AS e ON o_exam.idExamenes = e.idExamenes 
LEFT JOIN 
    muestras AS mu ON mu.nroOrden = o.nroOrden AND mu.idExamenes = e.idExamenes 
LEFT JOIN 
    ordenes_diagnosticos AS o_diag ON o_diag.nroOrden = o.nroOrden 
LEFT JOIN 
    diagnosticos AS d ON o_diag.idDiagnostico = d.idDiagnostico 
WHERE 
    o.nroOrden = ?;`;
            const res = await query(sql, [idOrden], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarTodas() {
        let con = null;
        try {
            con = await getConnection();
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion IS NULL`;
            const res = await query(sql, con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarOrdenDataPorOrdenTipo(idOrden, tipoMuestra) { //e.g. idOrden = 1, tipoMuestra = Analisis de sangre
        let con = null;
        try {
            con = await getConnection();
            const sql = "SELECT p.idPaciente, p.nombre AS nombrePaciente, p.apellido, p.dni, m.fechaModif, m.idMuestra, o.nroOrden, m.idExamenes, e.nombre AS nombreExamen FROM ordenes o JOIN muestras m JOIN examenes e JOIN pacientes p ON (o.nroOrden = m.nroOrden AND e.idExamenes = m.idExamenes AND o.idPaciente = p.idPaciente) WHERE m.nroOrden = ? AND m.tipo = ? AND m.estado = 1";
            const res = await query(sql, [idOrden, tipoMuestra], con);
            console.log("res en orden: ", res);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarOrdenDataPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion IS NULL AND ordenes.nroOrden = ?`;
            conexion.query(sql, [id], (err, res, field) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
    static async buscarOrdenPorApellidoPaciente(ape) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ordenes.*, pacientes.nombre as nombrePaciente, pacientes.apellido as apellidoPaciente, pacientes.dni, medico.nombre as nombreMedico, medico.apellido as apellidoMedico FROM ordenes JOIN pacientes JOIN medico on (ordenes.idPaciente = pacientes.idPaciente AND medico.idMedico = ordenes.idMedico) WHERE razonCancelacion IS NULL AND pacientes.apellido LIKE (?)`;
            conexion.query(sql, ['%' + ape + '%'], (err, res, field) => {
                if (res) {
                    resolve(res)
                } else {
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
            const sql = 'SELECT examenes.*, ordenes.nroOrden FROM ordenes JOIN ordenes_examenes JOIN examenes ON (ordenes.nroOrden = ordenes_examenes.nroOrden AND examenes.idExamenes = ordenes_examenes.idExamenes) WHERE ordenes.nroOrden = ?';
            conexion.query(sql, [idOrden], (err, res, f) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async crearOrdenConRelaciones(idMedico, idPaciente, estado, idDiagnosticosArr, examenesArr) { //idDiagnosticosArr es un array de ids, examenesArr es un array de objectos({idExamen, tipo})
        const con = await getConnection();
        try {
            await beginTransaction(con);
            let muestrasEnEspera = 1;
            if (estado.toLowerCase() == 'analitica' || estado.toLowerCase() == 'analítica') {
                muestrasEnEspera = 0;
            }
            const sql = 'INSERT INTO ordenes (nroOrden, idMedico, idPaciente, estado, muestrasEnEspera, fechaModificacion, razonCancelacion) VALUES (NULL,?,?,?,?, NOW(), NULL)';
            const res1 = await query(sql, [idMedico, idPaciente, estado, muestrasEnEspera], con);
            let resDiag = 0;
            let resMuestras = [];
            let resExams = 0;
            console.log(res1);
            const idOrden = res1.insertId;
            console.log("Primer insert: ", idOrden);

            if (idOrden > 0) {
                if (idDiagnosticosArr.length > 0) {
                    const sql = 'INSERT INTO ordenes_diagnosticos (nroOrden, idDiagnostico) VALUES (?,?)';
                    for (let i = 0; i < idDiagnosticosArr.length; i++) {
                        try {
                            let res = await query(sql, [idOrden, idDiagnosticosArr[i]], con);
                            console.log("Inner diagnosticos insert successful: ", res.affectedRows);
                            resDiag += res.affectedRows;
                        } catch (err) {
                            console.log(err);
                            throw err;
                        }

                    }
                }

                if (examenesArr.length > 0) {
                    const sql = 'INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?,?)';
                    const sqlMuestra = 'INSERT INTO muestras (nroOrden, idExamenes, tipo, estado, fechaCreacion, fechaModif) VALUES (?,?,?,?, NOW(), NOW())';
                    for (let i = 0; i < examenesArr.length; i++) {
                        try {
                            let res = await query(sql, [idOrden, examenesArr[i].idExamen], con);
                            console.log("Inner examenes insert successful: ", res.affectedRows);
                            resExams += res.affectedRows;
                            let res2 = await query(sqlMuestra, [idOrden, examenesArr[i].idExamen, examenesArr[i].tipo, 0], con); //0 porque aun no estan presentadas 
                            console.log("Inner muestras insert successful: ", res2.insertId);
                            resMuestras.push({ idMuestra: res2.insertId, tipo: examenesArr[i].tipo, estado: false});
                        } catch (err) {
                            console.log(err);
                            throw err;
                        }
                    }
                }
                const res = [{
                    nroOrden: idOrden,
                    rowsAffectedDiagnosticos: resDiag,
                    rowsAffectedExamenes: resExams,
                    muestrasInsertadas: resMuestras
                }]
                await commit(con);
                return res;
            } else {
                throw new Error('No se pudo crear la orden');
            }
        } catch (err) {
            console.log("SOMETHING WENT WRONG EN CREAR ORDEN:");
            console.log("ROLLBACK: ", err);
            await rollback(con);
            throw err;
        } finally {
            if (con) {
                con.release();
            }
        }
    }

    static async cancelarOrden(idOrden, razon) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ordenes SET razonCancelacion = ? WHERE nroOrden = ?`
            conexion.query(sql, [razon, idOrden], (err, res, field) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async cambiarEstado(idOrden, estado) {
        const con = await getConnection();
        try {
            let muestras = 0;
            if (estado.toLowerCase() == 'analítica' || estado.toLowerCase() == 'analitica') {
                muestras = 0;
                estado = 'Analítica';
            } else {
                muestras = 1;
            }
            const sql = `UPDATE ordenes SET estado = ? , muestrasEnEspera = ? WHERE nroOrden = ?`;

            const res = await query(sql, [estado, muestras, idOrden], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async updateOrden (oldOrden, newOrden) { //oldOrden {idPaciente, idMedico, idDiagnosticosArr, idExamenesArr, estado}, newOrden {idPaciente, idMedico, idDiagnosticosArr, idExamenesArr, estado}
        const con = await getConnection();
        try {
            await beginTransaction(con);
            let muestras = 0;
            if (body.estado.toLowerCase() == 'analítica' || body.estado.toLowerCase() == 'analitica') {
                muestras = 0;
                body.estado = 'Analítica';
            } else {
                muestras = 1;
            }
            //figure which IDs to be updated, which to be deleted
            //const sql = `UPDATE ordenes SET estado = ? , muestrasEnEspera = ?, idPaciente = ?, idMedico = ?, fechaModif = NOW(), razonCancelacion = ? WHERE nroOrden = ?`;
            //const res = await query(sql, [body.estado, body.muestrasEnEspera, idOrden], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
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


