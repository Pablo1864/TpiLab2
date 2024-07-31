import { conexion, getConnection, query, commit, rollback, beginTransaction } from '../mysql.conexion.mjs';

export class Muestra {
    static async buscarMuestrasPorNroOrden(id){
        const con = await getConnection();
            try {
                const sql = 'SELECT * FROM muestras WHERE nroOrden = ?';
                const resp = await query(sql, [id], con);
                return resp;
            } catch (err) {
                console.log(err);
                throw err;
            } finally {
                con.release();
            }
    }

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
        } catch (err) {
            console.log("rollback", err);
            await rollback(con); //rechazo la transacción, ninguna inserción se efectua entonces, incluso si fue solo un elemento el que fallo durante las inserciones
            throw err;
        } finally {
            if (con) con.release(); //libero la conección de vuelta al pool
        }
    }

    /*await beginTransaction(con); //comienzo transacción
            let resp = []; //aqui guardo los resultados de cada update(ya que pueden ser mas de un update)
            for (const idMuestra of idMuestras) {
                resp.push(await query('UPDATE muestras SET estado = ? WHERE idMuestra = ? AND nroOrden = ?', [estado, idMuestra, nroOrden], con));
                //hago los updates, si llega a fallar uno(lo cual tiraria un error), se rechaza la transacción completa
            }
            const estadoMuestrasOrden = await query('SELECT m.estado AS estadosMuestras, o.muestrasEnEspera, o.estado AS estadoOrden FROM muestras m JOIN ordenes o ON (m.nroOrden = o.nroOrden) WHERE m.nroOrden = ?', [nroOrden], con);
            console.log(estadoMuestrasOrden);

            const estadosTotalesMuestras1 = estadoMuestrasOrden.rows.map(row => row.estadosMuestras).every(element => element.estado === 1);
            const estadosTotalesMuestras0 = estadoMuestrasOrden.rows.map(row => row.estadosMuestras).every(element => element.estado === 0);
            let estadoResp = null;
            if (estadosTotalesMuestras1) {
                await query('UPDATE ordenes SET muestrasEnEspera = 0, estado = "Analítica" WHERE nroOrden = ?', [nroOrden], con);
                estadoResp = estadosTotalesMuestras1;
            } else if (estadosTotalesMuestras0) {
                await query('UPDATE ordenes SET muestrasEnEspera = 1, estado = ? WHERE nroOrden = ?', [nroOrden, estadoMuestrasOrden.rows[0].estadoOrden], con);
                estadoResp = estadosTotalesMuestras0;
            }

            await commit(con); //si no llega a fallar nada, confirmo la transacción(A.K.A. se hacen todos los inserts)  

            return {
                muestrasResp: resp,
                estadoOrden: estadoResp
            }; */
    static async actualizarEstadoMuestras(ordenAnterior, idMuestras, estado, nroOrden){
        const con = await getConnection();
        try {
            await beginTransaction(con);
            let resp = [];
            for (const idMuestra of idMuestras) {
                resp.push(await query('UPDATE muestras SET estado = ?, fechaModif = NOW() WHERE idMuestra = ? AND nroOrden = ?', [estado, idMuestra, nroOrden], con));
            }
            const estadoMuestrasOrden = await query('SELECT estado FROM muestras WHERE nroOrden = ?', [nroOrden], con);
            
            const estadosTotalesMuestras1 = estadoMuestrasOrden.every(element => element.estado === 1);
            let estadoResp = estadosTotalesMuestras1;
            if (estadosTotalesMuestras1 && ordenAnterior.diagnosticos.length > 0 && ordenAnterior.examenes.length > 0) { //si todas las muestras fueron presentadas, y hay diagnosticos y examenes, cambia a 'pre-analitica'
                await query('UPDATE ordenes SET muestrasEnEspera = 0, estado = "Pre-analitica", fechaModificacion = NOW() WHERE nroOrden = ?', [nroOrden], con);
                estadoResp = 'pre-analitica';
            } else if (estadosTotalesMuestras1 && (ordenAnterior.diagnosticos.length === 0 || ordenAnterior.examenes.length === 0)){ //else si todas las muestras fueron presentadas, y no hay diagnosticos o no hay examenes, cambia a 'ingresada'
                await query('UPDATE ordenes SET muestrasEnEspera = 0, estado = "ingresada", fechaModificacion = NOW() WHERE nroOrden = ?', [nroOrden], con);
                estadoResp = 'ingresada';
            } else { //else si faltan algunas de las muestras, cambia a 'esperando toma de muestras'
                await query('UPDATE ordenes SET muestrasEnEspera = 1, estado = "esperando toma de muestras", fechaModificacion = NOW() WHERE nroOrden = ?', [nroOrden], con);
                estadoResp = 'esperando toma de muestras';
            }

            await commit(con); //si no llega a fallar nada, confirmo la transacción(A.K.A. se hacen todos los inserts)  

            return {
                muestrasResp: resp,
                estadoOrden: estadoResp
            };
        } catch (err) {
            console.log("SOMETHING WENT WRONG, ROLLBACKING EN ACTUALIZAR MUESTRAS/ORDEN. ERROR:", err);
            await rollback(con); //rechazo la transacción, ninguna inserción se efectua entonces, incluso si fue solo un elemento el que fallo durante las inserciones
            throw err;
        } finally {
            if (con) con.release(); //libero la coneccion de vuelta al pool
        }
    }


    static async eliminarMuestras(idOrden, idMuestras){
        const con = await getConnection();
        try {
            await beginTransaction(con); //comienzo transacción
            let resp = []; //aqui guardo los resultados de cada insert(ya que pueden ser varios)
            for (const element of idMuestras) {
                resp.push(await query('UPDATE muestras SET estado = 0 WHERE nroOrden = ? AND idMuestra = ?', [idOrden, element], con));
                //hago los inserts, si llega a fallar uno, rechazo la transacción completa
            }
            
            await commit(con); //si no llega a fallar, confirmo la transacción(A.K.A. se hacen todos los inserts)  
            return resp;
        } catch (err) {
            console.log("rollback", err);
            await rollback(con); //rechazo la transacción, ninguna inserción se efectua entonces, incluso si fue solo un elemento el que fallo durante las inserciones
            throw err;
        } finally {
            if (con) con.release(); //libero la coneccion de vuelta al pool
        }
    }

}