import mysql from 'mysql';

export const conexion = mysql.createPool({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'lab'
});

export const getConnection = () => {
    return new Promise((resolve, reject) => {
        conexion.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
};

export const query = (sql, params, connection) => { //query function, pero simplificada para trabajar con promise(exactamente lo mismo que si hacerlo directamente en el metodo del modelo)
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

export const beginTransaction = (connection) => { //Función para iniciar una transacción
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const commit = (connection) => { //Función para confirmar una transacción
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const rollback = (connection) => { //Función para rechazar una transacción
    return new Promise((resolve) => {
        connection.rollback(() => {
            resolve();
        });
    });
};

//para importar luego, hagan: 'import {conexion, query, otraFuncionQueNecesiten, otraFuncion, etc || lo que sea que necesiten} from "../mysql.conexion.mjs"'
//ejemplo:
//import {getConnection, query, beginTransaction, commit, rollback} from "../mysql.conexion.mjs"
//ejemplo de uso:
/*

    vvv carga muestras en base a un array de distintos examenes para un mismo tipo de analisis y una orden
    si llegase a fallar alguna de las inserciones, se rechazaria la transacción y se le devolveria un error
    asegura una consistencia de la base de datos, es decir no va a existir el caso en que algunas inserciones se hagan y otras no
    se deben hacer todos los inserts con exito para que se confirme la transacción vvv

        static async crearMuestras(idOrden, idExamenes, tipoAnalisis){
        const con = await getConnection();
        try {
            await beginTransaction(con); //comienzo transacción
            let resp = []; //aqui guardo los resultados de cada insert(ya que pueden ser varios)
            for (const element of idExamenes) {
                resp.push(await query('INSERT INTO muestras (nroOrden, idExamenes, tipo) VALUES (?, ?, ?)', [idOrden, element, tipoAnalisis], con));
                //await query('INSERT INTO muestras (nroOrden, idExamenes, tipo) VALUES (?, ?, ?)', [idOrden, element, tipoAnalisis], con);
                //hago los inserts, si llega a fallar uno, rechazo la transacción completa
            }
            
            await commit(con); //si no llega a fallar, confirmo la transacción(A.K.A. se hacen todos los inserts)

            return resp;
        } catch (err) { //si llega a fallar alguna de las inserciones
            console.log("rollback", err);
            await rollback(con); //rechazo la transacción, ninguna inserción se efectua entonces, incluso si fue solo un elemento el que fallo durante las inserciones
            throw err;
        } finally {
            console.log('finally: releasing connection');
            con.release(); //libero la conección de vuelta al pool
        }
    }



    vvv busca examenes por ID utilizando la funcion query 'normal', es decir 
    connection.query(), y no el metodo simplificado query() vvv

    static async buscarExamenPorID(id) {
        const con = await getConnection();
        console.log(id);
        try {
            return new Promise((resolve, reject) => { //creo la promesa "manualmente"
            const sql = 'SELECT * FROM examenes WHERE idExamenes = ? AND habilitado = 1';
            con.query(sql, [id], (err, res, field) => {
                if (res) {
                    //aqui podria hacer otras cositas si se requiere
                    resolve(res);
                } else {
                    reject(err);
                }
            });
            
        })} catch (err) {
            console.error(err);
            throw err;
        } finally {
            console.log('finally: releasing connection');
            if (con) con.release();
        }
    }

    vvv lo de abajo es exactamente lo mismo, pero usando el metodo simplificado query()!! vvv

    static async buscarExamenPorID(id) {
        const con = await getConnection();
        console.log(id);
        try {
            const sql = 'SELECT * FROM examenes WHERE idExamenes = ? AND habilitado = 1';
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

*/