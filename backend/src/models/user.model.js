const { ROLE_LIST, ROLES } = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ROLES.PATIENT,
      validate: {
        isIn: [ROLE_LIST]
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    indexes: [
      { fields: ['role'] }
    ]
  });

  // Helper method to strip password out when returning user JSON
  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.reset_token;
    delete values.reset_token_expires;
    return values;
  };

  return User;
};
