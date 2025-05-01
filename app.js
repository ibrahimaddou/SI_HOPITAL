import express from 'express'
import { 
  getMedecinById,getMedecins,addMedecin,getInfirmiers, getAdministratifs,
    getPatients, getNettoyage,getLitsDisponibles,getChambresVides,
    getChambresNonNettoyees,getPatientsRetardSortie,
    getEtatOccupationService,ajouterPatient,ajouterPersonnelAdministratif,
    ajouterPersonnelNettoyage,modifierDateSortiePatient,getSejours,
    ajouterInfirmier,ajouterSejour,getServices,getChambresParService,
    getMedicaments,getChambresANettoyer,enregistrerNettoyage,
    getSoinsAEffectuerByInfirmierId,ajouterAdministrationSoin,getAdministrationSoin,
    supprimerPatient
  } from './configMySql/database.js'
import cors from 'cors'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mysql from 'mysql2'


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
app.get("/litsDisponibles", async (req,res)=>{
  const lits = await getLitsDisponibles()

  res.send(lits)
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
app.put("/modifierDateSortiePatient/:idSejour", modifierDateSortiePatient);

app.post("/sejours", async (req, res) => {
  try {
    const { 
      idPatient, 
      idLit, 
      dateArrivee, 
      dateSortiePrevisionnelle, 
      raisonSejour,
      idAdminAffectation 
    } = req.body;
    
    if (!idPatient || !idLit || !dateArrivee || !raisonSejour || !idAdminAffectation) {
      return res.status(400).send({ 
        error: "L'ID du patient, l'ID du lit, la date d'arrivée, la raison du séjour et l'ID de l'administrateur sont obligatoires" 
      });
    }
    
    const sejour = await ajouterSejour(
      idPatient,
      idLit,
      dateArrivee,
      dateSortiePrevisionnelle,
      raisonSejour,
      idAdminAffectation
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
})

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

app.post("/administrationSoin", async (req, res) => {
  try {
    const { id_soin, id_infirmier, commentaires } = req.body;
    
    if (!id_soin || !id_infirmier) {
      return res.status(400).send({ error: "soin et infirmier sont obligatoires" });
    }
    
    const administrationS = await ajouterAdministrationSoin(id_soin, id_infirmier, commentaires);
    
    res.status(201).send(administrationS);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une administration de soin! ", error);
    res.status(500).send({ error: "Erreur serveur - ajout d'administration de soin" });
  }
});
//Req Delete_______________________________________________________________________________________
app.delete("/supprimerPatients/:idPatient", async (req, res) => {
  try {
    const idPatient = req.params.idPatient;
    
    if (!idPatient) {
      return res.status(400).send({ error: "id de patient obligatoire" });
    }
    
    await supprimerPatient(idPatient);
    
    res.status(200).send({ message: "patient supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un patient: ", error);
    res.status(500).send({ 
      error: "Erreur serveur - suppression de patient", 
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
app.post('/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;
        
        if (!username || !password || !userType) {
          return res.status(400).json({ message: 'Nom d\'utilisateur, mot de passe et type d\'utilisateur requis' });
        }
        
    
        if (!['admin', 'medecin', 'infirmier'].includes(userType)) {
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

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
}) 
  