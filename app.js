import express from 'express'
import { 
  getMedecinById,getMedecins,addMedecin,
   getInfirmiers, getAdministratifs,
    getPatients, getNettoyage,getLitsDisponibles,
    getChambresVides,getChambresNonNettoyees,getPatientsRetardSortie
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

//Admin
app.get("/medecins", async (req,res)=>{
    const medecins = await getMedecins()

    res.send(medecins)
})
app.get("/infirmiers", async (req, res) => {
    const infirmiers = await getInfirmiers()
    res.send(infirmiers)
})

app.get("/personnel_administratif", async (req, res) => {
    const personnelAdmin = await getAdministratifs()
    res.send(personnelAdmin)
})
app.get("/personnel_nettoyage",async (req, res) => {
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

//Medecin
app.get("/patient", async (req, res) => {
  const patients = await getPatients()
  res.send(patients)
})

//Infirmiers


//Personnel net
app.get("/chambresNonNettoyees", async (req, res) => {
  const chambres = await getChambresNonNettoyees()
  res.send(chambres)
})

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
  