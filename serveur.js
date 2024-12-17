const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const application = express();
const PORT = 5000;

// Middleware
application.use(cors());
application.use(bodyParser.json());

// Connexion à MongoDB Atlas
mongoose
  .connect(
    'mongodb+srv://admin:admin123321@cluster0.n81ze.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
      dbName: 'todolist', // Nom de votre base de données
    }
  )
  .then(() => {
    console.log('Connecté à MongoDB Atlas');
  })
  .catch((erreur) => {
    console.error('Erreur de connexion à MongoDB Atlas :', erreur.message);
  });

// Définir le schéma pour une tâche
const schemaTache = new mongoose.Schema({
  texte: { type: String, required: true },
  terminee: { type: Boolean, default: false },
}); 

const ModeleTache = mongoose.model('Tache', schemaTache);

// Charger la documentation Swagger à partir du fichier YAML
const swaggerDocs = YAML.load('./swagger.yaml');
application.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * API Endpoints
 */
application.get('/taches', async (requete, reponse) => {
  try {
    const taches = await ModeleTache.find();
    reponse.json(taches);
  } catch (erreur) {
    reponse.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
  }
});

application.post('/taches', async (requete, reponse) => {
  try {
    const nouvelleTache = new ModeleTache(requete.body);
    await nouvelleTache.save();
    reponse.json(nouvelleTache);
  } catch (erreur) {
    reponse.status(400).json({ message: 'Erreur lors de la création de la tâche' });
  }
});

application.delete('/taches/:id', async (requete, reponse) => {
  try {
    await ModeleTache.findByIdAndDelete(requete.params.id);
    reponse.json({ message: 'Tâche supprimée' });
  } catch (erreur) {
    reponse.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
  }
});

application.put('/taches/:id', async (requete, reponse) => {
  try {
    const tache = await ModeleTache.findByIdAndUpdate(
      requete.params.id,
      requete.body,
      { new: true }
    );
    reponse.json(tache);
  } catch (erreur) {
    reponse.status(400).json({ message: 'Erreur lors de la mise à jour de la tâche' });
  }
});

// Lancer le serveur
application.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
  console.log(`Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
});
