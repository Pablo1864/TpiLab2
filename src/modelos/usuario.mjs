//import { reject } from 'lodash';
import {conexion} from '../mysql.conexion.mjs';
import bcrypt from 'bcrypt';

export class Usuario {

    //verifica si esta el usuario antes de guardarlo
    static async verificarUsuario(nameUser) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM usuarios
        WHERE nombreUsuario="${nameUser}"`;
        conexion.query(sql, function (err, result) {
            const count=0;
            if (err) {
                reject(err);
            } else {
                if(result.length > 0){
               // const passUser = result[0].password;
                const user=result[0];
                // console.log('el usuario existe envioPass:   '+passUser)
                // console.log('el usuario existe envioUser:   '+JSON.stringify(user))
                resolve(user);
                 } else resolve(count)
            }
        });
    });
}

    //verifica si esta el usuario por id
    static async verificarUsuarioPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM usuarios
            WHERE idUsuario="${id}"`;
            conexion.query(sql, function (err, result) {
                const count=0;
                if (err) {
                    reject(err);
                } else {
                    if(result.length > 0){
                    const user=result[0];
                    // console.log('el usuario existe envioPass:   '+passUser)
                    // console.log('el usuario existe envioUser:   '+JSON.stringify(user))
                    resolve(user);
                     } else resolve(count)
                }
            });
        });
    }

static async crearUsuario(usuario, pass, rolId) {
   const salt = await bcrypt.genSalt(10);
   const passHash = await bcrypt.hash(pass, salt)
   
   return new Promise((resolve, reject) => {
    const rol= parseInt(rolId);
    const sql = `INSERT INTO usuarios(nombreUsuario,password,rol_id) VALUES('${usuario}','${passHash}',${rol})`;
            conexion.query(sql, function (err, result){
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
});
}

static async login(pass,passHash){
  const comparacion = await bcrypt.compare(pass, passHash)
  return comparacion
}
}