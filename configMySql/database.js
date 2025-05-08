import 'dotenv/config';
import mysql from 'mysql2'
import dotenv from 'dotenv';


import path from 'path';

//dotenv.config({ path: path.resolve(import.meta.url, '../.env') });



dotenv.config()

export const pool = mysql.createPool({
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
    const username = (prenom.charAt(0) + nom).toLowerCase(); 
  // Insérer dans la table Medecin
  const [resultMedecin] = await pool.query(`
    INSERT INTO Medecin (id_medecin, specialite, mot_de_passe, username)
    VALUES (?, ?, ?, ?);
`, [idPersonne, specialite, motDePasse, username]);

 // console.log("Médecin ajouté avec succès !");
  //console.log("ID Personne:", idPersonne);
  //console.log("ID Médecin:", idPersonne);

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
//ajouter admin
export async function ajouterPersonnelAdministratif(
  nom, 
  prenom, 
  adresse, 
  telephone, 
  email, 
  dateEmbauche, 
  poste, 
  motDePasse, 
  idService, 
  estResponsable = false) 
{
  
  const [resultPersonne] = await pool.query(`
    INSERT INTO Personne (nom, prenom, adresse, telephone, email, date_naissance, type_personne) 
    VALUES (?, ?, ?, ?, ?, CURDATE(), 'Personnel');
  `, [nom, prenom, adresse, telephone, email]);

  const idPersonne = resultPersonne.insertId;

  await pool.query(`
    INSERT INTO Personnel (id_personnel, date_embauche, type_personnel, id_service)
    VALUES (?, ?, 'Admin', ?);
  `, [idPersonne, dateEmbauche, idService]);

  const username = (prenom.charAt(0) + nom).toLowerCase();
  const [resultAdmin] = await pool.query(`
    INSERT INTO Personnel_Administratif (id_admin, poste, username, mot_de_passe, est_responsable)
    VALUES (?, ?, ?, ?, ?);
  `, [idPersonne, poste, username, motDePasse, estResponsable ? 1 : 0]);

  return {
    id: idPersonne,
    nom,
    prenom,
    adresse,
    telephone,
    email,
    dateEmbauche,
    poste,
    username,
    idService,
    estResponsable
  };
}

//list patient

export async function getPatients() {
  const [rows] = await pool.query(`
    SELECT
      p.id_personne,
      pa.id_patient,
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
export async function getPatientById(patientId) {
  const [rows] = await pool.query(`
    SELECT
      p.id_personne,
      pa.id_patient,
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
      AND pa.id_patient = ?
    ORDER BY
      p.nom, p.prenom;
  `, [patientId]);
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
export async function getLitsDisponiblesById(id_chambre) {
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
        AND c.id_chambre = ?
    ORDER BY
        l.numero;
    `, [id_chambre]);
  
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
/**
 * Fonction pour ajouter un patient avec vérification qu'il n'est pas déjà membre du personnel
 * Vérifie uniquement par ID (lors de la création en base de données)
 */
export async function ajouterPatient(nom, prenom, dateNaissance, adresse, telephone, email, antecedentsMedicaux) {
  try {
    // Démarrer une transaction
    await pool.query('START TRANSACTION');

    // Si on arrive ici, on peut procéder à l'ajout
    // Insérer dans la table Personne
    const [insertPersonneResult] = await pool.query(
      "INSERT INTO Personne (nom, prenom, date_naissance, adresse, telephone, email, type_personne) VALUES (?, ?, ?, ?, ?, ?, 'Patient')",
      [
        nom,
        prenom,
        dateNaissance,
        adresse || null,
        telephone || null,
        email || null
      ]
    );
    
    const personneId = insertPersonneResult.insertId;
    
    // Vérifier si l'ID est déjà utilisé dans la table Personnel
    const [existingPersonnel] = await pool.query(
      "SELECT id_personnel FROM Personnel WHERE id_personnel = ?",
      [personneId]
    );
    
    if (existingPersonnel.length > 0) {
      throw new Error("Cette personne est déjà enregistrée comme membre du personnel et ne peut pas être ajoutée comme patient");
    }

    // Insérer dans la table Patient
    await pool.query(
      "INSERT INTO Patient (id_patient, antecedents_medicaux) VALUES (?, ?)",
      [personneId, antecedentsMedicaux || null]
    );
    
    // Valider la transaction
    await pool.query('COMMIT');
    
    // Récupérer le patient complet pour le retourner
    const [patientComplet] = await pool.query(
      `SELECT p.id_personne as id_patient, p.nom, p.prenom, p.date_naissance, 
              p.adresse, p.telephone, p.email, pa.antecedents_medicaux 
       FROM Personne p 
       JOIN Patient pa ON p.id_personne = pa.id_patient 
       WHERE p.id_personne = ?`,
      [personneId]
    );
    
    return patientComplet[0];
    
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await pool.query('ROLLBACK');
    throw error;
  }
}

//ajouter personnel de nettoyage
export async function ajouterPersonnelNettoyage(
  nom, 
  prenom, 
  adresse, 
  telephone, 
  email, 
  dateEmbauche, 
  idService
) {
  const [resultPersonne] = await pool.query(`
    INSERT INTO Personne (nom, prenom, adresse, telephone, email, date_naissance, type_personne) 
    VALUES (?, ?, ?, ?, ?, CURDATE(), 'Personnel');
  `, [nom, prenom, adresse, telephone, email]);

  const idPersonne = resultPersonne.insertId;
  await pool.query(`
    INSERT INTO Personnel (id_personnel, date_embauche, type_personnel, id_service)
    VALUES (?, ?, 'Nettoyage', ?);
  `, [idPersonne, dateEmbauche, idService]);

  const [resultNettoyage] = await pool.query(`
    INSERT INTO Personnel_Nettoyage (id_nettoyage)
    VALUES (?);
  `, [idPersonne]);

  return resultNettoyage;
}
//pour modifier la date de sortie d'un patient
export async function getSejours(req, res){
  const [rows] = await pool.query(`
    SELECT * 
    FROM Sejour
    `);
  return rows;
}
export async function modifierDateSortiePatient(req, res) {
  const idSejour = req.params.idSejour;
  const { date_sortie_reelle } = req.body;
    if (!date_sortie_reelle) {
    return res.status(400).json({ 
      success: false, 
      message: "La date de sortie réelle est requise" 
    });
  }
  
  try {
    // Vérif  si séjour existe
    const [sejour] = await pool.query(
      "SELECT * FROM Sejour WHERE id_sejour = ?",
      [idSejour]
    );
    
    if (sejour.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Séjour non trouvé" 
      });
    }
    
    // MAJ de la date de sortie réelle
    await pool.query(
      "UPDATE Sejour SET date_sortie_reelle = ? WHERE id_sejour = ?",
      [date_sortie_reelle, idSejour]
    );
    res.status(200).json({ 
      success: true, 
      message: "date de sortie mise à jour avec succès" 
    });
    
  } catch (error) {
    console.error("Erreur lors de la modification de la date de sortie:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la modification de la date de sortie",
      error: error.message 
    });
  }
}

