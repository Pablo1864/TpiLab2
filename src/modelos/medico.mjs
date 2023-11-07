import conexion from "../mysql.conexion.mjs";

export class Medico {
    static async buscarMedicoPorApellido(apellido){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM medico WHERE apellido LIKE ?';
            conexion.query(sql, ["%"+apellido+"%"], (err, res, field) => {
                if (err){
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
    static async buscarTodosMedicos(){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM medico';
            conexion.query(sql, (err, res, field) => {
                if (err){
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}