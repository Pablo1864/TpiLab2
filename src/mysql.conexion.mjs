import mysql from 'mysql';

const conectar = mysql.createPool({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'lab'
});



export default conectar;