//pour ajouter un infirmier
export async function ajouterInfirmier(
  nom, 
  prenom, 
  adresse, 
  telephone, 
  email, 
  dateEmbauche, 
  qualification,
  username, 
  motDePasse, 
  idService
) {
  const [resultPersonne] = await pool.query(`
    INSERT INTO Personne (nom, prenom, adresse, telephone, email, date_naissance, type_personne) 
    VALUES (?, ?, ?, ?, ?, CURDATE(), 'Personnel');
  `, [nom, prenom, adresse, telephone, email]);

  const idPersonne = resultPersonne.insertId;

  await pool.query(`
    INSERT INTO Personnel (id_personnel, date_embauche, type_personnel, id_service)
    VALUES (?, ?, 'Infirmier', ?);
  `, [idPersonne, dateEmbauche, idService]);

  const [resultInfirmier] = await pool.query(`
    INSERT INTO Infirmier (id_infirmier, qualification, username, mot_de_passe)
    VALUES (?, ?, ?, ?);
  `, [idPersonne, qualification, username, motDePasse]);

  return resultInfirmier;
}
// ajout d'un séjour
export async function ajouterSejour(
  idPatient,
  idLit,
  dateArrivee,
  dateSortiePrevisionnelle,
  raisonSejour,
  idAdminAffectation
) {
  const [litOccupe] = await pool.query(`
    SELECT * FROM Sejour 
    WHERE id_lit = ? 
    AND (date_sortie_reelle IS NULL OR date_sortie_reelle > ?)
  `, [idLit, dateArrivee]);

  if (litOccupe.length > 0) {
    throw new Error('Ce lit est déjà occupé pour la période demandée');
  }

  // insertion du nv séjour
  const [resultSejour] = await pool.query(`
    INSERT INTO Sejour (
      id_patient, 
      id_lit, 
      date_arrivee, 
      date_sortie_previsionnelle, 
      raison_sejour, 
      id_admin_affectation
    ) 
    VALUES (?, ?, ?, ?, ?, ?);
  `, [
    idPatient,
    idLit,
    dateArrivee,
    dateSortiePrevisionnelle,
    raisonSejour,
    idAdminAffectation
  ]);

  return resultSejour;
}
// affichage des services
export async function getServices() {
  
    const [services] = await pool.query(`
      SELECT 
        s.id_service,
        s.nom,
        s.etage,
        pa.id_admin AS id_responsable_admin,
        CONCAT(p_admin.prenom, ' ', p_admin.nom) AS nom_responsable_admin,
        m.id_medecin AS id_medecin_referent,
        CONCAT(p_med.prenom, ' ', p_med.nom) AS nom_medecin_referent,
        m.specialite AS specialite_medecin,
        (SELECT COUNT(*) FROM Chambre c WHERE c.id_service = s.id_service) AS nombre_chambres
      FROM Service s
      LEFT JOIN Personnel_Administratif pa ON s.id_responsable_admin = pa.id_admin
      LEFT JOIN Personnel pa_pers ON pa.id_admin = pa_pers.id_personnel
      LEFT JOIN Personne p_admin ON pa_pers.id_personnel = p_admin.id_personne
      LEFT JOIN Medecin m ON s.id_medecin_referent = m.id_medecin
      LEFT JOIN Personnel m_pers ON m.id_medecin = m_pers.id_personnel
      LEFT JOIN Personne p_med ON m_pers.id_personnel = p_med.id_personne
      ORDER BY s.nom ASC
    `);

    return services;
}
//chambres d'un service spécifique
export async function getChambresParService(idService) {
  try {
    const [serviceExiste] = await pool.query(`
      SELECT id_service, nom FROM Service WHERE id_service = ?
    `, [idService]);
        const nomService = serviceExiste[0].nom;

        const [chambres] = await pool.query(`
      SELECT 
        c.id_chambre,
        c.numero,
        c.etage,
        c.capacite,
        ? AS nom_service,
        (
          SELECT COUNT(*) 
          FROM Lit l 
          WHERE l.id_chambre = c.id_chambre
        ) AS nombre_lits_total,
        (
          SELECT COUNT(*) 
          FROM Lit l 
          JOIN Sejour s ON l.id_lit = s.id_lit 
          WHERE l.id_chambre = c.id_chambre AND s.date_sortie_reelle IS NULL
        ) AS nombre_lits_occupes
      FROM Chambre c
      WHERE c.id_service = ?
      ORDER BY c.numero
    `, [nomService, idService]);
        const chambresAvecLitsDisponibles = chambres.map(chambre => {
      return {
        ...chambre,
        nombre_lits_disponibles: chambre.nombre_lits_total - chambre.nombre_lits_occupes
      };
    });
    
    return chambresAvecLitsDisponibles;
  } catch (error) {
    console.error("Erreur lors de la récupération des chambres du service:", error);
    throw error;
  }
}

