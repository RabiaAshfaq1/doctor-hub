module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    clinic_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'cancelled', 'completed']]
      }
    }
  }, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    tableName: 'appointments',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_id'] },
      { fields: ['clinic_id'] },
      { fields: ['status'] },
      { fields: ['scheduled_at'] }
    ]
  });

  return Appointment;
};
