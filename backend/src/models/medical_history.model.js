module.exports = (sequelize, DataTypes) => {
  const MedicalHistory = sequelize.define('MedicalHistory', {
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
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: true // Optional link if created during a specific scheduled appointment
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    updatedAt: false, // Disallow update timestamp
    createdAt: 'created_at',
    tableName: 'medical_history',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_id'] },
      { fields: ['appointment_id'] }
    ],
    hooks: {
      beforeUpdate: () => {
        throw new Error('Database integrity violation: Medical history records are insert-only and cannot be modified.');
      },
      beforeDestroy: () => {
        throw new Error('Database integrity violation: Medical history records are insert-only and cannot be deleted.');
      },
      beforeBulkUpdate: () => {
        throw new Error('Database integrity violation: Medical history records are insert-only and cannot be modified.');
      },
      beforeBulkDestroy: () => {
        throw new Error('Database integrity violation: Medical history records are insert-only and cannot be deleted.');
      }
    }
  });

  return MedicalHistory;
};
