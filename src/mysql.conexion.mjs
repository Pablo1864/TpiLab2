import mysql from 'mysql';

const conexion = mysql.createConnection(
    {
        user: 'root',
        host: 'localhost',
        password: '',
        database: 'labanalisis'
    }
)

conexion.connect(err => {
    if (err) {
        console.log(err)
        return;
    }    
    console.log('conectado')
})

export default conexion;