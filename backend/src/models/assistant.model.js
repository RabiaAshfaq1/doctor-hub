module.exports = (sequelize, DataTypes) => {
  const Assistant = sequelize.define('Assistant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // A user has at most one assistant profile
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: true // Can be assigned or changed by doctor/admin later
    }
  }, {
    timestamps: false,
    tableName: 'assistants'
  });

  return Assistant;
};
