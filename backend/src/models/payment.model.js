module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    screenshot_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true // Nullable until verified by assistant/admin
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'verified', 'rejected']]
      }
    }
  }, {
    timestamps: false,
    tableName: 'payments',
    indexes: [
      { fields: ['appointment_id'] },
      { fields: ['verified_by'] },
      { fields: ['status'] }
    ]
  });

  return Payment;
};
