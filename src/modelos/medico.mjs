import {conexion, query, getConnection} from "../mysql.conexion.mjs";

export class Medico {
    static async buscarMedicoPorApellido(apellido){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM medico WHERE apellido LIKE ?';
            const res = await query(sql, [`%${apellido}%`], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarMedicoPorID(id){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM medico WHERE idMedico = ?';
            const res = await query(sql, [id], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarMedicosPorEmail(email){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM medico WHERE email LIKE ?';
            const res = await query(sql, [`%${email}%`], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarMedicosPorMatricula(matricula){
        const con = await getConnection();
        try {
            const sql = 'SELECT * FROM medico WHERE matricula LIKE ?';
            const res = await query(sql, [`%${matricula}%`], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }

    static async buscarTodosMedicos(){
        const con = await getConnection();
        try{
            const sql = 'SELECT * FROM medico';
            const res = await query(sql, [], con);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            if (con) con.release();
        }
    }
}