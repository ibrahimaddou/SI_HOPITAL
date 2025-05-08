import express from 'express'
import {   pool,ajouterSoin,ajouterReunion,ajouterVisiteMedicale,getSoinsPatient,
  getMedecinById,getMedecins,addMedecin,getInfirmiers, getAdministratifs,
    getPatients, getNettoyage,getLitsDisponibles,getChambresVides,
    getChambresNonNettoyees,getPatientsRetardSortie,
    getEtatOccupationService,ajouterPatient,ajouterPersonnelAdministratif,
    ajouterPersonnelNettoyage,modifierDateSortiePatient,getSejours,
    ajouterInfirmier,ajouterSejour,getServices,getChambresParService,
    getMedicaments,getChambresANettoyer,enregistrerNettoyage,
    getSoinsAEffectuerByInfirmierId,ajouterAdministrationSoin,getAdministrationSoin,
    supprimerPatient,supprimerSejour,supprimerSoin,afficherReunions,supprimerReunion,
    getDossierPatient, getMedic_patient, getDetailReunionSoin,getVisitesMedicales,
    getVisitesByMedecin,modifierSoin,getSoins,getSoinById,getPatientById,getLitsDisponiblesById,
    supprimerVisiteMedicale

  } from './configMySql/database.js'
import cors from 'cors'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mysql from 'mysql2';


dotenv.config();
//console.log('DB_USER:', process.env.DB_USER); 

const app = express()
const PORT = 3002;
const JWT_SECRET = 'testjwt';

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hopital_db'
};

//authentification jwt
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Accès refusé' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token invalide' });
      req.user = user;
      next();
    });
  };
 app.post('/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;
        
        if (!username || !password || !userType) {
          return res.status(400).json({ message: 'Nom d\'utilisateur, mot de passe et type d\'utilisateur requis' });
        }
        
    
        if (!['admin', 'medecin', 'infirmier','personnelNett'].includes(userType)) {
          return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
        }
        
        const connection = await connectDB();
        
        let table;
        switch (userType) {
          case 'admin':
            table = 'personnel_administratif';
            break;
          case 'medecin':
            table = 'medecin';
            break;
          case 'infirmier':
            table = 'infirmier';
            break;
          case 'personnelNett':
              table = 'Personnel_Nettoyage';
              break;
        }
        
        const result = await connection.execute(`SELECT * FROM ${table} WHERE username = ?`, [username]);
        console.log("Résultat de la requête:", result); 
const rows = result[0]
        await connection.end();
        
        if (rows.length === 0) {
          return res.status(401).json({ message: 'Identifiants incorrects' });
        }
        
        const user = rows[0];
    
    if (password !== user.mot_de_passe) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
  }


        
    // Création du token JWT
    const token = jwt.sign(
        { id: user.id, username: user.username, role: userType },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: userType,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email
        }
      });
        
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
})
// route vers vuejs envoie des données des medecins au front
app.get('/api/data',(req, res) => {
    res.json({message:'Données du backend'});
})

//Admin_______________________________________________________________________________________
app.get("/medecins", async (req,res)=>{
    const medecins = await getMedecins()

    res.send(medecins)
})
app.get("/infirmiers", async (req, res) => {
    const infirmiers = await getInfirmiers()
    res.send(infirmiers)
})

app.get("/personnelsAdministratifs", async (req, res) => {
    const personnelAdmin = await getAdministratifs()
    res.send(personnelAdmin)
})
app.get("/personnelsNettoyage",async (req, res) => {
    const personnelNettoyage = await getNettoyage()
    res.send(personnelNettoyage)
})

app.get("/medecin/:id", async (req,res)=>{
    const id = req.params.id
    const medecin = await getMedecinById(id)

    res.send(medecin)
})

