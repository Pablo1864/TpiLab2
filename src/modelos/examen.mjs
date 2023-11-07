import conexion from '../mysql.conexion.mjs';

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
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        })
    }

    static async buscarExamenPorNombre(nombre) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM examenes WHERE (nombre LIKE ? OR otrosNombres LIKE ?) AND habilitado = 1';
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
            const sql = 'SELECT * FROM examenes'; // Cambia esto según el nombre de tu tabla.

            conexion.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
}
