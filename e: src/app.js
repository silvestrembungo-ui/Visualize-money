// Servidor Express básico com rotas de autenticação, produtor e visualizador.
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { initModels } = require('./models');
const authRoutes = require('./routes/auth');
const producerRoutes = require('./routes/producer');
const viewerRoutes = require('./routes/viewer');

const app = express();
app.use(bodyParser.json());

(async () => {
  const { sequelize } = await initModels();
  // Sincroniza DB (use migrations em produção)
  await sequelize.sync();

  // Rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/producer', producerRoutes);
  app.use('/api/viewer', viewerRoutes);

  // Páginas públicas
  app.use('/privacy-policy', (req, res) => res.sendFile(require('path').resolve('./public/privacy-policy.md')));
  app.use('/terms', (req, res) => res.sendFile(require('path').resolve('./public/terms.md')));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Visualize Money API rodando em http://localhost:${PORT}`));
})();
