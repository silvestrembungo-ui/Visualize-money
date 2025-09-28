// Sequelize models: User, Video, View, Transaction, Invite
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

let sequelize;

async function initModels() {
  const dbFile = process.env.DATABASE_FILE || path.resolve(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
    logging: false
  });

  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING, // validar +244 Angola no frontend
    passwordHash: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'viewer' }, // viewer | producer | admin
    balanceKz: { type: DataTypes.FLOAT, defaultValue: 0 },
    withdrawPin: DataTypes.STRING,
    invitedBy: DataTypes.UUID
  });

  const Video = sequelize.define('Video', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    ownerId: DataTypes.UUID,
    sourceType: DataTypes.STRING, // upload | youtube | facebook | tiktok
    sourceUrl: DataTypes.STRING,
    budgetKz: { type: DataTypes.FLOAT, defaultValue: 0 },
    spentKz: { type: DataTypes.FLOAT, defaultValue: 0 },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    playCount: { type: DataTypes.INTEGER, defaultValue: 0 }
  });

  const View = sequelize.define('View', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    videoId: DataTypes.UUID,
    userId: DataTypes.UUID,
    durationSeconds: DataTypes.INTEGER,
    valid: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
  }, { timestamps: true, updatedAt: false });

  const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: DataTypes.UUID,
    type: DataTypes.STRING, // deposit, spend, reward, withdraw
    amountKz: DataTypes.FLOAT,
    meta: DataTypes.JSON
  });

  const Invite = sequelize.define('Invite', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    inviterId: DataTypes.UUID,
    inviteeId: DataTypes.UUID,
    startDate: DataTypes.DATE,
    monthsLeft: DataTypes.INTEGER
  });

  // Associações simples
  User.hasMany(Video, { foreignKey: 'ownerId' });
  Video.belongsTo(User, { foreignKey: 'ownerId' });

  Video.hasMany(View, { foreignKey: 'videoId' });
  View.belongsTo(Video, { foreignKey: 'videoId' });

  User.hasMany(View, { foreignKey: 'userId' });
  View.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Transaction, { foreignKey: 'userId' });

  return { sequelize, User, Video, View, Transaction, Invite };
}

module.exports = { initModels };
