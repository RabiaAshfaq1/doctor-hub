const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');

let sequelize;
if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  });
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models
db.User = require('./user.model')(sequelize, Sequelize);
db.Doctor = require('./doctor.model')(sequelize, Sequelize);
db.Patient = require('./patient.model')(sequelize, Sequelize);
db.Clinic = require('./clinic.model')(sequelize, Sequelize);
db.Assistant = require('./assistant.model')(sequelize, Sequelize);
db.Appointment = require('./appointment.model')(sequelize, Sequelize);
db.Payment = require('./payment.model')(sequelize, Sequelize);
db.MedicalHistory = require('./medical_history.model')(sequelize, Sequelize);
db.Prescription = require('./prescription.model')(sequelize, Sequelize);

// ==========================================
// Define Relationships & Associations
// ==========================================

// 1. User <-> Doctor (1:1)
db.User.hasOne(db.Doctor, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Doctor.belongsTo(db.User, { foreignKey: 'user_id' });

// 2. User <-> Patient (1:1)
db.User.hasOne(db.Patient, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Patient.belongsTo(db.User, { foreignKey: 'user_id' });

// 3. User <-> Assistant (1:1)
db.User.hasOne(db.Assistant, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Assistant.belongsTo(db.User, { foreignKey: 'user_id' });

// 4. Doctor <-> Assistant (1:N)
db.Doctor.hasMany(db.Assistant, { foreignKey: 'doctor_id', onDelete: 'SET NULL' });
db.Assistant.belongsTo(db.Doctor, { foreignKey: 'doctor_id' });

// 5. Doctor <-> Clinic (1:N)
db.Doctor.hasMany(db.Clinic, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });
db.Clinic.belongsTo(db.Doctor, { foreignKey: 'doctor_id' });

// 6. Patient <-> Appointment (1:N)
db.Patient.hasMany(db.Appointment, { foreignKey: 'patient_id', onDelete: 'RESTRICT' });
db.Appointment.belongsTo(db.Patient, { foreignKey: 'patient_id' });

// 7. Doctor <-> Appointment (1:N)
db.Doctor.hasMany(db.Appointment, { foreignKey: 'doctor_id', onDelete: 'RESTRICT' });
db.Appointment.belongsTo(db.Doctor, { foreignKey: 'doctor_id' });

// 8. Clinic <-> Appointment (1:N)
db.Clinic.hasMany(db.Appointment, { foreignKey: 'clinic_id', onDelete: 'RESTRICT' });
db.Appointment.belongsTo(db.Clinic, { foreignKey: 'clinic_id' });

// 9. Appointment <-> Payment (1:1)
db.Appointment.hasOne(db.Payment, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });
db.Payment.belongsTo(db.Appointment, { foreignKey: 'appointment_id' });

// 10. User (verifier) <-> Payment (1:N)
db.User.hasMany(db.Payment, { foreignKey: 'verified_by', as: 'VerifiedPayments', onDelete: 'SET NULL' });
db.Payment.belongsTo(db.User, { foreignKey: 'verified_by', as: 'Verifier' });

// 11. Patient <-> MedicalHistory (1:N)
db.Patient.hasMany(db.MedicalHistory, { foreignKey: 'patient_id', onDelete: 'RESTRICT' });
db.MedicalHistory.belongsTo(db.Patient, { foreignKey: 'patient_id' });

// 12. Doctor <-> MedicalHistory (1:N)
db.Doctor.hasMany(db.MedicalHistory, { foreignKey: 'doctor_id', onDelete: 'RESTRICT' });
db.MedicalHistory.belongsTo(db.Doctor, { foreignKey: 'doctor_id' });

// 13. Appointment <-> MedicalHistory (1:1)
db.Appointment.hasOne(db.MedicalHistory, { foreignKey: 'appointment_id', onDelete: 'SET NULL' });
db.MedicalHistory.belongsTo(db.Appointment, { foreignKey: 'appointment_id' });

// 14. MedicalHistory <-> Prescription (1:N)
db.MedicalHistory.hasMany(db.Prescription, { foreignKey: 'medical_history_id', onDelete: 'CASCADE' });
db.Prescription.belongsTo(db.MedicalHistory, { foreignKey: 'medical_history_id' });

module.exports = db;
