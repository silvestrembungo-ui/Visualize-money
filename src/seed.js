// Seed inicial: cria admin com credenciais do .env
require('dotenv').config();
const bcrypt = require('bcrypt');
const { initModels } = require('./models');

(async () => {
  const { sequelize, User } = await initModels();
  await sequelize.sync();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin';

  if (!adminEmail || !adminPassword) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');
    process.exit(1);
  }

  const existing = await User.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin já existe:', adminEmail);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'admin',
    balanceKz: 0
  });

  console.log('Admin criado:', adminEmail);
  process.exit(0);
})();
