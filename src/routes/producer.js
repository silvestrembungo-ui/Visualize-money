// Rotas para produtores: criar vídeo (upload/incorporar), enviar comprovativo, dashboard
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { initModels } = require('../models');
const { Op } = require('sequelize');
const fraud = require('../utils/fraud');

const JWT_SECRET = process.env.JWT_SECRET || 'trocar_por_segredo_forte';
const VIEW_COST = Number(process.env.VIEW_COST_KZ || 8);

let modelsCache;
async function models() {
  if (!modelsCache) modelsCache = await initModels();
  return modelsCache;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Sem token' });
  const token = auth.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) { return res.status(401).json({ error: 'Token inválido' }); }
}

// Criar vídeo (incorporar link ou apontar file) com orçamento
router.post('/videos', authMiddleware, async (req, res) => {
  const { title, description, sourceType, sourceUrl, budgetKz } = req.body;
  const { Video, User } = await models();
  const owner = await User.findByPk(req.user.userId);
  if (!owner) return res.status(404).json({ error: 'Usuário não encontrado' });
  // Apenas produtores podem enviar (promover role)
  // Para simplicidade, permitimos todos criarem e ficam pendentes de aprovação.
  const video = await Video.create({
    title, description, sourceType, sourceUrl, ownerId: owner.id, budgetKz: Number(budgetKz || 0), approved: false
  });
  // In production: gerar instruções de pagamento com entidade/ref
  res.json({ ok: true, videoId: video.id, payment: { entity: process.env.PAYMENT_ENTITY, reference: process.env.PAYMENT_REFERENCE } });
});

// Enviar comprovativo (stubs) e aguardar revisão
router.post('/videos/:id/proof', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { proofUrl } = req.body;
  // Em produção, salvar prova e notificar admin para revisar.
  res.json({ ok: true, message: 'Comprovativo recebido, aguardando revisão.' });
});

// Dashboard do produtor: visualizações, gasto, relatórios básicos
router.get('/dashboard', authMiddleware, async (req, res) => {
  const { Video, View } = await models();
  // Apenas videos do usuário
  const videos = await Video.findAll({ where: { ownerId: req.user.userId } });
  // agregações simples
  const dashboard = await Promise.all(videos.map(async v => {
    const views = await View.count({ where: { videoId: v.id, valid: true } });
    return { videoId: v.id, title: v.title, views, budgetKz: v.budgetKz, spentKz: v.spentKz };
  }));
  res.json({ ok: true, videos: dashboard });
});

module.exports = router;
