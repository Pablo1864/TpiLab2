import { conexion, getConnection, query } from '../mysql.conexion.mjs';

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
        const con = await getConnection();
        console.log(id);
        try {
            const sql = 'SELECT * FROM examenes WHERE idExamenes = ? AND habilitado = 1';
            /*return new Promise((resolve, reject) => {
            con.query(sql, [id], (err, res, field) => {
                if (res) {
                    resolve(res);
                }
            });})
            */

            const res = await query(sql, [id], con);
            return res;
            
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            console.log('finally: releasing connection');
            if (con) con.release();
        }
    }

    static async buscarExamenesActivosPorNombre(nombre) {
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM examenes WHERE (nombre LIKE ? OR otrosNombres LIKE ?) AND habilitado = 1';
            const res = await query(sql, ['%' + nombre + '%', '%' + nombre + '%'], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
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
            const sql = 'SELECT * FROM examenes WHERE estado = 1'; // Cambia esto según el nombre de tu tabla.

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
            const sql = 'UPDATE examenes SET nombre = ?, requerimiento = ?, horaDemora = ?, tipoAnalisis = ? WHERE idExamenes = ?';
            // Ejecuta la consulta SQL con los datos actualizados
            conexion.query(sql, [datosActualizados.nombre, datosActualizados.requerimiento, datosActualizados.horaDemora, datosActualizados.tipoAnalisis, idExamen], (err, result) => {
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
            const sql = 'UPDATE examenes SET estado = ? WHERE idExamenes = ?';
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
}
