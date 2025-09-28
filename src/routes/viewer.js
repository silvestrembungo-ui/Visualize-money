// Rotas para visualizadores: listar vídeos aprovados, reportar view, dashboard de ganhos
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { initModels } = require('../models');
const fraud = require('../utils/fraud');

const JWT_SECRET = process.env.JWT_SECRET || 'trocar_por_segredo_forte';
const VIEW_COST = Number(process.env.VIEW_COST_KZ || 8);
const VIEWER_REWARD = Number(process.env.VIEWER_REWARD_KZ || 2);

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

// Listar vídeos aprovados para assistir
router.get('/videos', authMiddleware, async (req, res) => {
  const { Video } = await models();
  const videos = await Video.findAll({ where: { approved: true } });
  res.json({ videos });
});

// Reportar visualização concluída (durationSeconds). Validação de regras de negócio.
router.post('/videos/:id/watch', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { durationSeconds, saved } = req.body; // frontend envia duração assistida em segundos
  const { Video, View, User, Transaction } = await models();

  const video = await Video.findByPk(id);
  if (!video || !video.approved) return res.status(404).json({ error: 'Vídeo não encontrado ou não aprovado' });

  // Regras
  if (durationSeconds < 120) return res.json({ ok: false, reason: 'Assistir pelo menos 2 minutos para ser válida' });

  // fraud detection stub
  const isFraud = fraud.isLikelyFraud(req);
  if (isFraud) return res.json({ ok: false, reason: 'Visualização detectada como fraudulenta' });

  // Limitar 3 vezes seguidas e 2h quando saved
  // Aqui deixamos a verificação simples; em produção precisa de histórico detalhado
  const recentViews = await View.findAll({ where: { videoId: id, userId: req.user.userId }, order: [['createdAt', 'DESC']], limit: 3 });
  if (recentViews.length >= 3 && recentViews.every(v => (new Date() - new Date(v.createdAt)) < (2 * 60 * 60 * 1000))) {
    return res.json({ ok: false, reason: 'Limite de 3 visualizações seguidas atingido' });
  }

  // Marcar view válida
  const view = await View.create({ videoId: id, userId: req.user.userId, durationSeconds, valid: true });
  // Transferir valores: cobrar do produtor (gasta VIEW_COST) e creditar ao visualizador (VIEWER_REWARD)
  // Aqui simplificado: actualizar video.spentKz e user.balanceKz
  video.spentKz = (video.spentKz || 0) + VIEW_COST;
  video.playCount = (video.playCount || 0) + 1;
  await video.save();

  const viewer = await User.findByPk(req.user.userId);
  viewer.balanceKz = (viewer.balanceKz || 0) + VIEWER_REWARD;
  await viewer.save();

  await Transaction.create({ userId: viewer.id, type: 'reward', amountKz: VIEWER_REWARD, meta: { videoId: id } });

  // Nota: em produção deve debitar o produtor e criar transações apropriadas
  res.json({ ok: true, earned: VIEWER_REWARD });
});

// Dashboard do visualizador
router.get('/dashboard', authMiddleware, async (req, res) => {
  const { View, Transaction, User } = await models();
  const views = await View.findAll({ where: { userId: req.user.userId } });
  const transactions = await Transaction.findAll({ where: { userId: req.user.userId } });
  const user = await User.findByPk(req.user.userId);
  res.json({ balanceKz: user.balanceKz, views, transactions });
});

module.exports = router;
