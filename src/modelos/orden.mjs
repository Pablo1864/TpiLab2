import { conexion, query, getConnection, beginTransaction, commit, rollback } from '../mysql.conexion.mjs';

export class Orden {

    //para mostrar en /ordenes/administracion
    static async buscarDatasOrdenesActivas(filters) {
        /*filters = {
            'nroOrden':'123',
            'estado':'finalizada',
            'paciente':'pedro',
            'medico':'pedro',
            'fechaCreacion':'2022-01-01',
            'fechaCreacionFin':'2022-01-02',
            'orderBy':'fechaCreacion',
            'direction':'ASC',
            etc.(filtro:valor)
        } */
        const con = await getConnection();
        try {
            let sqlBase = `
            SELECT 
                o.nroOrden,
                o.estado,
                o.razonCancelacion,
                o.fechaCreacion,
                o.fechaModificacion, 
                p.idPaciente, 
                p.nombre AS nombrePaciente,
                p.apellido AS apellidoPaciente, 
                p.dni, 
                m.idMedico, 
                m.nombre AS nombreMedico, 
                m.apellido AS apellidoMedico
            FROM ordenes AS o
            JOIN 
                pacientes AS p ON p.idPaciente = o.idPaciente
            JOIN 
                medico AS m ON m.idMedico = o.idMedico`;
            let params = [];
            const { sortBy, direction, estado, ...filtersWhere} = filters;
            console.log(estado);
            if (estado.toLowerCase() == 'canceladas') {
                sqlBase += ` WHERE o.razonCancelacion IS NOT NULL`;
            } else {
                sqlBase += ` WHERE o.razonCancelacion IS NULL`;

                if (estado != 'todas'
                    && (estado.toLowerCase() == 'ingresada'
                        || estado.toLowerCase() == 'esperando toma de muestras'
                        || estado.toLowerCase() == 'analitica')) {

                    sqlBase += ` AND o.estado = ?`;
                    params.push(estado.toLowerCase());
                }
            }
            const columnFilterWhere = {
                nroOrden: 'o.nroOrden',
                apellidoPaciente: 'p.apellido',
                apellidoMedico: 'm.apellido',
            }
            const columnasAllowed = Object.values(columnFilterWhere);
            Object.keys(filtersWhere).forEach(key => {
                if (typeof filtersWhere[key] !== 'undefined' && filtersWhere[key] && filtersWhere[key].toLowerCase() !== '') {
                    if (columnFilterWhere[key] && columnasAllowed.includes(columnFilterWhere[key])) {
                        sqlBase += ` AND ${columnFilterWhere[key]} LIKE ?`;
                        params.push("%" + filtersWhere[key] + "%");
                    }
                };
            });
            
            if (sortBy && direction) { //sanitizar..
                sqlBase += ` ORDER BY ${sortBy} ${direction}`
            }
            const sql = `${sqlBase}`;
            const rows = await query(sql, params , con);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

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
    mu.idExamenes AS idExamenesMuestra,
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

    //para traer data para imprimir
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
                }
            });
        });
    }

    static async buscarOrdenPorID(id) {
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
        })
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

    static async desactivarOrden(idOrden, razon) {
        const con = await getConnection();
        try {
            const sql = 'UPDATE ordenes SET razonCancelacion = ? WHERE nroOrden = ?';

            const res = await query(sql, [razon, idOrden], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
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

    //only works for ingresada and esperando toma de muestras(since those are the only 'editables' ones in normal circumstances)
    static async updateOrden (oldOrden, newOrden) { //oldOrden {idPaciente, idMedico, idDiagnosticosArr, idExamenesArr, estado}, newOrden {idPaciente, idMedico, idDiagnosticosArr, idExamenesArr, estado}
        const con = await getConnection();
        try {
            await beginTransaction(con);
            const respuestas = {
                rowsAffectedExamenesAdd: 0,
                rowsAffectedDiagnosticosAdd: 0,
                rowsAffectedMuestrasAdd: 0,
                rowsAffectedDiagnosticosDel: 0,
                rowsAffectedExamenesDel: 0,
                rowsAffectedMuestrasDel: 0
            };
            let muestras = 0;
            if (newOrden.estado.toLowerCase() == 'esperando toma de muestras'){
                muestras = 1;
            } else if (newOrden.estado.toLowerCase() == 'ingresada') {
                muestras = 0;
            } else {
                throw new Error('El estado de la orden no es valido');
            }
            const IdsToDeleteExamenes = oldOrden.idExamenesArr.filter(x => !newOrden.idExamenesArr.includes(x));
            const IdsToDeleteDiagnosticos = oldOrden.idDiagnosticosArr.filter(x => !newOrden.idDiagnosticosArr.includes(x));
            const IdsToAddExamenes = newOrden.idExamenesArr.filter(x => !oldOrden.idExamenesArr.includes(x));
            const IdsToAddDiagnosticos = newOrden.idDiagnosticosArr.filter(x => !oldOrden.idDiagnosticosArr.includes(x));
            const sqlToDeleteEx = 'DELETE FROM ordenes_examenes WHERE nroOrden = ? AND idExamenes = ?';
            const sqlToDeleteDiag = 'DELETE FROM ordenes_diagnosticos WHERE nroOrden = ? AND idDiagnostico = ?';
            const sqlToDeleteMuestra = 'DELETE FROM muestras WHERE nroOrden = ? AND idExamenes = ?';

            const sqlToAddEx = 'INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?, ?)';
            const sqlToAddDiag = 'INSERT INTO ordenes_diagnosticos (nroOrden, idDiagnostico) VALUES (?, ?)';
            const sqlToAddMuestra = 'INSERT INTO muestras (nroOrden, tipo, estado, idExamenes, fechaCreacion, fechaModif) VALUES (?, ?, ?, ?, NOW(), NOW())';
            if (IdsToDeleteExamenes.length > 0) {
                
                for (let i = 0; i < IdsToDeleteExamenes.length; i++) {
                    const res = await query(sqlToDeleteEx, [oldOrden.nroOrden, IdsToDeleteExamenes[i]], con);
                    const resMuestra = await query(sqlToDeleteMuestra, [oldOrden.nroOrden, IdsToDeleteExamenes[i]], con);
                    if (res.affectedRows > 0) {
                        respuestas.rowsAffectedExamenesDel++;
                    } else {
                        throw new Error('No se pudo borrar el examen');
                    }
                    if (resMuestra.affectedRows > 0) {
                        respuestas.rowsAffectedMuestrasDel++;
                    } else {
                        throw new Error('No se pudo borrar la muestra');
                    }
                }
            }

            if (IdsToDeleteDiagnosticos.length > 0) {
                for (let i = 0; i < IdsToDeleteDiagnosticos.length; i++) {
                    const res = await query(sqlToDeleteDiag, [oldOrden.nroOrden, IdsToDeleteDiagnosticos[i]], con);
                    if (res.affectedRows > 0) {
                        respuestas.rowsAffectedDiagnosticosDel++;
                    } else {
                        throw new Error('No se pudo borrar el diagnóstico');
                    }
                }
            }

            if (IdsToAddExamenes.length > 0) {
                const dataExa = await query('SELECT idExamenes, tipoAnalisis FROM examenes WHERE idExamenes IN (?)', [IdsToAddExamenes], con);
                if (dataExa.length != IdsToAddExamenes.length) {
                    throw new Error('No se pudieron agregar los examenes');
                }
                for (let i = 0; i < IdsToAddExamenes.length; i++) {
                    const res = await query(sqlToAddEx, [oldOrden.nroOrden, IdsToAddExamenes[i]], con);
                    const resMuestra = await query(sqlToAddMuestra, [oldOrden.nroOrden, dataExa.find(x => x.idExamenes == IdsToAddExamenes[i]).tipoAnalisis, 0, IdsToAddExamenes[i]], con);
                    if (res.affectedRows > 0) {
                        respuestas.rowsAffectedExamenesAdd++;
                    } else {
                        throw new Error('No se pudo agregar el examen');
                    }
                    if (resMuestra.affectedRows > 0) {
                        respuestas.rowsAffectedMuestrasAdd++;
                    } else {
                        throw new Error('No se pudo agregar la muestra');
                    }
                }
            }
            if (IdsToAddDiagnosticos.length > 0) {
                for (let i = 0; i < IdsToAddDiagnosticos.length; i++) {
                    const res = await query(sqlToAddDiag, [oldOrden.nroOrden, IdsToAddDiagnosticos[i]], con);
                    if (res.affectedRows > 0) {
                        respuestas.rowsAffectedDiagnosticosAdd++;
                    } else {
                        throw new Error('No se pudo agregar el diagnóstico');
                    }
                }
            }
            console.log("Respuestas array: ", respuestas);
            const sql = `UPDATE ordenes SET estado = ? , muestrasEnEspera = ?, fechaModificacion = NOW() WHERE nroOrden = ?`;
            const res = await query(sql, [newOrden.estado, muestras, oldOrden.nroOrden], con);
            await commit(con);
            return true;
        } catch (err) {
            console.log("Error: ", err);
            await rollback(con);
            throw err;
        } finally {
            if (con) con.release();
        }
    }
}


