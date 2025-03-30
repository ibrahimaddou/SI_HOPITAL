import mysql from 'mysql2'

const pool = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'2012b',
    database: 'hopital'
}).promise()  //promise pour avoir la possibilité d'utliser async

const resultat = await pool.query("SELECT * FROM test")
console.log(resultat)