app.post("/medecins" , async (req, res) => {
    const{nom, prenom, adresse, telephone, email, dateEmbauche, motDePasse, idService, specialite}=req.body
    const medecin = await addMedecin(nom, prenom, adresse, telephone, email, dateEmbauche, motDePasse, idService, specialite)
    res.status(201).send(medecin)
    
})
app.get("/lits/:idchambres", async (req, res) => {
    const idChambres = req.params.idchambres
    const lits = await getLitsDispPchambre(idChambres)
    res.send(lits)
 })
  
  
app.get("/litsDisponibles", async (req,res)=>{
  const lits = await getLitsDisponibles()

  res.send(lits)
})
app.get("/litsDisponibles/:id_chambre", async (req, res) => { 
  const id_chambre = req.params.id_chambre; 
  const lits = await getLitsDisponiblesById(id_chambre); 
  res.send(lits); 
})
app.get("/chambresVides", async (req,res)=>{
  const chambres = await getChambresVides()

  res.send(chambres)
})
app.get("/patientsRetardSortie", async (req,res)=>{
  const patients = await getPatientsRetardSortie()

  res.send(patients)
})
app.get("/etatOccupationService/:idService/:date", async (req, res) => {
  try {
    const idService = req.params.idService;
    const date = req.params.date;
    if (!idService || !date) {
      return res.status(400).send({ error: "ID du service et  date sont requis" });
    }
    
    const service = await getEtatOccupationService(idService, date);
    
    res.status(200).send(service);
  } catch (error) {
    console.error("Erreur ! récupération de l'état d'occupation:", error);
    res.status(500).send({ error: "Erreur serveur ! etatoccup" });
  }
});
      //ajout d'un admin
app.post("/personnelsAdministratifs", async (req, res) => {
  try {
    const { nom, prenom, adresse, telephone, email, dateEmbauche, poste, motDePasse, 
      idService, estResponsable 
    } = req.body;
    if (!nom || !prenom || !dateEmbauche || !poste || !motDePasse) {
      return res.status(400).send({ 
        error: "Le nom, prénom, date d'embauche, poste et mot de passe sont obligatoires" 
      });
    }

    const personnelAdmin = await ajouterPersonnelAdministratif(nom, prenom, adresse, 
      telephone, email, dateEmbauche, poste, motDePasse, idService, estResponsable
    );

    res.status(201).send(personnelAdmin);
  } catch (error) {
    console.error("Erreur ajout du personnel admin! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout du personnel administratif" });
  }
});
app.post("/personnelsNettoyage", async (req, res) => {
  try {
    const { 
      nom, 
      prenom, 
      adresse, 
      telephone, 
      email, 
      dateEmbauche, 
      idService
    } = req.body;

    if (!nom || !prenom || !dateEmbauche) {
      return res.status(400).send({ 
        error: " nom prénom et date d'embauche sont requis" 
      });
    }

    const personnelNettoyage = await ajouterPersonnelNettoyage(
      nom, 
      prenom, 
      adresse || null, 
      telephone, 
      email || null, 
      dateEmbauche, 
      idService || null
    );

    res.status(201).send(personnelNettoyage);
  } catch (error) {
    console.error("Erreur ajout du personnel de nettoyage! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout du personnel de nettoyage" });
  }
});
//ajout d infirmier
app.post("/infirmiers", async (req, res) => {
  try {
    const { 
      nom, 
      prenom, 
      adresse, 
      telephone, 
      email, 
      dateEmbauche, 
      qualification, 
      motDePasse,
      idService 
    } = req.body;

    if (!nom || !prenom || !dateEmbauche || !motDePasse) {
      return res.status(400).send({
        error: "Le nom, prénom, date d'embauche et mot de passe sont obligatoires"
      });
    }

    const infirmier = await ajouterInfirmier(
      nom, 
      prenom, 
      adresse, 
      telephone, 
      email, 
      dateEmbauche, 
      qualification, 
      motDePasse, 
      idService
    );

    res.status(201).send(infirmier);
  } catch (error) {
    console.error("Erreur ajout de l'infirmier! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout de l'infirmier" });
  }
});
app.get("/sejours", async (req,res)=>{
  const sejours = await getSejours()

  res.send(sejours)
})

  
 app.get("/sejours/:idSejour", async (req, res) => {
  const sejourId = req.params.idSejour;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Sejour WHERE id_sejour = ?",
      [sejourId]
    );

    if (rows.length === 0) {
      return res.status(404).send({ error: "Séjour non trouvé" });
    }

    res.send(rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du séjour :", err);
    res.status(500).send({ error: "Erreur serveur" });
  }
});

