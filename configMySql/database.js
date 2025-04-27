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

export async function getDossierPatient(idPatient) {
  // 1. Antécédents médicaux du patient

  const [antecedents] = await pool.query(`
    SELECT 
      nom,
      prenom,
      date_naissance,
      antecedents_medicaux
    FROM 
      Patient P , personne PE
    WHERE 
      p.id_patient = ?
      AND PE.id_personne = ?
  `, [idPatient, idPatient]);

  // 2. Visites du patient
  const [visites] = await pool.query(`
    SELECT 
      v.id_visite,
      v.id_medecin,
      v.date_visite,
      v.examens_pratiques,
      v.commentaires
    FROM 
      visite_medicale v
    WHERE 
      v.id_patient = ?
    ORDER BY 
      v.date_visite DESC
  `, [idPatient]);

  // 3. Soins du patient
  const [soins] = await pool.query(`
    SELECT 
      s.id_soin,
      s.description
    FROM 
      soin s
    INNER JOIN 
      patient ps ON s.id_patient = ps.id_patient
    WHERE 
      ps.id_patient = ?
  `, [idPatient]);

  // 4. Séjours du patient
  const [sejours] = await pool.query(`
    SELECT 
      sej.id_sejour,
      sej.id_lit,
      sej.date_arrivee,
      sej.date_sortie_previsionnelle,
      sej.date_sortie_reelle,
      sej.raison_sejour,
      sej.id_admin_affectation
    FROM 
      sejour sej
    WHERE 
      sej.id_patient = ?
    ORDER BY 
      sej.date_arrivee DESC
  `, [idPatient]);

  // Assemblage final
  return {
    antecedents: antecedents[0] || null, // Juste un champ
    visites,
    soins,
    sejours
  };
}

export async function getMedic_patient (idPatient) {
  const [rows] = await pool.query(`
    SELECT 
          s.id_soin,
          s.description AS soin_description,
          m.id_medicament,
          m.nom AS nom_medicament,
          m.description AS description_medicament,
          m.dosage,
          ms.quantite
       FROM 
          soin s
       JOIN 
          medicament_soin ms ON s.id_soin = ms.id_soin
       JOIN 
          medicament m ON ms.id_medicament = m.id_medicament
       WHERE 
          s.id_patient = ?
       ORDER BY 
          s.id_soin ASC`,
    [idPatient]
  );
  return rows;
}

/*export async function () {
  const [rows] = await pool.query(`
    `);
  return rows;
}*/