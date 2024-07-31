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
            let muestrasEnEspera = 1
            let newEstado = '';
            if (idMedico == 0 || idPaciente == 0) {
                throw new Error('Debe seleccionar un medico y un paciente');
            }
            if (idDiagnosticosArr.length == 0 || examenesArr.length == 0) {
                newEstado = 'Ingresada';
                muestrasEnEspera = 0
            } else { 
                muestrasEnEspera = 1
                newEstado = 'Esperando toma de muestras';
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
                            resMuestras.push({ idMuestra: res2.insertId, tipo: examenesArr[i].tipo, estado: false, idExamenes: examenesArr[i].idExamen });
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

    static async cambiarAnalitica(idOrden) {
        const con = await getConnection();
        try {
            const sql = 'UPDATE ordenes SET estado = ?, muestrasEnEspera = 0, fechaModificacion = NOW() WHERE nroOrden = ?';
            const res = await query(sql, ['Analitica', idOrden], con);
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
            const sql = `UPDATE ordenes SET estado = ? , muestrasEnEspera = ?, fechaModificacion = NOW() WHERE nroOrden = ?`;

            const res = await query(sql, [estado, muestras, idOrden], con);
            return res;
        } catch (err) {
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    //only works for "ingresada" state, since it's the only editable state in normal operation
    static async updateOrden (ordenAnterior, ordenNueva) {
        const con = await getConnection();
        try {
            
            await beginTransaction(con);
            const res = {
                rowsAffectedOrdenUpdate: 0,
                rowsAffectedExamenesDel: 0,
                rowsAffectedExamenesAdd: 0,
                rowsAffectedDiagnosticosDel: 0,
                rowsAffectedDiagnosticosAdd: 0,
                rowsAffectedMuestrasDel: 0,
                rowsAffectedMuestrasAdd: 0,
                anychanges: false,
                estado: ordenAnterior.estado
            }

            console.log("ordenAnterior: ", ordenAnterior);
            const idsExamenesToAdd = ordenNueva.examenesIds.filter(x => !ordenAnterior.examenes.map(e=>e.idExamenes).includes(x)) || [];
            console.log("examenes a agregar", idsExamenesToAdd);
            const idsExamenesToDelete = ordenAnterior.examenes.map(e => e.idExamenes).filter(x => !ordenNueva.examenesIds.includes(x)) || [];
            console.log("examenes a borrar",idsExamenesToDelete);
            const idsDiagnosticosToAdd = ordenNueva.diagnosticosIds.filter(x => !ordenAnterior.diagnosticos.map(e=>e.idDiagnostico).includes(x)) || [];
            console.log("diagnosticos a agregar", idsDiagnosticosToAdd);
            const idsDiagnosticosToDelete = ordenAnterior.diagnosticos.map(e => e.idDiagnostico).filter(x => !ordenNueva.diagnosticosIds.includes(x)) || [];
            console.log("diagnosticos a borrar",idsDiagnosticosToDelete);
            const idsExamenesMuestrasToAdd = ordenNueva.examenesIds.filter(x => !ordenAnterior.muestras.map(e=>e.idExamenes).includes(x)) || [];
            console.log("muestras a agregar para los examenes", idsExamenesMuestrasToAdd);
            const idsExamenesMuestrasToDelete = ordenAnterior.muestras.map(e => e.idExamenes).filter(x => !ordenNueva.examenesIds.includes(x)) || [];
            console.log("muestras a borrar para los examenes",idsExamenesMuestrasToDelete);

            if (idsExamenesToDelete.length > 0) {
                for (let i = 0; i < idsExamenesToDelete.length; i++) {
                    const sqlDelEx = `DELETE FROM ordenes_examenes WHERE idExamenes = ? AND nroOrden = ?`;
                    const resDelEx = await query(sqlDelEx, [idsExamenesToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelEx.affectedRows > 0) {
                        res.rowsAffectedExamenesDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar el examen');
                    }
                }
            }

            if (idsExamenesToAdd.length > 0) {
                for (let i = 0; i < idsExamenesToAdd.length; i++) {
                    const sqlAddEx = `INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?, ?)`;
                    const resAddEx = await query(sqlAddEx, [ordenAnterior.nroOrden, idsExamenesToAdd[i]], con);
                    if (resAddEx.affectedRows > 0) {
                        res.rowsAffectedExamenesAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar el examen');
                    }
                }
            }

            if (idsDiagnosticosToDelete.length > 0) {
                for (let i = 0; i < idsDiagnosticosToDelete.length; i++) {
                    const sqlDelDiag = `DELETE FROM ordenes_diagnosticos WHERE idDiagnostico = ? AND nroOrden = ?`;
                    const resDelDiag = await query(sqlDelDiag, [idsDiagnosticosToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelDiag.affectedRows > 0) {
                        res.rowsAffectedDiagnosticosDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar el diagnostico');
                    }
                }
            }

            if (idsDiagnosticosToAdd.length > 0) {
                for (let i = 0; i < idsDiagnosticosToAdd.length; i++) {
                    const sqlAddDiag = `INSERT INTO ordenes_diagnosticos (nroOrden, idDiagnostico) VALUES (?, ?)`;
                    const resAddDiag = await query(sqlAddDiag, [ordenAnterior.nroOrden, idsDiagnosticosToAdd[i]], con);
                    if (resAddDiag.affectedRows > 0) {
                        res.rowsAffectedDiagnosticosAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar el diagnostico');
                    }
                }
            }

            if (idsExamenesMuestrasToDelete.length > 0) {
                for (let i = 0; i < idsExamenesMuestrasToDelete.length; i++) {
                    const sqlDelMue = `DELETE FROM muestras WHERE idExamenes = ? AND nroOrden = ?`;
                    const resDelMue = await query(sqlDelMue, [idsExamenesMuestrasToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelMue.affectedRows > 0) {   
                        res.rowsAffectedMuestrasDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar la muestra');
                    }
                }
            }

            if (idsExamenesMuestrasToAdd.length > 0) {
                for (let i = 0; i < idsExamenesMuestrasToAdd.length; i++) {
                    const sqlAddMue = `INSERT INTO muestras (nroOrden, idExamenes, estado, fechaCreacion, fechaModif, tipo) VALUES (?, ?, 0, NOW(), NOW(), (SELECT tipoAnalisis FROM examenes WHERE idExamenes = ?))`;
                    const resAddMue = await query(sqlAddMue, [ordenAnterior.nroOrden, idsExamenesMuestrasToAdd[i], idsExamenesMuestrasToAdd[i]], con);
                    if (resAddMue.affectedRows > 0) {
                        res.rowsAffectedMuestrasAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar la muestra');
                    }
                }
            }
            
            

            let newEstado = ordenAnterior.estado.toLowerCase();
            let muestrasPresentadas = ordenAnterior.muestras.filter(muestra => muestra.estado == 1).length;
            let muestrasTotales = ordenAnterior.muestras.length + idsExamenesMuestrasToAdd.length - idsExamenesMuestrasToDelete.length;
            let diagnosticosTotales = ordenAnterior.diagnosticos.length + idsDiagnosticosToAdd.length - idsDiagnosticosToDelete.length;
            let examenesTotales = ordenAnterior.examenes.length + idsExamenesToAdd.length - idsExamenesToDelete.length;
            console.log('muestrasPresentadas', muestrasPresentadas, 'muestrasTotales', muestrasTotales, 'diagnosticosTotales', diagnosticosTotales, 'examenesTotales', examenesTotales);
            if (ordenAnterior.paciente.idPaciente && ordenAnterior.medico.idMedico) { //ingresada
                if (diagnosticosTotales > 0 && examenesTotales > 0 && muestrasTotales == muestrasPresentadas) {
                    newEstado = 'pre-analitica';
                } else if (diagnosticosTotales <= 0 || examenesTotales <= 0){
                    newEstado = 'ingresada'
                } else {
                    newEstado = 'esperando toma de muestras';
                }
            }

            if (newEstado != ordenAnterior.estado) {
                const sqlOrden = 'UPDATE ordenes SET estado = ?, muestrasEnEspera = ? WHERE nroOrden = ?';
                const resOrden = await query(sqlOrden, [newEstado, (newEstado == 'esperando toma de muestras') ? 1 : 0, ordenAnterior.nroOrden], con);
                if (resOrden.affectedRows > 0) {
                    res.rowsAffectedOrdenUpdate++;
                    res.anychanges = true;
                } else {
                    throw new Error('No se pudo actualizar el estado de la orden');
                }
            }

            if (newEstado != ordenAnterior.estado || idsDiagnosticosToAdd.length > 0 || idsDiagnosticosToDelete.length > 0 || idsExamenesMuestrasToAdd.length > 0 || idsExamenesMuestrasToDelete.length > 0 || idsExamenesToAdd.length > 0 || idsExamenesToDelete.length > 0) {
                //si hubo cambios en la orden, se actualiza la fecha de actualizacion
                const sqlUpdate = 'UPDATE ordenes SET fechaModificacion = NOW() WHERE nroOrden = ?';
                const resUpdate = await query(sqlUpdate, [ordenAnterior.nroOrden], con);
                if (resUpdate.affectedRows > 0) {
                    res.rowsAffectedOrdenUpdate++;
                    res.anychanges = true;
                } else {
                    throw new Error('No se pudo actualizar la fecha de actualizacion de la orden');
                }
            }

            res.estado = newEstado;
            await commit(con);
            return {res};
        } catch (err) {
            console.log("Error: ", err);
            await rollback(con);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async modificarOrdenAdmin (ordenAnterior, ordenNueva) {
        const con = await getConnection();
        const res = {
            rowsAffectedOrdenUpdate: 0,
            rowsUpdatePaciente: 0,
            rowsUpdateMedico: 0,
            rowsAffectedExamenesDel: 0,
            rowsAffectedExamenesAdd: 0,
            rowsAffectedDiagnosticosDel: 0,
            rowsAffectedDiagnosticosAdd: 0,
            rowsAffectedMuestrasDel: 0,
            rowsAffectedMuestrasAdd: 0,
            anychanges: false,
            estado: ordenAnterior.estado
        }
        try {
            await beginTransaction(con);
            console.log("ordenAnterior: ", ordenAnterior);
            const idsExamenesToAdd = ordenNueva.examenesIds.filter(x => !ordenAnterior.examenes.map(e=>e.idExamenes).includes(x)) || [];
            console.log("examenes a agregar", idsExamenesToAdd);
            const idsExamenesToDelete = ordenAnterior.examenes.map(e => e.idExamenes).filter(x => !ordenNueva.examenesIds.includes(x)) || [];
            console.log("examenes a borrar",idsExamenesToDelete);
            const idsDiagnosticosToAdd = ordenNueva.diagnosticosIds.filter(x => !ordenAnterior.diagnosticos.map(e=>e.idDiagnostico).includes(x)) || [];
            console.log("diagnosticos a agregar", idsDiagnosticosToAdd);
            const idsDiagnosticosToDelete = ordenAnterior.diagnosticos.map(e => e.idDiagnostico).filter(x => !ordenNueva.diagnosticosIds.includes(x)) || [];
            console.log("diagnosticos a borrar",idsDiagnosticosToDelete);
            const idsExamenesMuestrasToAdd = ordenNueva.examenesIds.filter(x => !ordenAnterior.muestras.map(e=>e.idExamenes).includes(x)) || [];
            console.log("muestras a agregar para los examenes", idsExamenesMuestrasToAdd);
            const idsExamenesMuestrasToDelete = ordenAnterior.muestras.map(e => e.idExamenes).filter(x => !ordenNueva.examenesIds.includes(x)) || [];
            console.log("muestras a borrar para los examenes",idsExamenesMuestrasToDelete);

            if (ordenAnterior.idPaciente != ordenNueva.idPaciente) {
                const sqlPaciente = `UPDATE ordenes SET idPaciente = ? WHERE nroOrden = ?`;
                const resPaciente = await query(sqlPaciente, [ordenNueva.idPaciente, ordenAnterior.nroOrden], con);
                res.rowsUpdatePaciente = resPaciente.affectedRows;
                res.anychanges = true;
            } 
            if (ordenAnterior.idMedico != ordenNueva.idMedico) {
                const sqlMedico = `UPDATE ordenes SET idMedico = ? WHERE nroOrden = ?`;
                const resMedico = await query(sqlMedico, [ordenNueva.idMedico, ordenAnterior.nroOrden], con);
                res.rowsUpdateMedico = resMedico.affectedRows;
                res.anychanges = true;
            }

            if (idsExamenesToDelete.length > 0) {
                for (let i = 0; i < idsExamenesToDelete.length; i++) {
                    const sqlDelEx = `DELETE FROM ordenes_examenes WHERE idExamenes = ? AND nroOrden = ?`;
                    const resDelEx = await query(sqlDelEx, [idsExamenesToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelEx.affectedRows > 0) {
                        res.rowsAffectedExamenesDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar el examen');
                    }
                }
            }

            if (idsExamenesToAdd.length > 0) {
                for (let i = 0; i < idsExamenesToAdd.length; i++) {
                    const sqlAddEx = `INSERT INTO ordenes_examenes (nroOrden, idExamenes) VALUES (?, ?)`;
                    const resAddEx = await query(sqlAddEx, [ordenAnterior.nroOrden, idsExamenesToAdd[i]], con);
                    if (resAddEx.affectedRows > 0) {
                        res.rowsAffectedExamenesAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar el examen');
                    }
                }
            }

            if (idsDiagnosticosToDelete.length > 0) {
                for (let i = 0; i < idsDiagnosticosToDelete.length; i++) {
                    const sqlDelDiag = `DELETE FROM ordenes_diagnosticos WHERE idDiagnostico = ? AND nroOrden = ?`;
                    const resDelDiag = await query(sqlDelDiag, [idsDiagnosticosToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelDiag.affectedRows > 0) {
                        res.rowsAffectedDiagnosticosDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar el diagnostico');
                    }
                }
            }

            if (idsDiagnosticosToAdd.length > 0) {
                for (let i = 0; i < idsDiagnosticosToAdd.length; i++) {
                    const sqlAddDiag = `INSERT INTO ordenes_diagnosticos (nroOrden, idDiagnostico) VALUES (?, ?)`;
                    const resAddDiag = await query(sqlAddDiag, [ordenAnterior.nroOrden, idsDiagnosticosToAdd[i]], con);
                    if (resAddDiag.affectedRows > 0) {
                        res.rowsAffectedDiagnosticosAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar el diagnostico');
                    }
                }
            }

            if (idsExamenesMuestrasToDelete.length > 0) {
                for (let i = 0; i < idsExamenesMuestrasToDelete.length; i++) {
                    const sqlDelMue = `DELETE FROM muestras WHERE idExamenes = ? AND nroOrden = ?`;
                    const resDelMue = await query(sqlDelMue, [idsExamenesMuestrasToDelete[i], ordenAnterior.nroOrden], con);
                    if (resDelMue.affectedRows > 0) {   
                        res.rowsAffectedMuestrasDel++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo borrar la muestra');
                    }
                }
            }

            if (idsExamenesMuestrasToAdd.length > 0) {
                for (let i = 0; i < idsExamenesMuestrasToAdd.length; i++) {
                    const sqlAddMue = `INSERT INTO muestras (nroOrden, idExamenes, estado, fechaCreacion, fechaModif, tipo) VALUES (?, ?, 0, NOW(), NOW(), (SELECT tipoAnalisis FROM examenes WHERE idExamenes = ?))`;
                    const resAddMue = await query(sqlAddMue, [ordenAnterior.nroOrden, idsExamenesMuestrasToAdd[i], idsExamenesMuestrasToAdd[i]], con);
                    if (resAddMue.affectedRows > 0) {
                        res.rowsAffectedMuestrasAdd++;
                        res.anychanges = true;
                    } else {
                        throw new Error('No se pudo agregar la muestra');
                    }
                }
            }



            let newEstado = ordenAnterior.estado.toLowerCase();
            let muestrasPresentadas = ordenAnterior.muestras.filter(muestra => muestra.estado == 1).length;
            let muestrasTotales = ordenAnterior.muestras.length + idsExamenesMuestrasToAdd.length - idsExamenesMuestrasToDelete.length;
            let diagnosticosTotales = ordenAnterior.diagnosticos.length + idsDiagnosticosToAdd.length - idsDiagnosticosToDelete.length;
            let examenesTotales = ordenAnterior.examenes.length + idsExamenesToAdd.length - idsExamenesToDelete.length;
            console.log('muestrasPresentadas', muestrasPresentadas, 'muestrasTotales', muestrasTotales, 'diagnosticosTotales', diagnosticosTotales, 'examenesTotales', examenesTotales);
            if (ordenAnterior.paciente.idPaciente && ordenAnterior.medico.idMedico) { //ingresada
                if (diagnosticosTotales > 0 && examenesTotales > 0 && muestrasTotales == muestrasPresentadas) {
                    newEstado = 'pre-analitica';
                } else if (diagnosticosTotales <= 0 || examenesTotales <= 0){
                    newEstado = 'ingresada'
                } else {
                    newEstado = 'esperando toma de muestras';
                }
            }
            /*if (muestrasTotales > 0 && diagnosticosTotales > 0 && examenesTotales > 0 && newEstado == 'ingresada') {
                newEstado = 'esperando toma de muestras';
            }
            if (idsExamenesMuestrasToAdd.length > 0 && (ordenAnterior.diagnosticos.length > 0 || idsDiagnosticosToAdd.length > 0)){
                newEstado = 'esperando toma de muestras';
            } else if ((idsExamenesMuestrasToDelete.length == ordenAnterior.examenes.length && idsExamenesMuestrasToAdd.length == 0) 
                || (idsDiagnosticosToAdd.length == 0 && idsDiagnosticosToDelete.length == ordenAnterior.diagnosticos.length) 
                || ((ordenAnterior.examenes.length == 0 && idsExamenesMuestrasToDelete.length == 0 && idsExamenesMuestrasToAdd.length == 0) || (ordenAnterior.diagnosticos.length == 0 && idsDiagnosticosToAdd.length == 0 && idsDiagnosticosToDelete.length == 0))) {
                //si se eliminan todas las muestras(en otras palabras, se eliminan todos los examenes) y no se agrega ninguna nueva(no se agrega ningun examen), no hay muestras en espera, ni examenes. 
                //De la misma forma, si no se agrega ningun diagnostico nuevo, y se eliminan todos, no hay diagnosticos
                //Arregla: caso en que no se haya actualizado el estado anterior
                //por lo que el estado de la orden es 'ingresada'
                newEstado = 'ingresada';
            } */

            if (newEstado != ordenAnterior.estado.toLowerCase()) {
                const sqlOrden = 'UPDATE ordenes SET estado = ?, muestrasEnEspera = ? WHERE nroOrden = ?';
                const resOrden = await query(sqlOrden, [newEstado, (newEstado == 'esperando toma de muestras') ? 1 : 0, ordenAnterior.nroOrden], con);
                if (resOrden.affectedRows > 0) {
                    res.rowsAffectedOrdenUpdate++;
                    res.anychanges = true;
                } else {
                    throw new Error('No se pudo actualizar el estado de la orden');
                }
            }

            if (newEstado != ordenAnterior.estado || idsDiagnosticosToAdd.length > 0 || idsDiagnosticosToDelete.length > 0 || idsExamenesMuestrasToAdd.length > 0 || idsExamenesMuestrasToDelete.length > 0 || ordenAnterior.idPaciente != ordenNueva.idPaciente || ordenAnterior.idMedico != ordenNueva.idMedico || idsExamenesToAdd.length > 0 || idsExamenesToDelete.length > 0) {
                //si hubo cambios en la orden, se actualiza la fecha de actualizacion
                const sqlUpdate = 'UPDATE ordenes SET fechaModificacion = NOW() WHERE nroOrden = ?';
                const resUpdate = await query(sqlUpdate, [ordenAnterior.nroOrden], con);
                if (resUpdate.affectedRows > 0) {
                    res.rowsAffectedOrdenUpdate++;
                    res.anychanges = true;
                } else {
                    throw new Error('No se pudo actualizar la fecha de actualizacion de la orden');
                }
            }

            res.estado = newEstado;
            await commit(con);
            return {res};

        } catch (err) {
            console.log(err);
            await rollback(con);
            throw err;
        } finally {
            if (con) con.release();
        }
    }
}