app.put("/modifierDateSortiePatient/:idSejour", modifierDateSortiePatient);
app.post("/sejours", authenticateToken, async (req, res) => {
  try {
    const { 
      idPatient, 
      idLit, 
      dateArrivee, 
      dateSortiePrevisionnelle, 
      raisonSejour
    } = req.body;
    
    if (!idPatient || !idLit || !dateArrivee || !raisonSejour ) {
      return res.status(400).send({ 
        error: "L'ID du patient, l'ID du lit, la date d'arrivée et la raison du séjour sont obligatoires" 
      });
    }
    
    const sejour = await ajouterSejour(
      idPatient,
      idLit,
      dateArrivee,
      dateSortiePrevisionnelle,
      raisonSejour,
      idAdministrateur // Passage de l'ID de l'administrateur
    );
    
    res.status(201).send(sejour);
  } catch (error) {
    console.error("Erreur lors de l'ajout du séjour! ", error);
    
    if (error.message && error.message.includes("lit est déjà occupé")) {
      return res.status(400).send({ error: error.message });
    }
    
    res.status(500).send({ error: "Erreur serveur - ajout du séjour" });
  }
});
app.get("/services", async (req, res) => {
  try {
    const services = await getServices();
    res.json(services);
  } catch (error) {
    console.error("Erreur lors de l'affichage des services:", error);
    res.status(500).send({ error: "Erreur serveur - affichage des services" });
  }
});
//Medecin_____________________________________________________________________________________
app.get("/patients", async (req, res) => {
  const patients = await getPatients()
  res.send(patients)
})
app.get("/patients/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Vérification que l'ID est un nombre
    if (isNaN(patientId)) {
      return res.status(400).send({
        message: "L'ID du patient doit être un nombre"
      });
    }
    
    const patient = await getPatientById(patientId);
    
    if (patient.length === 0) {
      return res.status(404).send({
        message: `Aucun patient trouvé avec l'ID ${patientId}`
      });
    }
    
    res.send(patient);
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).send({
      message: "Erreur lors de la récupération du patient",
      error: error.message
    });
  }
});
app.post("/patients", async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, adresse, telephone, email, antecedentsMedicaux } = req.body;
   
    if (!nom || !prenom || !dateNaissance) {
      return res.status(400).send({ error: "Le nom, prénom et date de naissance sont obligatoires" });
    }
    
    const patient = await ajouterPatient(nom, prenom, dateNaissance, adresse, telephone, email, antecedentsMedicaux);
    
    res.status(201).send(patient);
  } catch (error) {
    console.error("Erreur ajout du patient! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout du patient" });
  }
});

app.get("/afficherMedicaments", async (req, res) => {
  const medicaments = await getMedicaments()
  res.send(medicaments)
});

app.get("/reunions", async (req, res) => {
  try {
    const reunions = await afficherReunions();
    res.status(200).send(reunions);
  } catch (error) {
    console.error("Erreur lors de la récupération des réunions: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - récupération des réunions", 
      message: error.message 
    });
  }
});
app.get('/patient/dossier/:idPatient', async (req, res) => {
  const idPatient = req.params.idPatient;
  try {
    const dossier = await getDossierPatient(idPatient);  
    res.json(dossier);  
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération du dossier');
  }
});

