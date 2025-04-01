import mysql from 'mysql2'

const pool = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'2012b',
    database: 'hopital'
}).promise()  //promise pour avoir la possibilité d'utliser async


async function getMedecins(){
    const [rows]= await pool.query("select personne.id_personne, personne.nom, personne.prenom , medecin.specialite from medecin, employe , personne where medecin.id_employe=employe.id_employe and employe.id_personne =personne.id_personne;")
    return rows;
}
const notes = await getMedecins();
console.log(notes);