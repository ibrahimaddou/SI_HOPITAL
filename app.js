import express from 'express'
import { getMedecinById,getMedecins,addMedecin } from './configMySql/database.js'

//console.log('DB_USER:', process.env.DB_USER);

const app = express()

app.get("/medecins", async (req,res)=>{
    const medecins = await getMedecins()

    res.send(medecins)
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(3002, () => {
    console.log('server is running on port 3002')
}) 
  