export async function getLitsDispPchambre(idChambre) {
  const query = `
    SELECT id_lit, id_chambre, numero
    FROM Lit
    WHERE id_chambre = ? and id_lit NOT IN ( select id_lit from Sejour where date_sortie_reelle IS NULL)
  `;
  const [rows] = await pool.query(query, [idChambre]);
  return rows;
}
// afficher les med
export async function getMedicaments() {
  const [medicaments] = await pool.query(`
    SELECT 
      id_medicament,
      nom,
      description,
      dosage
    FROM 
      Medicament
    ORDER BY 
      nom ASC;
  `);
  return medicaments;
}
//les chambres a nett
export async function getChambresANettoyer() {
  const [chambres] = await pool.query(`
    SELECT 
      c.id_chambre,
      c.numero,
      c.etage,
      c.capacite,
      s.nom AS nom_service,
      s.id_service,
      MAX(sej.date_sortie_reelle) AS derniere_sortie,
      MAX(n.date_nettoyage) AS dernier_nettoyage,
      CASE
        WHEN MAX(n.date_nettoyage) IS NULL THEN 'urgente'
        WHEN MAX(sej.date_sortie_reelle) > MAX(n.date_nettoyage) THEN
          CASE
            WHEN DATEDIFF(CURDATE(), MAX(sej.date_sortie_reelle)) > 3 THEN 'urgente'
            ELSE 'haute'
          END
        ELSE 'normale'
      END AS priorite
    FROM 
      Chambre c
    JOIN 
      Service s ON c.id_service = s.id_service
    JOIN 
      Lit l ON l.id_chambre = c.id_chambre
    JOIN 
      Sejour sej ON sej.id_lit = l.id_lit AND sej.date_sortie_reelle IS NOT NULL
    LEFT JOIN 
      Nettoyage n ON n.id_chambre = c.id_chambre
    GROUP BY 
      c.id_chambre
    HAVING 
      MAX(n.date_nettoyage) IS NULL OR MAX(sej.date_sortie_reelle) > MAX(n.date_nettoyage)
    ORDER BY 
      priorite ASC,
      derniere_sortie DESC;
  `);
  
  return chambres;
}
//ajout d un nettoyage
export async function enregistrerNettoyage(idChambre, idPersonnelNettoyage, dateNettoyage) {
  try {
    // Vérification de la chambre
    const [chambreExiste] = await pool.query(
      "SELECT id_chambre FROM Chambre WHERE id_chambre = ?", 
      [idChambre]
    );
    
    if (chambreExiste.length === 0) {
      throw new Error(`chambre avec l'id ${idChambre} existe pas`);
    }
    
     // Vérification du personnel de nettoyage
    const [personnelExiste] = await pool.query(
      "SELECT id_nettoyage FROM Personnel_Nettoyage WHERE id_nettoyage = ?", 
      [idPersonnelNettoyage]
    );
    
    if (personnelExiste.length === 0) {
      throw new Error(`personnel de nettoyage avec l'id ${idPersonnelNettoyage} existe pas`);
    }
    
    const [result] = await pool.query(`
      INSERT INTO Nettoyage (
        id_chambre, 
        date_nettoyage, 
        id_personnel_nettoyage
      ) 
      VALUES (?, ?, ?);
    `, [idChambre, dateNettoyage, idPersonnelNettoyage]);
    
    // Récupérer les détails du nettoyage créé
    if (result.insertId) {
      const [nettoyage] = await pool.query(`
        SELECT 
          n.id_nettoyage,
          n.id_chambre,
          n.date_nettoyage,
          n.id_personnel_nettoyage,
          c.numero AS numero_chambre,
          c.etage,
          s.nom AS nom_service,
          CONCAT(p.prenom, ' ', p.nom) AS nom_personnel
        FROM 
          Nettoyage n
        JOIN 
          Chambre c ON n.id_chambre = c.id_chambre
        JOIN 
          Service s ON c.id_service = s.id_service
        JOIN 
          Personnel_Nettoyage pn ON n.id_personnel_nettoyage = pn.id_nettoyage
        JOIN 
          Personnel pe ON pn.id_nettoyage = pe.id_personnel
        JOIN 
          Personne p ON pe.id_personnel = p.id_personne
        WHERE 
          n.id_nettoyage = ?
      `, [result.insertId]);
      
      return nettoyage;
    }
    
    return null;
  } catch (error) {
    console.error("erreur enregistrement du nettoyage:", error);
    throw error;
  }
}
export async function getSoinsAEffectuerByInfirmierId(idInfirmier) {
  const [soins] = await pool.query(`
    SELECT 
      s.id_soin,
      s.description,
      per_patient.nom AS nom_patient,
      per_patient.prenom AS prenom_patient,
      c.numero AS numero_chambre,
      l.numero AS numero_lit,
      m.nom AS nom_medicament,
      ms.quantite,
      r.date_reunion
    FROM 
      Personnel inf
    JOIN
      Service serv ON inf.id_service = serv.id_service
    JOIN
      Chambre c ON serv.id_service = c.id_service
    JOIN 
      Lit l ON c.id_chambre = l.id_chambre
    JOIN 
      Sejour sej ON l.id_lit = sej.id_lit AND sej.date_sortie_reelle IS NULL
    JOIN 
      Patient pat ON sej.id_patient = pat.id_patient
    JOIN 
      Personne per_patient ON pat.id_patient = per_patient.id_personne
    JOIN 
      Soin s ON pat.id_patient = s.id_patient
    JOIN
      Medicament_Soin ms ON s.id_soin = ms.id_soin
    JOIN
      Medicament m ON ms.id_medicament = m.id_medicament
    JOIN
      Reunion r ON s.id_reunion_decision = r.id_reunion
    WHERE 
      inf.id_personnel = ?
      AND NOT EXISTS (
        SELECT 1
        FROM Administration_Soin adm
        WHERE adm.id_soin = s.id_soin AND adm.id_infirmier = ?
      )
    ORDER BY 
      c.numero, l.numero
  `, [idInfirmier, idInfirmier]);
  
  return soins;
}

