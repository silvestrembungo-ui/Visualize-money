// Rotas de autenticação: register, login, recuperar senha (stubs)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initModels } = require('../models');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'trocar_por_segredo_forte';

let modelsCache;
async function models() {
  if (!modelsCache) modelsCache = await initModels();
  return modelsCache;
}

// Register: email, phone (Angola), password
router.post('/register', async (req, res) => {
  const { name, email, phone, password, inviteCode } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios' });
  // validar phone para Angola (+244 ou 9xx...), deixar simples aqui
  const { User } = await models();
  const exists = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
  if (exists) return res.status(400).json({ error: 'Usuário já existe' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash, role: 'viewer' });
  // Invites: criar lógica se inviteCode presente
  return res.json({ ok: true, userId: user.id });
});

// Login
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const { User } = await models();
  const user = await User.findOne({ where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, role: user.role });
});

// Recuperar senha (por email ou telefone) - stub: retorna link temporário
router.post('/recover', async (req, res) => {
  const { emailOrPhone } = req.body;
  // Em produção, enviar email ou SMS com token. Aqui apenas responde OK.
  res.json({ ok: true, message: 'Se a conta existir, enviámos instruções para recuperar por email ou SMS.' });
});

module.exports = router;
