import { conexion } from '../mysql.conexion.mjs';

export class Examen {


    static async buscarMuestrasNecesariasPorNroOrden(idOrden) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT tipoAnalisis FROM examenes JOIN ordenes_examenes ON (examenes.idExamenes = ordenes_examenes.idExamenes) WHERE ordenes_examenes.nroOrden = ? GROUP BY tipoAnalisis;';
            conexion.query(sql, [idOrden], (err, res, field) => {
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    static async buscarExamenesActivo() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM examenes WHERE habilitado = 1';
            conexion.query(sql, (err, res, field) => {
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    static async buscarExamenPorID(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM examenes WHERE idExamenes = ? AND habilitado = 1';
            conexion.query(sql, [id], (err, res, field) => {
                if (err) {
                    console.error('Error al buscar el examen por ID:', err);
                    reject(err);
                } else {
                    console.log('Datos del examen encontrado:', res);
                    resolve(res);
                }
            });
        });
    }


    static async buscarExamenPorNombre(nombre) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM examenes WHERE (nombre LIKE ? OR otrosNombres LIKE ?) AND estado = 1';
            conexion.query(sql, ['%' + nombre + '%', '%' + nombre + '%'], (err, res, field) => {
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    //Trae un join entre ordenes y examenes por nroOrden 
    static async buscarExamenxOrdenPorIdOrden(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ordenes_examenes NATURAL JOIN examenes WHERE nroOrden=${id}`;
            conexion.query(sql, (err, res, field) => {
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            })
        })
    }

    static async insertarExamen(nuevoExamen, callback) {
        conexion.query('INSERT INTO examenes SET ?', nuevoExamen, (error, results, fields) => {
            if (error) {
                console.error('Error al insertar el examen:', error);
            } else {
                console.log('Examen insertado con éxito');
            }
            callback(error, results);
        });
    };

    static async obtenerTodosLosExamenes() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM examenes WHERE habilitado = 1'; // Cambia esto según el nombre de tu tabla.

            conexion.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static async actualizarExamen(idExamen, datosActualizados) {
        return new Promise((resolve, reject) => {
            // Construye la consulta SQL para actualizar el examen
            const sql = 'UPDATE examenes SET nombre = ?, requerimiento = ?, diasDemora = ?, tipoAnalisis = ? WHERE idExamenes = ?';
            // Ejecuta la consulta SQL con los datos actualizados
            conexion.query(sql, [datosActualizados.nombre, datosActualizados.requerimiento, datosActualizados.diasDemora, datosActualizados.tipoAnalisis, idExamen], (err, result) => {
                if (err) {
                    console.error('Error al actualizar el examen:', err);
                    reject(err);
                } else {
                    console.log('Examen actualizado con éxito');
                    resolve(result);
                }
            });
        });
    }

    static async actualizarEstadoExamen(idExamen, nuevoEstado) {
        return new Promise((resolve, reject) => {
            // Construye la consulta SQL para actualizar el estado del examen
            const sql = 'UPDATE examenes SET habilitado = ? WHERE idExamenes = ?';
            // Ejecuta la consulta SQL con el nuevo estado y el ID del examen
            conexion.query(sql, [nuevoEstado, idExamen], (err, result) => {
                if (err) {
                    console.error('Error al actualizar el estado del examen:', err);
                    reject(err);
                } else {
                    console.log('Estado del examen actualizado con éxito');
                    resolve(result);
                }
            });
        });
    }





    static async obtenerOrdenesAnalitica() { //rol bioquimico
        return new Promise((resolve, reject) => {
            const query = `
                SELECT o.nroOrden, p.nombre AS nombrePaciente, p.apellido AS apellidoPaciente, o.fechaCreacion, o.estado 
                FROM ordenes o
                JOIN pacientes p ON o.idPaciente = p.idPaciente
                WHERE o.estado IN ('Analítica', 'Pre informe', 'Para Validar', 'informada')
            `;
            conexion.query(query, (err, res) => {
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
                SELECT o.nroOrden, p.nombre AS nombrePaciente, p.apellido AS apellidoPaciente, p.sexo, 
                       TIMESTAMPDIFF(YEAR, p.fechaNacimiento, CURDATE()) AS edad, o.fechaCreacion, o.estado AS estadoOrden, 
                       e.idExamenes AS idExamen, e.nombre AS nombreExamen, e.requerimiento, e.diasDemora, e.tipoAnalisis,
                       m.idMuestra, m.estado AS estadoMuestra
                FROM ordenes o
                JOIN pacientes p ON o.idPaciente = p.idPaciente
                JOIN muestras m ON m.nroOrden = o.nroOrden
                JOIN examenes e ON e.idExamenes = m.idExamenes
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
                            sexo: res[0].sexo,
                            edad: res[0].edad !== null ? res[0].edad : 'Fecha de nacimiento no proporcionada',
                            fechaCreacion: res[0].fechaCreacion,
                            estado: res[0].estadoOrden,
                            examenes: res.map(row => ({
                                idExamen: row.idExamen,
                                nombre: row.nombreExamen,
                                requerimiento: row.requerimiento,
                                diasDemora: row.diasDemora,
                                tipoAnalisis: row.tipoAnalisis,
                                idMuestra: row.idMuestra,
                                estadoMuestra: row.estadoMuestra
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


    static async obtenerDeterminantesPorIdExamen(idExamen) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idDeterminantes, nombre, unidadMedida FROM determinantes WHERE idExamenes = ? AND estado = 1';
            conexion.query(sql, [idExamen], (err, res) => {
                if (err) {
                    console.error('Error al obtener los determinantes:', err);
                    reject(err);
                } else {
                    console.log('Determinantes obtenidos:', res);
                    resolve(res);
                }
            });
        });
    }

    static async obtenerValoresReferencias(idDeterminante, edad, genero) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT idValorReferencias, valorMin, valorMax, edadMin, edadMax, sexo
                FROM valorreferencias
                WHERE idDeterminantes = ?
                  AND edadMin <= ?
                  AND edadMax >= ?
                  AND (sexo = ? OR sexo = 'Ambos')
            `;
            conexion.query(sql, [idDeterminante, edad, edad, genero], (err, res) => {
                if (err) {
                    console.error('Error al obtener los valores de referencia:', err);
                    reject(err);
                } else {
                    console.log('Valores de referencia obtenidos:', res);
                    resolve(res);
                }
            });
        });
    }


    static async insertarResultado(nuevoResultado, actualizarEstado, callback) {
        const sqlInsert = 'INSERT INTO resultados SET ?';
        const sqlUpdateMuestra = 'UPDATE muestras SET estado = 0 WHERE nroOrden = ? AND idExamenes = ?';
        const sqlUpdateOrdenPreInforme = 'UPDATE ordenes SET estado = "Pre informe" WHERE nroOrden = ?';
        const sqlCheckMuestras = 'SELECT COUNT(*) AS muestrasPendientes FROM muestras WHERE nroOrden = ? AND estado != 0';
        const sqlUpdateOrdenParaValidar = 'UPDATE ordenes SET estado = "Para Validar" WHERE nroOrden = ?';

        conexion.query(sqlInsert, nuevoResultado, (error, results) => {
            if (error) {
                console.error('Error al insertar el resultado:', error);
                return callback(error);
            }

            conexion.query(sqlUpdateMuestra, [actualizarEstado.nroOrden, actualizarEstado.idExamen], (err, resUpdate) => {
                if (err) {
                    console.error('Error al actualizar el estado de la muestra:', err);
                    return callback(err);
                }

                conexion.query(sqlUpdateOrdenPreInforme, [actualizarEstado.nroOrden], (err, resUpdate) => {
                    if (err) {
                        console.error('Error al actualizar el estado de la orden a "Pre informe":', err);
                        return callback(err);
                    }

                    // Verificar si todas las muestras de la orden tienen estado 0
                    conexion.query(sqlCheckMuestras, [actualizarEstado.nroOrden], (err, resCheck) => {
                        if (err) {
                            console.error('Error al verificar el estado de las muestras:', err);
                            return callback(err);
                        }

                        const muestrasPendientes = resCheck[0].muestrasPendientes;




                        if (muestrasPendientes === 0) {
                            // Todas las muestras están en estado 0, actualizar el estado de la orden a "Para Validar"
                            conexion.query(sqlUpdateOrdenParaValidar, [actualizarEstado.nroOrden], (err, resUpdate) => {
                                if (err) {
                                    console.error('Error al actualizar el estado de la orden a "Para Validar":', err);
                                    return callback(err);
                                }

                                console.log('Resultado insertado y estado actualizado con éxito a "Para Validar"');
                                callback(null, results);
                            });
                        } else {
                            console.log('Resultado insertado y estado actualizado con éxito a "Pre informe"');
                            callback(null, results);
                        }
                    });
                });
            });
        });
    }
    static async obtenerResultadosPorOrden(idMuestra) {
        return new Promise((resolve, reject) => {
            const sql = `
            SELECT d.nombre AS determinante, d.unidadMedida, r.valor, MIN(vr.valorMin) AS valorMin, MAX(vr.valorMax) AS valorMax
            FROM resultados r
            JOIN determinantes d ON r.idDeterminante = d.idDeterminantes
            JOIN valorreferencias vr ON d.idDeterminantes = vr.idDeterminantes
            JOIN muestras m ON r.idMuestra = m.idMuestra
            JOIN ordenes o ON m.nroOrden = o.nroOrden
            WHERE r.idMuestra = ? AND o.estado != 'esperando toma de muestra'
            GROUP BY d.nombre, d.unidadMedida, r.valor
            `;
            conexion.query(sql, [idMuestra], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });

        });


    }
    static async agregarDeterminantes(nuevosDeterminantes, idExamen) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO Determinantes (nombre, unidadMedida, idExamenes) VALUES ?
            `;

            const values = nuevosDeterminantes.map(det => [det.nombre, det.unidadMedida, idExamen]);

            console.log('Valores a insertar:', values); // Log para verificar los datos a insertar

            conexion.query(sql, [values], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
    static async agregarValorReferencia(idDeterminante, valorReferencia) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO valorreferencias (idDeterminantes, valorMin, valorMax, edadMin, edadMax, sexo) VALUES (?, ?, ?, ?, ?, ?)';
            const valores = [idDeterminante, valorReferencia.valorMin, valorReferencia.valorMax, valorReferencia.edadMin, valorReferencia.edadMax, valorReferencia.sexo];

            conexion.query(sql, valores, (err, res) => {
                if (err) {
                    console.error('Error al agregar valor de referencia:', err);
                    reject(err);
                } else {
                    console.log('Valor de referencia agregado con éxito:', res);
                    resolve(res);
                }
            });
        });
    }
    static async obtenerValoresReferenciaPorIdDeterminante(idDeterminante) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT valorMin, valorMax, edadMin, edadMax, sexo
                FROM valorreferencias
                WHERE idDeterminantes = ?
            `;
            conexion.query(sql, [idDeterminante], (err, res) => {
                if (err) {
                    console.error('Error al obtener los valores de referencia:', err);
                    reject(err);
                } else {
                    console.log('Valores de referencia obtenidos:', res);
                    resolve(res);
                }
            });
        });
    }
    static async actualizarDeterminantes(determinantesActualizados) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE Determinantes
                SET nombre = ?, unidadMedida = ?
                WHERE idDeterminantes = ?
            `;

            const promises = determinantesActualizados.map(det => {
                return new Promise((resolve, reject) => {
                    conexion.query(sql, [det.nombre, det.unidadMedida, det.idDeterminante], (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    });
                });
            });

            Promise.all(promises)
                .then(results => resolve(results))
                .catch(err => reject(err));
        });
    }



    static async eliminarDeterminante(idDeterminante, nuevoEstado) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE determinantes SET estado = ? WHERE idDeterminantes = ?';
            conexion.query(sql, [nuevoEstado, idDeterminante], (err, result) => {
                if (err) {
                    console.error('Error al actualizar el estado del examen:', err);
                    reject(err);
                } else {
                    console.log('Estado del examen actualizado con éxito');
                    resolve(result);
                }
            });
        });
    }

    static async validarResultado(idMuestra) {
        return new Promise((resolve, reject) => {
            const queryActualizarMuestra = `
                UPDATE muestras
                SET informada = 'sí',
                    
                    fechaModif = NOW()
                WHERE idMuestra = ?;
            `;

            conexion.query(queryActualizarMuestra, [idMuestra], (error, results) => {
                if (error) {
                    console.error('Error al validar el resultado:', error);
                    return reject('Hubo un problema al validar los resultados.');
                }

                const queryVerificarMuestras = `
                    SELECT COUNT(*) as total, SUM(informada = 'sí') as informadas
                    FROM muestras
                    WHERE nroOrden = (SELECT nroOrden FROM muestras WHERE idMuestra = ?)
                `;

                conexion.query(queryVerificarMuestras, [idMuestra], (error, results) => {
                    if (error) {
                        console.error('Error al verificar las muestras:', error);
                        return reject('Hubo un problema al verificar las muestras.');
                    }

                    const { total, informadas } = results[0];

                    if (total === informadas) {
                        const queryActualizarOrden = `
                            UPDATE ordenes
                            SET estado = 'informada'
                            WHERE nroOrden = (SELECT nroOrden FROM muestras WHERE idMuestra = ?);
                        `;

                        conexion.query(queryActualizarOrden, [idMuestra], (error, results) => {
                            if (error) {
                                console.error('Error al actualizar el estado de la orden:', error);
                                return reject('Hubo un problema al actualizar el estado de la orden.');
                            }
                            resolve('Resultados validados y orden actualizada exitosamente.');
                        });
                    } else {
                        resolve('Resultados validados exitosamente.');
                    }
                });
            });
        });
    }



    static async obtenerResultados(nroOrden) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    o.nroOrden, 
                    p.nombre AS nombrePaciente, 
                    p.apellido AS apellidoPaciente, 
                    p.sexo,
                    TIMESTAMPDIFF(YEAR, STR_TO_DATE(p.fechaNacimiento, '%Y-%m-%d'), CURDATE()) AS edad, 
                    o.fechaCreacion, 
                    o.estado,
                    e.idExamenes AS idExamenes, 
                    e.nombre AS nombreExamen, 
                    e.requerimiento, 
                    e.diasDemora, 
                    e.tipoAnalisis,
                    d.nombre AS determinante, 
                    d.unidadMedida, 
                    r.valor, 
                    MIN(vr.valorMin) AS valorMin, 
                    MAX(vr.valorMax) AS valorMax,
                    med.nombre AS nombreMedico,
                    med.apellido AS apellidoMedico
                FROM 
                    ordenes o
                JOIN 
                    pacientes p ON o.idPaciente = p.idPaciente
                JOIN 
                    medico med ON o.idMedico = med.idMedico
                JOIN 
                    muestras m ON o.nroOrden = m.nroOrden
                JOIN 
                    examenes e ON m.idExamenes = e.idExamenes
                JOIN 
                    resultados r ON m.idMuestra = r.idMuestra
                JOIN 
                    determinantes d ON r.idDeterminante = d.idDeterminantes
                JOIN 
                    valorreferencias vr ON d.idDeterminantes = vr.idDeterminantes
                WHERE 
                    o.nroOrden = ?
                GROUP BY 
                    o.nroOrden, 
                    p.nombre, 
                    p.apellido, 
                    p.sexo, 
                    edad, 
                    o.fechaCreacion, 
                    o.estado, 
                    e.idExamenes, 
                    e.nombre, 
                    e.requerimiento, 
                    e.diasDemora, 
                    e.tipoAnalisis, 
                    d.nombre, 
                    d.unidadMedida, 
                    r.valor, 
                    med.nombre, 
                    med.apellido
                LIMIT 0, 25;
            `;
            conexion.query(sql, [nroOrden], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const orden = {
                        nroOrden: res[0].nroOrden,
                        nombrePaciente: res[0].nombrePaciente,
                        apellidoPaciente: res[0].apellidoPaciente,
                        sexo: res[0].sexo,
                        edad: res[0].edad,
                        fechaCreacion: res[0].fechaCreacion,
                        nombreMedico: res[0].nombreMedico,
                        apellidoMedico: res[0].apellidoMedico,
                        examenes: []
                    };

                    const examenesMap = new Map();

                    res.forEach(row => {
                        if (!examenesMap.has(row.idExamenes)) {
                            examenesMap.set(row.idExamenes, {
                                nombreExamen: row.nombreExamen,
                                determinantes: []
                            });
                        }

                        const examen = examenesMap.get(row.idExamenes);
                        examen.determinantes.push({
                            nombre: row.determinante,
                            unidadMedida: row.unidadMedida,
                            valor: row.valor,
                            valorMin: row.valorMin,
                            valorMax: row.valorMax
                        });
                    });

                    orden.examenes = Array.from(examenesMap.values());

                    resolve(orden);
                }
            });
        });
    }


}














