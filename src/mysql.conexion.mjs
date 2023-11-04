import mysql from 'mysql';

const conexion = mysql.createPool({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'lab'
});



export default conexion;