// Récupérer les médicaments associés aux soins d'un patient
app.get('/afficherMedicamentsPatient/:idPatient', async (req, res) => {
  const idPatient = req.params.idPatient;

  try {
    const medicaments = await getMedic_patient(idPatient);  
    res.send(medicaments); 
  } catch (error) {
    console.error('Erreur lors de la récupération des médicaments du patient :', error);
    res.status(500).send('Erreur lors de la récupération des médicaments');
  }
});

app.get('/afficherDetailReunion/:idSoin', async (req, res) => {
  const idSoin = req.params.idSoin;

  try {
    const reunion = await getDetailReunionSoin(idSoin);
    
    if (!reunion || reunion.length === 0) {
      return res.status(404).send('Aucune réunion trouvée pour ce soin');
    }

    res.send(reunion[0]); // On renvoie un seul objet
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de réunion :', error);
    res.status(500).send('Erreur lors de la récupération de la réunion');
  }
});
app.get("/afficherVisitesMedicales", async (req, res) => {
  const visites = await getVisitesMedicales();
  res.send(visites)
});
app.get("/visitesMedecin/:id", async (req, res) => {
  try {
    const idMedecin = req.params.id;
    const visites = await getVisitesByMedecin(idMedecin);
    res.status(200).send(visites);
  } catch (error) {
    console.error("Erreur lors de la récupération des visites du médecin: ", error);
    res.status(500).send({ error: "Erreur serveur - récupération des visites du médecin" });
  }
});
app.post("/afficherVisitesMedicales", async (req, res) => {
  try {
    const {
      idPatient,
      idMedecin,
      dateVisite,
      compteRendu,
      diagnostics,
      prescriptions
    } = req.body;
    
    // Vérification minimale des champs obligatoires
    if (!idPatient || !idMedecin || !dateVisite || !compteRendu) {
      return res.status(400).json({ 
        error: "Champs obligatoires manquants"
      });
    }
    
    // Appel de la fonction avec les paramètres minimaux
    const result = await ajouterVisiteMedicale(
      idPatient,
      idMedecin,
      dateVisite,
      compteRendu,
      diagnostics || prescriptions || ''  // Utiliser diagnostics ou prescriptions comme examens
    );
    
    res.status(201).json(result);
    
  } catch (error) {
    console.error("Erreur lors de l'ajout de la visite médicale:", error);
    // Capturer et retourner l'erreur SQL pour le débogage
    res.status(500).json({
      error: "Erreur serveur - ajout de la visite médicale",
      details: error.message  // Inclure les détails de l'erreur pour le débogage
    });
  }
});
app.post("/reunions", async (req, res) => {
  try {
    const { dateReunion, sujet, compteRendu, medecinIds, infirmierIds } = req.body;
    
    if (!dateReunion || !sujet) {
      return res.status(400).send({ error: "La date et le sujet de la réunion sont obligatoires" });
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    if (!dateRegex.test(dateReunion)) {
      return res.status(400).send({ error: "Format de date invalide. Utilisez le format ISO (YYYY-MM-DDTHH:MM:SS)" });
    }
    
    const reunion = await ajouterReunion(dateReunion, sujet, compteRendu, medecinIds, infirmierIds);
    
    res.status(201).send(reunion);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réunion! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout de la réunion" });
  }
});
app.post("/soins", async (req, res) => {
  try {
    const { description, id_patient, id_reunion_decision, medicaments } = req.body;
    
   
    if (!description || !id_patient || !id_reunion_decision) {
      return res.status(400).send({ 
        error: "La description, l'ID du patient et l'ID de la réunion de décision sont obligatoires" 
      });
    }
    
    // patient
    const [patients] = await pool.query(`
      SELECT id_patient FROM Patient WHERE id_patient = ?
    `, [id_patient]);
    
    if (patients.length === 0) {
      return res.status(404).send({ error: "Patient non trouvé" });
    }
    
    // si la réunion existe
    const [reunions] = await pool.query(`
      SELECT id_reunion FROM Reunion WHERE id_reunion = ?
    `, [id_reunion_decision]);
    
    if (reunions.length === 0) {
      return res.status(404).send({ error: "Réunion non trouvée" });
    }
    
    if (medicaments && medicaments.length > 0) {
      for (const med of medicaments) {
        if (!med.id_medicament || !med.quantite) {
          return res.status(400).send({ 
            error: "Chaque médicament doit avoir un ID et une quantité" 
          });
        }
        
        // si le médicament existe
        const [meds] = await pool.query(`
          SELECT id_medicament FROM Medicament WHERE id_medicament = ?
        `, [med.id_medicament]);
        
        if (meds.length === 0) {
          return res.status(404).send({ 
            error: `Médicament avec ID ${med.id_medicament} non trouvé` 
          });
        }
      }
    }
    
    const soin = await ajouterSoin(description, id_patient, id_reunion_decision, medicaments);
    
    res.status(201).send(soin);
  } catch (error) {
    console.error("Erreur lors de l'ajout du soin! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout du soin" });
  }
});
app.get("/soins", async (req, res) => {
  try {
    const soins = await getSoins();
    res.status(200).send(soins);
  } catch (error) {
    console.error("Erreur lors de la récupération des soins:", error);
    res.status(500).send({
      success: false,
      message: "Erreur serveur lors de la récupération des soins",
      error: error.message
    });
  }
});

