module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // A user has at most one patient profile
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    blood_group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'patients',
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  return Patient;
};
