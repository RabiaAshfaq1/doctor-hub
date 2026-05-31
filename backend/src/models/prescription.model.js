module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    medical_history_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    medicine_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    updatedAt: false, // Disallow update timestamp
    createdAt: 'created_at',
    tableName: 'prescriptions',
    indexes: [
      { fields: ['medical_history_id'] }
    ],
    hooks: {
      beforeUpdate: () => {
        throw new Error('Database integrity violation: Prescription records are insert-only and cannot be modified.');
      },
      beforeDestroy: () => {
        throw new Error('Database integrity violation: Prescription records are insert-only and cannot be deleted.');
      },
      beforeBulkUpdate: () => {
        throw new Error('Database integrity violation: Prescription records are insert-only and cannot be modified.');
      },
      beforeBulkDestroy: () => {
        throw new Error('Database integrity violation: Prescription records are insert-only and cannot be deleted.');
      }
    }
  });

  return Prescription;
};
