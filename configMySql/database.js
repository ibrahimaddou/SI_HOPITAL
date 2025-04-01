import 'dotenv/config';
import mysql from 'mysql2'
import dotenv from 'dotenv';


import path from 'path';

//dotenv.config({ path: path.resolve(import.meta.url, '../.env') });



dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hopital'
}).promise()  //promise pour avoir la possibilité d'utliser async

export async function getMedecins(){
    const [rows]= await pool.query("select personne.id_personne, personne.nom, personne.prenom , medecin.specialite from medecin, employe , personne where medecin.id_employe=employe.id_employe and employe.id_personne =personne.id_personne;")
    return rows;
}

export async function getMedecinById(id){ // pour afficher les infos de medicin avec un son id 
    const [rows]= await pool.query(`
        select medecin.id_medecin,personne.id_personne, personne.nom, personne.prenom , medecin.specialite 
        from medecin, employe , personne 
        where medecin.id_medecin =?
        and medecin.id_employe=employe.id_employe 
        and employe.id_personne =personne.id_personne;`,[id]  
         // eviter de l'injecter dans la requete avec  ${id} pour des raisons de security SQL injection
    );
    return rows[0];
}

// creer une personne   
export async function addMedecin(nom, prenom, adresse, telephone, email, dateEmbauche, motDePasse, idService, specialite){
    // Insérer dans la table PERSONNE
    const [resultPersonne] = await pool.query(`
        INSERT INTO PERSONNE (nom, prenom, adresse, telephone, email) 
        VALUES (?, ?, ?, ?, ?);
    `, [nom, prenom, adresse, telephone, email]);
    
    const idPersonne = resultPersonne.insertId;
    
    // Insérer dans la table EMPLOYE
    const [resultEmploye] = await pool.query(`
        INSERT INTO EMPLOYE (id_personne, date_embauche, mot_de_passe, id_service)
        VALUES (?, ?, ?, ?);
    `, [idPersonne, dateEmbauche, motDePasse, idService]);
    
    const idEmploye = resultEmploye.insertId;
    
    // Insérer dans la table MEDECIN
    const [resultMedecin] = await pool.query(`
        INSERT INTO MEDECIN (id_employe, specialite)
        VALUES (?, ?);
    `, [idEmploye, specialite]);
    
    console.log("Médecin ajouté avec succès !");
    console.log("ID Personne:", idPersonne);
    console.log("ID Employé:", idEmploye);
    console.log("ID Médecin:", resultMedecin.insertId);
    
    return resultMedecin;
    

}
//test de creation medecin 
//const createmed = await addMedecin('testnom333', 'testprenomtest', 'testadresse', 'testtelephone', 'testemail','2025-04-01', 'testmotDePasse', '1', 'testspecialite');
//console.log(createmed);

//exemple le medecin qui a l' id 2
//const getmedecin = await getMedecinById(2); 
//console.log(getmedecin);

// afficher tous les medecins
//const medecins = await getMedecins();
//console.log(medecins);