app.get("/soins/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const soin = await getSoinById(id);
    
    if (!soin) {
      return res.status(404).send({
        success: false,
        message: "Soin non trouvé"
      });
    }
    
    res.status(200).send(soin);
  } catch (error) {
    console.error("Erreur lors de la récupération du soin:", error);
    res.status(500).send({
      success: false,
      message: "Erreur serveur lors de la récupération du soin",
      error: error.message
    });
  }
});
app.put("/modifierSoin/:idSoin", modifierSoin);
//Infirmiers_______________________________________________________________________________________
app.get("/afficherChambres/:idService", async (req, res) => {
  try {
    const idService = parseInt(req.params.idService);
    
    if (isNaN(idService)) {
      return res.status(400).send({ error: "id du service doit être un nombre entier" });
    }
    
    const chambres = await getChambresParService(idService);
    
    res.json(chambres);
  } catch (error) {
    console.error("Erreur lors de l'affichage des chambres:", error);
  
    res.status(500).send({ error: "Erreur serveur - affichage des chambres" });
  }
});

app.get("/afficherSoinsAEffectuer/:idInfirmier", async (req, res) => {
  const idInfirmier = req.params.idInfirmier;
  const soinsAEffectuer = await getSoinsAEffectuerByInfirmierId(idInfirmier);
  
  res.send(soinsAEffectuer);
});

//Personnel net_____________________________________________________________________________________
app.get("/chambresNonNettoyees", async (req, res) => {
  const chambres = await getChambresNonNettoyees()
  res.send(chambres)
})
app.get("/chambresANettoyer", async (req, res) => {
  const chambres = await getChambresANettoyer()
  res.send(chambres)
}) 
app.post("/enregistrerNettoyage", async (req, res) => {
  try {
    const { idChambre, idPersonnelNettoyage, dateNettoyage } = req.body;
    
    if (!idChambre || !idPersonnelNettoyage) {
      return res.status(400).send({ error: "L'ID de la chambre et l'ID du personnel de nettoyage sont obligatoires" });
    }
    const dateEffective = dateNettoyage || new Date();
    
    const nettoyage = await enregistrerNettoyage(idChambre, idPersonnelNettoyage, dateEffective);
    
      res.status(201).send(nettoyage);
    
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du nettoyage! ", error);
    res.status(500).send({ error: "Erreur serveur - enregistrement du nettoyage" });
  }
})
//soins__________________________________________________________________________________________

app.get("/administrationSoin", async (req, res) => {
  const adminS = await getAdministrationSoin()
  res.send(adminS)
}) 