export async function getAdministrationSoin() {
  const [adminS] = await pool.query(`
    SELECT * 
    FROM Administration_Soin;
    `);
  return adminS;
}
export async function ajouterAdministrationSoin(id_soin, id_infirmier, date_heure, commentaires) {
  // Vérifier que le soin existe
  const [soinExists] = await pool.query(
    "SELECT id_soin FROM Soin WHERE id_soin = ?",
    [id_soin]
  );
  
  if (soinExists.length === 0) {
    throw new Error("Le soin spécifié n'existe pas");
  }
  
  // Vérifier que l'infirmier existe
  const [infirmierExists] = await pool.query(
    "SELECT id_infirmier FROM Infirmier WHERE id_infirmier = ?",
    [id_infirmier]
  );
  
  if (infirmierExists.length === 0) {
    throw new Error("L'infirmier spécifié n'existe pas");
  }
  
  // Utiliser la date fournie ou la date actuelle
  const adminDate = date_heure ? new Date(date_heure) : new Date();
  
  // Insertion dans la base de données
  const [result] = await pool.query(`
    INSERT INTO Administration_Soin 
    (id_soin, id_infirmier, date_heure, commentaires)
    VALUES (?, ?, ?, ?)
  `, [id_soin, id_infirmier, adminDate, commentaires]);
  
  // Récupération de l'administration insérée avec informations complémentaires
  const [administration] = await pool.query(`
    SELECT 
      ad.id_administration,
      ad.id_soin,
      ad.id_infirmier,
      ad.date_heure,
      ad.commentaires,
      s.description AS description_soin,
      CONCAT(p.prenom, ' ', p.nom) AS nom_infirmier
    FROM 
      Administration_Soin ad
    JOIN 
      Soin s ON ad.id_soin = s.id_soin
    JOIN 
      Infirmier i ON ad.id_infirmier = i.id_infirmier
    JOIN 
      Personnel pe ON i.id_infirmier = pe.id_personnel
    JOIN 
      Personne p ON pe.id_personnel = p.id_personne
    WHERE 
      ad.id_administration = ?
  `, [result.insertId]);
  
  return administration[0]; // Renvoyer le premier élément du tableau pour avoir un objet simple
}
//supprimerPatient
export async function supprimerPatient(idPatient) {
  try {
    // Démarrer la transaction
    await pool.query('START TRANSACTION');
    
    // Vérifier si l'ID existe en tant que patient
    const [patientExists] = await pool.query(
      "SELECT p.id_personne FROM Patient pa JOIN Personne p ON pa.id_patient = p.id_personne WHERE pa.id_patient = ?",
      [idPatient]
    );
   
    if (patientExists.length === 0) {
      throw new Error("Le patient spécifié n'existe pas");
    }
    
    // IMPORTANT: Vérifier si cette personne est aussi membre du personnel
    const [isAlsoPersonnel] = await pool.query(
      "SELECT id_personnel FROM Personnel WHERE id_personnel = ?",
      [idPatient]
    );
    
    if (isAlsoPersonnel.length > 0) {
      throw new Error("Cette personne est également enregistrée comme membre du personnel et ne peut pas être supprimée");
    }
   
    // Suppression de tout ce qui est lié au patient
    await pool.query(`
      DELETE a FROM Administration_Soin a
      JOIN Soin s ON a.id_soin = s.id_soin
      WHERE s.id_patient = ?
    `, [idPatient]);
   
    await pool.query(`
      DELETE ms FROM Medicament_Soin ms
      JOIN Soin s ON ms.id_soin = s.id_soin
      WHERE s.id_patient = ?
    `, [idPatient]);
   
    await pool.query(
      "DELETE FROM Soin WHERE id_patient = ?",
      [idPatient]
    );
   
    await pool.query(
      "DELETE FROM Visite_Medicale WHERE id_patient = ?",
      [idPatient]
    );
   
    await pool.query(
      "DELETE FROM Sejour WHERE id_patient = ?",
      [idPatient]
    );
   
    await pool.query(
      "DELETE FROM Patient WHERE id_patient = ?",
      [idPatient]
    );
   
    await pool.query(
      "DELETE FROM Personne WHERE id_personne = ?",
      [idPatient]
    );
   
    // Valider toutes les modifications
    await pool.query('COMMIT');
   
    return { success: true, message: "Patient et les données associées supprimés avec succès" };
  } catch (error) {
    // En cas d'erreur, annulation de toutes les modifications
    await pool.query('ROLLBACK');
    throw error;
  }
}
//supprimer sejour
export async function supprimerSejour(idSejour) {
  try {
    await pool.query('START TRANSACTION');
    
    const [sejourExists] = await pool.query(
      "SELECT * FROM Sejour WHERE id_sejour = ?",
      [idSejour]
    );
    
    if (sejourExists.length === 0) {
      throw new Error("Le séjour spécifié n'existe pas");
    }
    
    // Vérifier si le séjour n'a pas encore commencé (date_arrivee est dans le futur)
    const sejour = sejourExists[0];
    const dateArrivee = new Date(sejour.date_arrivee);
    const maintenant = new Date();
    
    if (dateArrivee <= maintenant) {
      throw new Error("Impossible de supprimer un séjour déjà commencé");
    }
    
    await pool.query(
      "DELETE FROM Sejour WHERE id_sejour = ?",
      [idSejour]
    );
    
    await pool.query('COMMIT');
    
    return { 
      success: true, 
      message: "Séjour supprimé avec succès" 
    };
  } catch (error) {
    // En cas d'erreur, annuler toutes les modifications
    await pool.query('ROLLBACK');
    throw error;
  }
}
//supprimer soin
export async function supprimerSoin(idSoin) {
  try {
    await pool.query('START TRANSACTION');
    
    const [soinExists] = await pool.query(
      "SELECT * FROM Soin WHERE id_soin = ?",
      [idSoin]
    );
    
    if (soinExists.length === 0) {
      throw new Error("Le soin spécifié n'existe pas");
    }
    
    // pour vérifier si le soin a déjà été administré
    const [administrations] = await pool.query(
      "SELECT COUNT(*) AS count FROM Administration_Soin WHERE id_soin = ?",
      [idSoin]
    );
    
    if (administrations[0].count > 0) {
      throw new Error("Impossible de supprimer un soin déjà administré");
    }
    
    await pool.query(
      "DELETE FROM Medicament_Soin WHERE id_soin = ?",
      [idSoin]
    );
    
    await pool.query(
      "DELETE FROM Soin WHERE id_soin = ?",
      [idSoin]
    );
    
    await pool.query('COMMIT');
    
    return { 
      success: true, 
      message: "Soin supprimé avec succès" 
    };
  } catch (error) {
    // en cas d'erreur, annuler toutes les modifications
    await pool.query('ROLLBACK');
    throw error;
  }
}
//afficher reunions
export async function afficherReunions() {
  try {
    const [reunions] = await pool.query(`
      SELECT 
        r.id_reunion,
        r.date_reunion,
        r.sujet,
        r.compte_rendu,
        (
          SELECT COUNT(*) 
          FROM Soin 
          WHERE id_reunion_decision = r.id_reunion
        ) AS nombre_soins,
        (
          SELECT GROUP_CONCAT(CONCAT(p.nom, ' ', p.prenom) SEPARATOR ', ')
          FROM Participation_Medecin_Reunion pmr
          JOIN Medecin m ON pmr.id_medecin = m.id_medecin
          JOIN Personnel pe ON m.id_medecin = pe.id_personnel
          JOIN Personne p ON pe.id_personnel = p.id_personne
          WHERE pmr.id_reunion = r.id_reunion
        ) AS medecins_participants,
        (
          SELECT GROUP_CONCAT(CONCAT(p.nom, ' ', p.prenom) SEPARATOR ', ')
          FROM Participation_Infirmier_Reunion pir
          JOIN Infirmier i ON pir.id_infirmier = i.id_infirmier
          JOIN Personnel pe ON i.id_infirmier = pe.id_personnel
          JOIN Personne p ON pe.id_personnel = p.id_personne
          WHERE pir.id_reunion = r.id_reunion
        ) AS infirmiers_participants
      FROM Reunion r
      ORDER BY r.date_reunion DESC
    `);

    return reunions;
  } catch (error) {
    throw error;
  }
}
//supprimer reunion
export async function supprimerReunion(idReunion) {
  try {
    await pool.query('START TRANSACTION');
    
    const [reunionExists] = await pool.query(
      "SELECT * FROM Reunion WHERE id_reunion = ?",
      [idReunion]
    );
    
    if (reunionExists.length === 0) {
      throw new Error("La réunion spécifiée n'existe pas");
    }
    
    const reunion = reunionExists[0];
    const dateReunion = new Date(reunion.date_reunion);
    const maintenant = new Date();
    
    if (dateReunion <= maintenant) {
      throw new Error("Impossible d'annuler une réunion déjà tenue");
    }
    
    const [soinsAssocies] = await pool.query(
      "SELECT COUNT(*) AS count FROM Soin WHERE id_reunion_decision = ?",
      [idReunion]
    );
    
    if (soinsAssocies[0].count > 0) {
      throw new Error("Impossible de supprimer cette réunion : des soins y ont été planifiés");
    }
    
    await pool.query(
      "DELETE FROM Participation_Medecin_Reunion WHERE id_reunion = ?",
      [idReunion]
    );
    
    await pool.query(
      "DELETE FROM Participation_Infirmier_Reunion WHERE id_reunion = ?",
      [idReunion]
    );
    
    await pool.query(
      "DELETE FROM Reunion WHERE id_reunion = ?",
      [idReunion]
    );
    
    await pool.query('COMMIT');
    
    return { 
      success: true, 
      message: "Réunion annulée avec succès" 
    };
  } catch (error) {
    // En cas d'erreur, annuler toutes les modifications
    await pool.query('ROLLBACK');
    throw error;
  }
}
//supprimer visiteMed
// Fonction à ajouter dans database.js
export async function supprimerVisiteMedicale(idVisite) {
  try {
    await pool.query('START TRANSACTION');
    
    const [visiteExists] = await pool.query(
      "SELECT * FROM Visite_Medicale WHERE id_visite = ?",
      [idVisite]
    );
    
    if (visiteExists.length === 0) {
      throw new Error("La visite médicale spécifiée n'existe pas");
    }
    
    // Vérifier si la visite n'a pas encore eu lieu (la date est dans le futur)
    const visite = visiteExists[0];
    const dateVisite = new Date(visite.date_visite);
    const maintenant = new Date();
    
    if (dateVisite <= maintenant) {
      throw new Error("Impossible de supprimer une visite médicale déjà effectuée");
    }
    
    // Supprimer la visite médicale
    await pool.query(
      "DELETE FROM Visite_Medicale WHERE id_visite = ?",
      [idVisite]
    );
    
    await pool.query('COMMIT');
    
    return { 
      success: true, 
      message: "Visite médicale supprimée avec succès" 
    };
  } catch (error) {
    // En cas d'erreur, annuler toutes les modifications
    await pool.query('ROLLBACK');
    throw error;
  }
}

