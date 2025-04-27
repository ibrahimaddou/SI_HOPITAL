import 'dotenv/config';
import mysql from 'mysql2'
import dotenv from 'dotenv';


import path from 'path';

//dotenv.config({ path: path.resolve(import.meta.url, '../.env') });



dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hopital'
}).promise()  //promise pour avoir la possibilité d'utliser async

export async function getMedecins() {
  //const [rows]= await pool.query("select personne.id_personne, personne.nom, personne.prenom , medecin.specialite from medecin, employe , personne where medecin.id_employe=employe.id_employe and employe.id_personne =personne.id_personne;")
  const [rows] = await pool.query(`SELECT 
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

export async function getMedecinById(id) { // pour afficher les infos de medicin avec un son id 
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
export async function addMedecin(nom, prenom, adresse, telephone, email, dateEmbauche, motDePasse, idService, specialite) {
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
        INSERT INTO Medecin (id_medecin, specialite, mot_de_passe)
        VALUES (?, ?, ?);
    `, [idPersonne, specialite, motDePasse]);

  console.log("Médecin ajouté avec succès !");
  console.log("ID Personne:", idPersonne);
  console.log("ID Médecin:", idPersonne);

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


export async function getLitsDisponibles() {
  const [rows] = await pool.query(`
    SELECT 
        l.id_lit,
        l.numero AS numero_lit,
        c.numero AS numero_chambre,
        c.etage,
        s.nom AS service
    FROM 
        Lit l
        INNER JOIN Chambre c ON l.id_chambre = c.id_chambre
        INNER JOIN Service s ON c.id_service = s.id_service
    WHERE 
        l.id_lit NOT IN (
            SELECT sej.id_lit 
            FROM Sejour sej 
            WHERE sej.date_sortie_reelle IS NULL
        )
    ORDER BY 
        s.nom, c.etage, c.numero, l.numero;
    `);
  return rows;
}
export async function getChambresVides() {
  const [rows] = await pool.query(`
    SELECT 
    c.id_chambre,
    c.numero AS numero_chambre,
    c.etage,
    c.capacite,
    s.nom AS service
FROM 
    Chambre c
    INNER JOIN Service s ON c.id_service = s.id_service
WHERE 
    NOT EXISTS (
        SELECT 1
        FROM Lit l
        INNER JOIN Sejour sej ON l.id_lit = sej.id_lit
        WHERE l.id_chambre = c.id_chambre
        AND sej.date_sortie_reelle IS NULL
    )
ORDER BY 
    s.nom, c.etage, c.numero;
    `);
  return rows;
}
export async function getChambresNonNettoyees() {
  const [rows] = await pool.query(`
    SELECT 
    c.id_chambre,
    c.numero AS numero_chambre,
    c.etage,
    s.nom AS service,
    MAX(n.date_nettoyage) AS dernier_nettoyage,
    MAX(sej.date_sortie_reelle) AS derniere_sortie_patient
FROM 
    Chambre c
    INNER JOIN Service s ON c.id_service = s.id_service
    LEFT JOIN Nettoyage n ON c.id_chambre = n.id_chambre
    LEFT JOIN Lit l ON c.id_chambre = l.id_chambre
    LEFT JOIN Sejour sej ON l.id_lit = sej.id_lit AND sej.date_sortie_reelle IS NOT NULL
GROUP BY 
    c.id_chambre, c.numero, c.etage, s.nom
HAVING 
    (MAX(n.date_nettoyage) IS NULL) OR 
    (MAX(sej.date_sortie_reelle) > MAX(n.date_nettoyage))
ORDER BY 
    CASE WHEN MAX(n.date_nettoyage) IS NULL THEN 0 ELSE 1 END,
    MAX(n.date_nettoyage) ASC;
    `);
  return rows;
}
export async function getPatientsRetardSortie() {
  const [rows] = await pool.query(`
    SELECT 
    p.id_patient,
    pers.nom,
    pers.prenom,
    s.id_sejour,
    s.date_arrivee,
    s.date_sortie_previsionnelle,
    s.date_sortie_reelle,
    DATEDIFF(s.date_sortie_reelle, s.date_sortie_previsionnelle) AS jours_de_retard,
    c.numero AS numero_chambre,
    l.numero AS numero_lit,
    serv.nom AS service
FROM 
    Patient p
    INNER JOIN Personne pers ON p.id_patient = pers.id_personne
    INNER JOIN Sejour s ON p.id_patient = s.id_patient
    INNER JOIN Lit l ON s.id_lit = l.id_lit
    INNER JOIN Chambre c ON l.id_chambre = c.id_chambre
    INNER JOIN Service serv ON c.id_service = serv.id_service
WHERE 
    s.date_sortie_reelle IS NOT NULL
    AND s.date_sortie_previsionnelle IS NOT NULL
    AND s.date_sortie_reelle > s.date_sortie_previsionnelle
ORDER BY 
    jours_de_retard DESC;
    `);
  return rows;
}
export async function getEtatOccupationService(idService, date) {
  const [rows] = await pool.query(`
    SELECT 
      c.id_chambre,
      c.numero AS numero_chambre,
      c.etage,
      c.capacite,
      COUNT(l.id_lit) AS total_lits,
      SUM(CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM Sejour sej 
              WHERE sej.id_lit = l.id_lit 
              AND ? BETWEEN sej.date_arrivee AND IFNULL(sej.date_sortie_reelle, '9999-12-31')
          ) THEN 1 
          ELSE 0 
      END) AS lits_occupes,
      (COUNT(l.id_lit) - SUM(CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM Sejour sej 
              WHERE sej.id_lit = l.id_lit 
              AND ? BETWEEN sej.date_arrivee AND IFNULL(sej.date_sortie_reelle, '9999-12-31')
          ) THEN 1 
          ELSE 0 
      END)) AS lits_disponibles,
      ROUND((SUM(CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM Sejour sej 
              WHERE sej.id_lit = l.id_lit 
              AND ? BETWEEN sej.date_arrivee AND IFNULL(sej.date_sortie_reelle, '9999-12-31')
          ) THEN 1 
          ELSE 0 
      END) / COUNT(l.id_lit)) * 100, 2) AS pourcentage_occupation
    FROM 
      Chambre c
      INNER JOIN Service s ON c.id_service = s.id_service
      LEFT JOIN Lit l ON c.id_chambre = l.id_chambre
    WHERE 
      s.id_service = ?
    GROUP BY 
      c.id_chambre, c.numero, c.etage, c.capacite
    ORDER BY 
      c.etage, c.numero
  `, [date, date, date, idService]);
  
  return rows;
}

//ajouter patient
export async function ajouterPatient(nom, prenom, dateNaissance, adresse, telephone, email, antecedentsMedicaux) {
  const [resultPersonne] = await pool.query(`
        INSERT INTO Personne (nom, prenom, date_naissance, adresse, telephone, email, type_personne) 
        VALUES (?, ?, ?, ?, ?, ?, 'Patient');
    `, [nom, prenom, dateNaissance, adresse, telephone, email]);
  
  const idPersonne = resultPersonne.insertId;

  const [resultPatient] = await pool.query(`
        INSERT INTO Patient (id_patient, antecedents_medicaux)
        VALUES (?, ?);
    `, [idPersonne, antecedentsMedicaux]);
  
  return resultPatient;
}
/*export async function () {
  const [rows] = await pool.query(`
    `);
  return rows;
}*/