app.post("/administrationSoin/add", async (req, res) => {
  try {
    const { id_soin, id_infirmier, date_heure, commentaires } = req.body;
    
    // Vérifie que les données obligatoires sont présentes
    if (!id_soin || !id_infirmier) {
      return res.status(400).json({ message: "Champs obligatoires manquants (id_soin, id_infirmier)" });
    }
    
    // Utilisez la date fournie ou créez-en une nouvelle
    const dateAdmin = date_heure || new Date().toISOString();
    
    // Appel à la fonction métier avec tous les paramètres requis
    const adminSoin = await ajouterAdministrationSoin(id_soin, id_infirmier, dateAdmin, commentaires);
    
    res.status(201).json(adminSoin);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une administration de soin:", error);
    res.status(400).json({ message: error.message || "Erreur lors de l'ajout de l'administration" });
  }
});
app.get("/afficherSoinsPatient/:idPatient", async (req, res) => {
  try {
    const soinsPatient = await getSoinsPatient(req.params.idPatient);
    res.send(soinsPatient);
  } catch (error) {
    console.error("Erreur lors de la récupération des soins:", error);
    res.status(500).send("Erreur serveur");
  }
});
//Req Delete_______________________________________________________________________________________
app.delete("/supprimerPatients/:idPatient", async (req, res) => {
  try {
    const idPatient = req.params.idPatient;
   
    if (!idPatient) {
      return res.status(400).json({ error: "ID de patient obligatoire" });
    }
   
    const result = await supprimerPatient(idPatient);
   
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression d'un patient: ", error);
    
    // Retourner un code d'erreur différent selon le type d'erreur
    if (error.message.includes("n'existe pas")) {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes("également enregistrée comme membre du personnel")) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({
      error: "Erreur serveur - suppression de patient",
      message: error.message
    });
  }
});

app.delete("/supprimerSejour/:idSejour", async (req, res) => {
  try {
    const idSejour = req.params.idSejour;
    
    if (!idSejour) {
      return res.status(400).send({ error: "ID de séjour obligatoire" });
    }
    
    const resultat = await supprimerSejour(idSejour);
    
    res.status(200).send({ 
      message: "Séjour supprimé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un séjour: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - suppression de séjour", 
      message: error.message 
    });
  }
});
app.delete("/supprimerSoin/:idSoin", async (req, res) => {
  try {
    const idSoin = req.params.idSoin;
    
    if (!idSoin) {
      return res.status(400).send({ error: "id de soin obligatoire" });
    }
    
    const resultat = await supprimerSoin(idSoin);
    
    res.status(200).send({ 
      message: "Soin supprimé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un soin: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - suppression de soin", 
      message: error.message 
    });
  }
});

app.delete("/supprimerReunion/:idReunion", async (req, res) => {
  try {
    const idReunion = req.params.idReunion;
    
    if (!idReunion) {
      return res.status(400).send({ error: "ID de réunion obligatoire" });
    }
    
    const resultat = await supprimerReunion(idReunion);
    
    res.status(200).send({ 
      message: "Réunion annulée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation d'une réunion: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - annulation de réunion", 
      message: error.message 
    });
  }
});
app.delete("/supprimerVisiteMedicale/:idVisite", async (req, res) => {
  try {
    const idVisite = req.params.idVisite;
    
    if (!idVisite) {
      return res.status(400).send({ error: "ID de visite médicale obligatoire" });
    }
    
    const resultat = await supprimerVisiteMedicale(idVisite);
    
    res.status(200).send({ 
      message: "Visite médicale supprimée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression d'une visite médicale: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - suppression de visite médicale", 
      message: error.message 
    });
  }
});
//_________________________________________________________________________________________________
async function connectDB() {
    try {
      return mysql.createConnection(dbConfig).promise();
    } catch (error) {
      console.error("Erreur de connexion à la base de données:", error);
      throw error;
    }
  }


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
}) 
  