export async function getDossierPatient(idPatient) {
  // 1. Antécédents médicaux du patient
  const [antecedents] = await pool.query(`
    SELECT
      PE.nom,
      PE.prenom,
      PE.date_naissance,
      P.antecedents_medicaux
    FROM
      Patient P 
      INNER JOIN personne PE ON P.id_patient = PE.id_personne
    WHERE
      P.id_patient = ?
  `, [idPatient]);
  
  // Reste du code inchangé...
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
    WHERE
      s.id_patient = ?
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

// Récupérer les détails de la réunion liée à un soin
export async function getDetailReunionSoin(idSoin) {
  const [rows] = await pool.query(`
    SELECT 
      r.id_reunion, 
      r.date_reunion, 
      r.sujet, 
      r.compte_rendu
    FROM 
      soin s
    INNER JOIN 
  reunion r ON s.id_reunion_decision = r.id_reunion
    WHERE 
      s.id_soin = ?
  `, [idSoin]);
  
  return rows;
}
export async function getVisitesMedicales() {
  const [visites] = await pool.query(`
    SELECT 
    vm.id_visite,
    vm.date_visite,
    vm.examens_pratiques,
    vm.commentaires,
    
    p_patient.id_personne AS id_patient,
    p_patient.nom AS nom_patient,
    p_patient.prenom AS prenom_patient,
    p_patient.date_naissance AS date_naissance_patient,
    
    p_medecin.id_personne AS id_medecin,
    p_medecin.nom AS nom_medecin,
    p_medecin.prenom AS prenom_medecin,
    m.specialite AS specialite_medecin
    
FROM Visite_Medicale vm
JOIN Patient pt ON vm.id_patient = pt.id_patient
JOIN Personne p_patient ON pt.id_patient = p_patient.id_personne
JOIN Medecin m ON vm.id_medecin = m.id_medecin
JOIN Personne p_medecin ON m.id_medecin = p_medecin.id_personne
ORDER BY vm.date_visite DESC;
    `);
  return visites;
}
export async function getSoinsPatient(idPatient) {
  const [soins] = await pool.query(`
    SELECT s.id_soin, s.description, r.date_reunion, r.sujet,
           ms.id_medicament, m.nom AS nom_medicament, m.description AS description_medicament, 
           m.dosage, ms.quantite
    FROM Soin s
    JOIN Reunion r ON s.id_reunion_decision = r.id_reunion
    LEFT JOIN Medicament_Soin ms ON s.id_soin = ms.id_soin
    LEFT JOIN Medicament m ON ms.id_medicament = m.id_medicament
    WHERE s.id_patient = ?
  `, [idPatient]);
  
  return soins;
}
export async function getVisitesByMedecin(idMedecin) {
  const [visites] = await pool.query(`
    SELECT vm.*, 
           p_patient.nom as nom_patient, p_patient.prenom as prenom_patient
    FROM Visite_Medicale vm
    JOIN Patient pt ON vm.id_patient = pt.id_patient
    JOIN Personne p_patient ON pt.id_patient = p_patient.id_personne
    WHERE vm.id_medecin = ?
    ORDER BY vm.date_visite DESC
  `, [idMedecin]);
 
  return visites;
}
//pour ajouter une visite Medicale
// Fonction à ajouter dans database.js
export async function ajouterVisiteMedicale(
  idPatient,
  idMedecin,
  dateVisite,
  compteRendu,
  examens = '',
  commentaires = ''
) {
  try {
    // Insertion directe dans la table Visite_Medicale
    const [result] = await pool.query(
      `INSERT INTO Visite_Medicale (
        id_patient,
        id_medecin,
        date_visite,
        examens_pratiques,
        commentaires
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        idPatient,
        idMedecin,
        dateVisite,
        examens,
        compteRendu
      ]
    );
    
    return {
      id_visite: result.insertId,
      id_patient: idPatient,
      id_medecin: idMedecin,
      date_visite: dateVisite,
      examens_pratiques: examens,
      commentaires: compteRendu
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une visite médicale:", error);
    throw error;
  }
}
export async function ajouterReunion(dateReunion, sujet, compteRendu, medecinIds, infirmierIds) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [resultReunion] = await connection.query(`
      INSERT INTO Reunion (date_reunion, sujet, compte_rendu)
      VALUES (?, ?, ?);
    `, [dateReunion, sujet, compteRendu]);
    
    const idReunion = resultReunion.insertId;
    
    // Ajout des médecins participants
    if (medecinIds && medecinIds.length > 0) {
      for (const idMedecin of medecinIds) {
        await connection.query(`
          INSERT INTO Participation_Medecin_Reunion (id_medecin, id_reunion)
          VALUES (?, ?);
        `, [idMedecin, idReunion]);
      }
    }
    
    // Ajout des infirmiers participants
    if (infirmierIds && infirmierIds.length > 0) {
      for (const idInfirmier of infirmierIds) {
        await connection.query(`
          INSERT INTO Participation_Infirmier_Reunion (id_infirmier, id_reunion)
          VALUES (?, ?);
        `, [idInfirmier, idReunion]);
      }
    }
    
    await connection.commit();
    return { id: idReunion, dateReunion, sujet, compteRendu };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function ajouterSoin(description, idPatient, idReunionDecision, medicamentsAssocies) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insertion du soin
    const [resultSoin] = await connection.query(`
      INSERT INTO Soin (description, id_patient, id_reunion_decision)
      VALUES (?, ?, ?);
    `, [description, idPatient, idReunionDecision]);
    
    const idSoin = resultSoin.insertId;
    
    // Ajout des médicaments associés au soin
    if (medicamentsAssocies && medicamentsAssocies.length > 0) {
      for (const med of medicamentsAssocies) {
        await connection.query(`
          INSERT INTO Medicament_Soin (id_soin, id_medicament, quantite)
          VALUES (?, ?, ?);
        `, [idSoin, med.id_medicament, med.quantite]);
      }
    }
    
    await connection.commit();
    
    
    const [soins] = await connection.query(`
      SELECT 
        s.id_soin, 
        s.description, 
        s.id_patient, 
        s.id_reunion_decision,
        p.nom as nom_patient, 
        p.prenom as prenom_patient
      FROM Soin s
      JOIN Patient pt ON s.id_patient = pt.id_patient
      JOIN Personne p ON pt.id_patient = p.id_personne
      WHERE s.id_soin = ?
    `, [idSoin]);
    
    const [medicaments] = await connection.query(`
      SELECT 
        ms.id_medicament,
        m.nom as nom_medicament, 
        m.description as desc_medicament, 
        m.dosage, 
        ms.quantite
      FROM Medicament_Soin ms
      JOIN Medicament m ON ms.id_medicament = m.id_medicament
      WHERE ms.id_soin = ?
    `, [idSoin]);
    
    // Combiner les informations
    const soinComplet = {
      ...soins[0],
      medicaments: medicaments
    };
    
    return soinComplet;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function modifierSoin(req, res) {
  const idSoin = req.params.idSoin;
  const { description, id_patient, id_reunion_decision, medicaments } = req.body;
  
  // Ajout de logs détaillés pour déboguer
  console.log("Données reçues dans modifierSoin:", {
    idSoin,
    description,
    id_patient,
    id_reunion_decision,
    medicaments: medicaments ? JSON.stringify(medicaments) : "undefined"
  });
  
  if (!description || !id_patient || !id_reunion_decision) {
    return res.status(400).json({
      success: false,
      message: "La description, l'ID du patient et l'ID de la réunion de décision sont requis"
    });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    //vérification si le soin existe
    const [soin] = await connection.query(
      "SELECT * FROM Soin WHERE id_soin = ?",
      [idSoin]
    );
    
    if (soin.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Soin non trouvé"
      });
    }
    
    //si le patient existe
    const [patient] = await connection.query(
      "SELECT * FROM Patient WHERE id_patient = ?",
      [id_patient]
    );
    
    if (patient.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Patient non trouvé"
      });
    }
    
    //si la réunion existe
    const [reunion] = await connection.query(
      "SELECT * FROM Reunion WHERE id_reunion = ?",
      [id_reunion_decision]
    );
    
    if (reunion.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Réunion non trouvée"
      });
    }
    
    // MAJ les informations du soin
    await connection.query(
      "UPDATE Soin SET description = ?, id_patient = ?, id_reunion_decision = ? WHERE id_soin = ?",
      [description, id_patient, id_reunion_decision, idSoin]
    );
    
    // Si des médicaments sont fournis, MAJ les associations
    if (medicaments && Array.isArray(medicaments)) {
      console.log("Traitement des médicaments:", JSON.stringify(medicaments));
      
      // suppr les associations existantes
      await connection.query(
        "DELETE FROM Medicament_Soin WHERE id_soin = ?",
        [idSoin]
      );
      
      // Ajout des nouvelles associations
      for (const med of medicaments) {
        console.log("Traitement du médicament:", JSON.stringify(med));
        
        if (!med.id_medicament || !med.quantite) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            success: false,
            message: "Chaque médicament doit avoir un ID et une quantité"
          });
        }
        
        // Vérifier si le médicament existe
        const [medicament] = await connection.query(
          "SELECT * FROM Medicament WHERE id_medicament = ?",
          [med.id_medicament]
        );
        
        if (medicament.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({
            success: false,
            message: `Médicament avec ID ${med.id_medicament} non trouvé`
          });
        }
        
        console.log(`Ajout du médicament ${med.id_medicament} avec quantité ${med.quantite}`);
        
        // Tentative d'insertion
        try {
          await connection.query(
            "INSERT INTO Medicament_Soin (id_soin, id_medicament, quantite) VALUES (?, ?, ?)",
            [idSoin, med.id_medicament, med.quantite]
          );
        } catch (insertError) {
          console.error("Erreur lors de l'insertion du médicament:", insertError);
          throw insertError; // Propagation de l'erreur pour rollback
        }
      }
    } else {
      console.log("Aucun médicament fourni ou format incorrect");
    }
    
    await connection.commit();
    
    // Récupérer les données mises à jour pour les renvoyer
    const [soinModifie] = await connection.query(`
      SELECT 
        s.id_soin, 
        s.description, 
        s.id_patient, 
        p.nom as nom_patient, 
        p.prenom as prenom_patient,
        s.id_reunion_decision,
        r.date_reunion, 
        r.sujet as sujet_reunion
      FROM Soin s
      JOIN Patient pt ON s.id_patient = pt.id_patient
      JOIN Personne p ON pt.id_patient = p.id_personne
      JOIN Reunion r ON s.id_reunion_decision = r.id_reunion
      WHERE s.id_soin = ?
    `, [idSoin]);
    
    const [medicamentsAssocies] = await connection.query(`
      SELECT 
        ms.id_medicament,
        m.nom as nom_medicament, 
        m.description as desc_medicament, 
        m.dosage, 
        ms.quantite
      FROM Medicament_Soin ms
      JOIN Medicament m ON ms.id_medicament = m.id_medicament
      WHERE ms.id_soin = ?
    `, [idSoin]);
    
    res.status(200).json({
      success: true,
      message: "Soin modifié avec succès",
      soin: {
        ...soinModifie[0],
        medicaments: medicamentsAssocies
      }
    });
    
  } catch (error) {
    // annulation en cas d'erreur
    await connection.rollback();
    console.error("Erreur lors de la modification du soin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification du soin",
      error: error.message
    });
  } finally {
    connection.release();
  }
}
export async function getSoins() {
  const [rows] = await pool.query(`
    SELECT
      s.id_soin,
      s.description,
      s.id_patient,
      p.nom as nom_patient,
      p.prenom as prenom_patient,
      s.id_reunion_decision,
      r.date_reunion,
      r.sujet as sujet_reunion
    FROM Soin s
    JOIN Patient pt ON s.id_patient = pt.id_patient
    JOIN Personne p ON pt.id_patient = p.id_personne
    JOIN Reunion r ON s.id_reunion_decision = r.id_reunion
    ORDER BY r.date_reunion DESC
  `);
  
  return rows;
}

export async function getSoinById(id) {
  const [soins] = await pool.query(`
    SELECT
      s.id_soin,
      s.description,
      s.id_patient,
      p.nom as nom_patient,
      p.prenom as prenom_patient,
      s.id_reunion_decision,
      r.date_reunion,
      r.sujet as sujet_reunion
    FROM Soin s
    JOIN Patient pt ON s.id_patient = pt.id_patient
    JOIN Personne p ON pt.id_patient = p.id_personne
    JOIN Reunion r ON s.id_reunion_decision = r.id_reunion
    WHERE s.id_soin = ?
  `, [id]);
  
  if (soins.length === 0) {
    return null;
  }
  
  const soin = soins[0];
  
  const [medicaments] = await pool.query(`
    SELECT
      ms.id_medicament,
      m.nom as nom_medicament,
      m.description as desc_medicament,
      m.dosage,
      ms.quantite
    FROM Medicament_Soin ms
    JOIN Medicament m ON ms.id_medicament = m.id_medicament
    WHERE ms.id_soin = ?
  `, [id]);
  
  const [administrations] = await pool.query(`
    SELECT
      a.id_administration,
      a.date_heure,
      a.commentaires,
      a.id_infirmier,
      p.nom as nom_infirmier,
      p.prenom as prenom_infirmier
    FROM Administration_Soin a
    JOIN Infirmier i ON a.id_infirmier = i.id_infirmier
    JOIN Personnel pe ON i.id_infirmier = pe.id_personnel
    JOIN Personne p ON pe.id_personnel = p.id_personne
    WHERE a.id_soin = ?
    ORDER BY a.date_heure DESC
  `, [id]);
  
  soin.medicaments = medicaments;
  soin.administrations = administrations;
  
  return soin;
}
/*export async function () {
  const [rows] = await pool.query(`
    `);
  return rows;
}*/