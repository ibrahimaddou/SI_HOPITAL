import express from 'express'
import { getMedecinById,getMedecins,addMedecin } from './configMySql/database.js'

//console.log('DB_USER:', process.env.DB_USER); 

const app = express()
app.use(express.json())

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

app.listen(3002, () => {
    console.log('server is running on port 3002')
}) 
  