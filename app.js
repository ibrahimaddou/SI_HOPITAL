import express from 'express'
import { getMedecinById,getMedecins,addMedecin } from './configMySql/database.js'
import cors from 'cors'
//console.log('DB_USER:', process.env.DB_USER); 

const app = express()
const PORT = 3002;

app.use(cors());
app.use(express.json())

//exemple de route vers vuejs envoie des données des medecins au front
app.get('/api/data',(req, res) => {
    res.json({message:'Données du backend'});
})


app.get("/medecins", async (req,res)=>{
    const medecins = await getMedecins()

    res.send(medecins)
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

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
}) 
  