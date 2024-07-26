import {conexion, query, getConnection} from '../mysql.conexion.mjs';

export class Diagnostico{
    
    static async buscarDiagnosticoPorId(id){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM diagnosticos WHERE idDiagnostico = ?';
            const res = await query(sql, [id], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarDiagnosticosTodos(){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM diagnosticos';
            const res = await query(sql, [], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarDiagnosticosPorNombres(nombre){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM diagnosticos WHERE nombre LIKE ? OR otrosTerminos LIKE ?';
            const res = await query(sql, [`%${nombre}%`, `%${nombre}%`], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

}