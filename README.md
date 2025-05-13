Système d'Information Hospitalier
Ce projet est un prototype de système d'information pour la gestion hospitalière développé dans le cadre du cours de [Nom du cours]. Le système permet la gestion du personnel médical, le suivi des patients, ainsi que la gestion de l'occupation des chambres et des entrées/sorties des patients.
Fonctionnalités principales
Gestion du personnel médical et suivi des patients

Authentification des médecins par mot de passe
Consultation des dossiers patients (antécédents médicaux, visites, soins)
Gestion des visites médicales et des comptes-rendus
Planification et suivi des soins médicaux
Organisation et suivi des réunions médicales
Administration des médicaments par les infirmiers

Gestion de l'occupation des chambres

Consultation des lits disponibles et des chambres vides
Affectation des patients aux chambres
Suivi des entrées et sorties des patients
Planification et enregistrement des nettoyages des chambres
Génération de rapports sur l'occupation des chambres

Technologies utilisées
Backend :

Node.js avec Express.js
MySQL pour la base de données
JWT pour l'authentification

Frontend:

Vue.js
Axios pour les requêtes HTTP
Vue Router pour la navigation

Installation
Prérequis:

Node.js (v14 ou supérieur)
MySQL (v8 ou supérieur)
Vue.JS (3.5.13)

Configuration de la base de données :

Base de données MySQL nommée hopital


Installez les dépendances :
npm install

Démarrez le serveur de développement : npm run dev 

Le serveur nodeJS sera accessible à l'adresse : http://localhost:3002
L'application coté frontend sera accessible à l'adresse : http://localhost:8080

Utilisateurs et rôles
Le système gère quatre types d'utilisateurs, chacun avec ses propres fonctionnalités :

Médecins :

Consultent les dossiers patients
Rédigent des comptes-rendus de visite
Participent aux réunions pour définir les soins


Infirmiers :

Administrent les soins aux patients
Consultent les dossiers patients
Participent aux réunions médicales


Personnel administratif :

Gèrent l'occupation des chambres
Affectent les patients aux lits
Suivent les entrées et sorties


Personnel de nettoyage :

Enregistrent les nettoyages des chambres
Consultent les chambres à nettoyer



Documentation des API
Authentification

POST /login : Connexion d'un utilisateur

Gestion des patients

GET /patients : Liste des patients
GET /patients/:id : Détails d'un patient
POST /patients : Ajout d'un patient
DELETE /supprimerPatients/:idPatient : Suppression d'un patient
GET /patient/dossier/:idPatient : Dossier complet d'un patient

Gestion du personnel

GET /medecins : Liste des médecins
GET /infirmiers : Liste des infirmiers
GET /personnelsAdministratifs : Liste du personnel administratif
GET /personnelsNettoyage : Liste du personnel de nettoyage
POST /medecins : Ajout d'un médecin
POST /infirmiers : Ajout d'un infirmier
POST /personnelsAdministratifs : Ajout d'un personnel administratif
POST /personnelsNettoyage : Ajout d'un personnel de nettoyage

Gestion des chambres et lits

GET /litsDisponibles : Liste des lits disponibles
GET /chambresVides : Liste des chambres vides
GET /chambresNonNettoyees : Liste des chambres non nettoyées
GET /etatOccupationService/:idService/:date : État d'occupation d'un service

Gestion des séjours

GET /sejours : Liste des séjours
POST /sejours : Ajout d'un séjour
PUT /modifierDateSortiePatient/:idSejour : Modification de la date de sortie
DELETE /supprimerSejour/:idSejour : Suppression d'un séjour

Gestion des soins

GET /soins : Liste des soins
GET /soins/:id : Détails d'un soin
POST /soins : Ajout d'un soin
PUT /modifierSoin/:idSoin : Modification d'un soin
DELETE /supprimerSoin/:idSoin : Suppression d'un soin
GET /afficherSoinsPatient/:idPatient : Soins d'un patient

Gestion des visites médicales

GET /afficherVisitesMedicales : Liste des visites médicales
POST /afficherVisitesMedicales : Ajout d'une visite médicale
DELETE /supprimerVisiteMedicale/:idVisite : Suppression d'une visite médicale

Gestion des réunions

GET /reunions : Liste des réunions
POST /reunions : Ajout d'une réunion
DELETE /supprimerReunion/:idReunion : Suppression d'une réunion

Gestion des nettoyages

GET /chambresANettoyer : Liste des chambres à nettoyer
POST /enregistrerNettoyage : Enregistrement d'un nettoyage