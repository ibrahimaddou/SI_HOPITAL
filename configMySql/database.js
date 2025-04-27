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
    //const [rows]= await pool.query("select personne.id_personne, personne.nom, personne.prenom , medecin.specialite from medecin, employe , personne where medecin.id_employe=employe.id_employe and employe.id_personne =personne.id_personne;")
    const [rows]= await pool.query(`SELECT 
    p.id_personne,
    p.nom,
    p.prenom,
    p.date_naissance,
    p.adresse,
    p.telephone,
    p.email,
    per.date_embauche,
    per.id_service,
    s.nom AS nom_service,
    m.specialite
FROM 
    Personne p
JOIN 
    Personnel per ON p.id_personne = per.id_personnel
JOIN 
    Medecin m ON per.id_personnel = m.id_medecin
LEFT JOIN
    Service s ON per.id_service = s.id_service
WHERE 
    p.type_personne = 'Personnel'
    AND per.type_personnel = 'Médecin'
ORDER BY 
    p.nom, p.prenom;`)
    return rows;
}

export async function getMedecinById(id){ // pour afficher les infos de medicin avec un son id 
    const [rows] = await pool.query(`
        SELECT 
            medecin.id_medecin,
            personne.id_personne, 
            personne.nom, 
            personne.prenom, 
            medecin.specialite 
        FROM 
            Medecin, 
            Personnel, 
            Personne 
        WHERE 
            medecin.id_medecin = ?
            AND medecin.id_medecin = Personnel.id_personnel 
            AND Personnel.id_personnel = personne.id_personne
    `, [id]);
    return rows[0];
}

// creer une personne   
export async function addMedecin(nom, prenom, adresse, telephone, email, dateEmbauche, motDePasse, username, idService, specialite) {
    // Insérer dans la table Personne
    const [resultPersonne] = await pool.query(`
        INSERT INTO Personne (nom, prenom, adresse, telephone, email, date_naissance, type_personne) 
        VALUES (?, ?, ?, ?, ?, CURDATE(), 'Personnel');
    `, [nom, prenom, adresse, telephone, email]);
    
    const idPersonne = resultPersonne.insertId;
    
    // Insérer dans la table Personnel
    await pool.query(`
        INSERT INTO Personnel (id_personnel, date_embauche, type_personnel, id_service)
        VALUES (?, ?, 'Médecin', ?);
    `, [idPersonne, dateEmbauche, idService]);
    
    // Insérer dans la table Medecin
    const [resultMedecin] = await pool.query(`
        INSERT INTO Medecin (id_medecin, specialite, mot_de_passe, username)
        VALUES (?, ?, ?, ?);
    `, [idPersonne, specialite, motDePasse]);
    
    console.log("Médecin ajouté avec succès !");
    console.log("ID Personne:", idPersonne);
    console.log("ID Médecin:", idPersonne);
    
    return resultMedecin;
}

export async function addInfirmier(nom, prenom, adresse, telephone, email, dateEmbauche, mot_de_passe, username, idService, qualification) {
    // Insérer dans la table Personne
    const [resultPersonne] = await pool.query(`
        INSERT INTO Personne (nom, prenom, adresse, telephone, email, date_naissance, type_personne) 
        VALUES (?, ?, ?, ?, ?, CURDATE(), 'Personnel');
    `, [nom, prenom, adresse, telephone, email]);
    
    const idPersonne = resultPersonne.insertId;
    
    // Insérer dans la table Personnel
    await pool.query(`
        INSERT INTO Personnel (id_personnel, date_embauche, type_personnel,  id_service)
        VALUES (?, ?, 'Infirmier', ?);
    `, [idPersonne, dateEmbauche, idService]);
    
    // Insérer dans la table Infirmier
    const [resultInfirmier] = await pool.query(`
        INSERT INTO infirmier (id_infirmier, qualification, mot_de_passe, username)
        VALUES (?, ?, ?, ?);
    `, [idPersonne, qualification, mot_de_passe, username]);
    
    console.log("Infirmier ajouté avec succès !");
    console.log("ID Personne:", idPersonne);
    console.log("ID Infirmier:", idPersonne);
    
    return resultInfirmier;
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


//list infirmier
export async function getInfirmiers() {
  const [rows] = await pool.query(`
    SELECT 
      p.id_personne,
      p.nom,
      p.prenom,
      p.date_naissance,
      p.adresse,
      p.telephone,
      p.email,
      per.date_embauche,
      per.id_service,
      s.nom AS nom_service,
      i.qualification
    FROM 
      Personne p
    JOIN 
      Personnel per ON p.id_personne = per.id_personnel
    JOIN 
      Infirmier i ON per.id_personnel = i.id_infirmier
    LEFT JOIN 
      Service s ON per.id_service = s.id_service
    WHERE 
      p.type_personne = 'Personnel' AND per.type_personnel = 'Infirmier'
    ORDER BY 
      p.nom, p.prenom;
  `);
  return rows;
}

//personnel administratif


export async function getAdministratifs() {
  const [rows] = await pool.query(`
    SELECT 
      p.id_personne,
      p.nom,
      p.prenom,
      p.date_naissance,
      p.adresse,
      p.telephone,
      p.email,
      per.date_embauche,
      per.id_service,
      s.nom AS nom_service,
      pa.poste,
      pa.est_responsable
    FROM 
      Personne p
    JOIN 
      Personnel per ON p.id_personne = per.id_personnel
    JOIN 
      Personnel_Administratif pa ON per.id_personnel = pa.id_admin
    LEFT JOIN 
      Service s ON per.id_service = s.id_service
    WHERE 
      p.type_personne = 'Personnel' AND per.type_personnel = 'Admin'
    ORDER BY 
      p.nom, p.prenom;
  `);
  return rows;
}

//list patient

export async function getPatients() {
  const [rows] = await pool.query(`
    SELECT 
      p.id_personne,
      p.nom,
      p.prenom,
      p.date_naissance,
      p.adresse,
      p.telephone,
      p.email,
      pa.antecedents_medicaux
    FROM 
      Personne p
    JOIN 
      Patient pa ON p.id_personne = pa.id_patient
    WHERE 
      p.type_personne = 'Patient'
    ORDER BY 
      p.nom, p.prenom;
  `);
  return rows;
}
//personnel nettoyage

export async function getNettoyage() {
  const [rows] = await pool.query(`
    SELECT 
      p.id_personne,
      p.nom,
      p.prenom,
      p.date_naissance,
      p.adresse,
      p.telephone,
      p.email,
      per.date_embauche,
      per.id_service,
      s.nom AS nom_service
    FROM 
      Personne p
    JOIN 
      Personnel per ON p.id_personne = per.id_personnel
    JOIN 
      Personnel_Nettoyage pn ON per.id_personnel = pn.id_nettoyage
    LEFT JOIN 
      Service s ON per.id_service = s.id_service
    WHERE 
      p.type_personne = 'Personnel' AND per.type_personnel = 'Nettoyage'
    ORDER BY 
      p.nom, p.prenom;
  `);
  return rows;
}
