module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // A user has at most one doctor profile
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    treatment_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['allopathic', 'homeopathic', 'herbal']]
      }
    },
    license_no: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    timestamps: false,
    tableName: 'doctors',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['specialization'] },
      { fields: ['treatment_type'] },
      { fields: ['is_approved'] }
    ]
  });

  return Doctor;
};
