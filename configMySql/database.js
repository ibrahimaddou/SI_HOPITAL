import mysql from 'mysql2'
import dotenv from 'dotenv';

dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise()  //promise pour avoir la possibilité d'utliser async


async function getMedecins(){
    const [rows]= await pool.query("select personne.id_personne, personne.nom, personne.prenom , medecin.specialite from medecin, employe , personne where medecin.id_employe=employe.id_employe and employe.id_personne =personne.id_personne;")
    return rows;
}

async function getMedecinById(id){ // pour afficher les infos de medicin avec un son id 
    const [rows]= await pool.query(`
        select medecin.id_medecin,personne.id_personne, personne.nom, personne.prenom , medecin.specialite 
        from medecin, employe , personne 
        where medecin.id_medecin =?
        and medecin.id_employe=employe.id_employe 
        and employe.id_personne =personne.id_personne;`,[id]  
         // eviter de l'injecter dans la requete avec  ${id} pour des raisons de security SQL injection
    );
    return rows;
}

const getmedecin = await getMedecinById(2); //exemple le medecin qui a l' id 2
console.log(getmedecin);

//const medecins = await getMedecins();
//console.log(medecin);
