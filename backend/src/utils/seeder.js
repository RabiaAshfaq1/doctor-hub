const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Doctor,
  Patient,
  Assistant,
  Clinic,
  Appointment,
  Payment,
  MedicalHistory,
  Prescription
} = require('../models');
const { ROLES } = require('./constants');

const PASSWORD = 'password123';

/** Find-or-create user + optional profile hook */
async function ensureUser(transaction, { email, name, role, phone }, profileFn) {
  let user = await User.findOne({ where: { email }, transaction });
  if (!user) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);
    user = await User.create(
      { name, email, password_hash: hashedPassword, role, phone },
      { transaction }
    );
    console.log(`  + User: ${email} (${role})`);
    if (profileFn) await profileFn(user);
  }
  return user;
}

const seedData = async () => {
  console.log('Starting comprehensive database seeding...');
  const transaction = await sequelize.transaction();

  try {
    // ─── 1. Admins ───────────────────────────────────────────────
    console.log('\n[Admins]');
    await ensureUser(transaction, {
      email: 'superadmin@doctorhub.com',
      name: 'Jane Doe (Super Admin)',
      role: ROLES.SUPER_ADMIN,
      phone: '111-222-3333'
    });
    await ensureUser(transaction, {
      email: 'admin@doctorhub.com',
      name: 'John Admin',
      role: ROLES.ADMIN,
      phone: '222-333-4444'
    });

    // ─── 2. Doctors ────────────────────────────────────────────
    console.log('\n[Doctors]');
    let doctorSarah;
    await ensureUser(
      transaction,
      {
        email: 'doctor@doctorhub.com',
        name: 'Dr. Sarah Connor',
        role: ROLES.DOCTOR,
        phone: '555-555-5555'
      },
      async (user) => {
        doctorSarah = await Doctor.create(
          {
            user_id: user.id,
            specialization: 'Cardiologist',
            treatment_type: 'allopathic',
            license_no: 'PMC-98765-D',
            bio: 'Experienced clinical cardiologist specializing in non-invasive imaging.',
            is_approved: true,
            consultation_fee: 7500
          },
          { transaction }
        );
      }
    );
    if (!doctorSarah) {
      const u = await User.findOne({ where: { email: 'doctor@doctorhub.com' }, transaction });
      doctorSarah = await Doctor.findOne({ where: { user_id: u.id }, transaction });
    }
    if (doctorSarah && parseFloat(doctorSarah.consultation_fee) < 1000) {
      await doctorSarah.update({ consultation_fee: 7500 }, { transaction });
    }

    let doctorJames;
    await ensureUser(
      transaction,
      {
        email: 'doctor2@doctorhub.com',
        name: 'Dr. James Wilson',
        role: ROLES.DOCTOR,
        phone: '555-555-5556'
      },
      async (user) => {
        doctorJames = await Doctor.create(
          {
            user_id: user.id,
            specialization: 'Neurologist',
            treatment_type: 'allopathic',
            license_no: 'PMC-11223-N',
            bio: 'Neurology specialist focused on migraine and epilepsy care.',
            is_approved: true,
            consultation_fee: 9000
          },
          { transaction }
        );
      }
    );
    if (!doctorJames) {
      const u = await User.findOne({ where: { email: 'doctor2@doctorhub.com' }, transaction });
      doctorJames = await Doctor.findOne({ where: { user_id: u.id }, transaction });
    }
    if (doctorJames && parseFloat(doctorJames.consultation_fee) < 1000) {
      await doctorJames.update({ consultation_fee: 9000 }, { transaction });
    }

    let doctorPending;
    await ensureUser(
      transaction,
      {
        email: 'doctor.pending@doctorhub.com',
        name: 'Dr. Ali Pending',
        role: ROLES.DOCTOR,
        phone: '555-555-5599'
      },
      async (user) => {
        doctorPending = await Doctor.create(
          {
            user_id: user.id,
            specialization: 'General Physician',
            treatment_type: 'homeopathic',
            license_no: 'PMC-PENDING-01',
            bio: 'Awaiting admin approval — use this account to test approvals.',
            is_approved: false,
            consultation_fee: 5000
          },
          { transaction }
        );
      }
    );
    if (!doctorPending) {
      const u = await User.findOne({ where: { email: 'doctor.pending@doctorhub.com' }, transaction });
      doctorPending = await Doctor.findOne({ where: { user_id: u.id }, transaction });
    }
    if (doctorPending && parseFloat(doctorPending.consultation_fee) < 1000) {
      await doctorPending.update({ consultation_fee: 5000 }, { transaction });
    }

    let doctorAyesha;
    await ensureUser(
      transaction,
      {
        email: 'doctor3@doctorhub.com',
        name: 'Dr. Ayesha Khan',
        role: ROLES.DOCTOR,
        phone: '555-555-5557'
      },
      async (user) => {
        doctorAyesha = await Doctor.create(
          {
            user_id: user.id,
            specialization: 'Dermatologist',
            treatment_type: 'herbal',
            license_no: 'PMC-44556-H',
            bio: 'Herbal dermatology and plant-based skin care protocols.',
            is_approved: true,
            consultation_fee: 4500
          },
          { transaction }
        );
      }
    );
    if (!doctorAyesha) {
      const u = await User.findOne({ where: { email: 'doctor3@doctorhub.com' }, transaction });
      doctorAyesha = await Doctor.findOne({ where: { user_id: u.id }, transaction });
      if (doctorAyesha && !doctorAyesha.is_approved) {
        await doctorAyesha.update({ is_approved: true }, { transaction });
      }
    }

    let doctorHina;
    await ensureUser(
      transaction,
      {
        email: 'doctor4@doctorhub.com',
        name: 'Dr. Hina Malik',
        role: ROLES.DOCTOR,
        phone: '555-555-5558'
      },
      async (user) => {
        doctorHina = await Doctor.create(
          {
            user_id: user.id,
            specialization: 'Homeopathic Physician',
            treatment_type: 'homeopathic',
            license_no: 'PMC-77889-H',
            bio: 'Classical homeopathy with chronic care follow-ups.',
            is_approved: true,
            consultation_fee: 5500
          },
          { transaction }
        );
      }
    );
    if (!doctorHina) {
      const u = await User.findOne({ where: { email: 'doctor4@doctorhub.com' }, transaction });
      doctorHina = await Doctor.findOne({ where: { user_id: u.id }, transaction });
      if (doctorHina && !doctorHina.is_approved) {
        await doctorHina.update({ is_approved: true }, { transaction });
      }
    }

    // ─── 3. Clinics ────────────────────────────────────────────
    console.log('\n[Clinics]');
    const clinicDefs = [
      {
        doctor: doctorSarah,
        name: 'City Cardiology & Health',
        address: '12 Mall Road, Gulberg',
        city: 'Lahore',
        timings_json: 'Monday - Friday (09:00 AM - 05:00 PM)'
      },
      {
        doctor: doctorJames,
        name: 'Wilson Neurology Center',
        address: '88 Blue Area, Floor 3',
        city: 'Islamabad',
        timings_json: 'Tuesday - Saturday (10:00 AM - 06:00 PM)'
      },
      {
        doctor: doctorAyesha,
        name: 'Khan Herbal Skin Clinic',
        address: '45 Clifton Block 5',
        city: 'Karachi',
        timings_json: 'Monday - Saturday (11:00 AM - 07:00 PM)'
      },
      {
        doctor: doctorHina,
        name: 'Malik Homeopathy Care',
        address: '22 Model Town Link Road',
        city: 'Lahore',
        timings_json: 'Monday - Friday (10:00 AM - 06:00 PM)'
      }
    ];

    const clinics = {};
    for (const def of clinicDefs) {
      if (!def.doctor) continue;
      let clinic = await Clinic.findOne({
        where: { doctor_id: def.doctor.id, name: def.name },
        transaction
      });
      if (!clinic) {
        const { doctor, ...clinicFields } = def;
        clinic = await Clinic.create(
          { doctor_id: doctor.id, ...clinicFields },
          { transaction }
        );
        console.log(`  + Clinic: ${def.name}`);
      } else {
        const { doctor, ...clinicFields } = def;
        await clinic.update(clinicFields, { transaction });
      }
      clinics[def.doctor.id] = clinic;
    }

    // ─── 4. Assistants ───────────────────────────────────────────
    console.log('\n[Assistants]');
    await ensureUser(
      transaction,
      {
        email: 'assistant@doctorhub.com',
        name: 'Mark Assistant',
        role: ROLES.ASSISTANT,
        phone: '666-666-6666'
      },
      async (user) => {
        const exists = await Assistant.findOne({ where: { user_id: user.id }, transaction });
        if (!exists) {
          await Assistant.create(
            { user_id: user.id, doctor_id: doctorSarah?.id || null },
            { transaction }
          );
        }
      }
    );

    await ensureUser(
      transaction,
      {
        email: 'assistant2@doctorhub.com',
        name: 'Lisa Assistant',
        role: ROLES.ASSISTANT,
        phone: '666-666-6667'
      },
      async (user) => {
        const exists = await Assistant.findOne({ where: { user_id: user.id }, transaction });
        if (!exists) {
          await Assistant.create(
            { user_id: user.id, doctor_id: doctorJames?.id || null },
            { transaction }
          );
        }
      }
    );

    const assistantUser = await User.findOne({
      where: { email: 'assistant@doctorhub.com' },
      transaction
    });

    // ─── 5. Patients ───────────────────────────────────────────
    console.log('\n[Patients]');
    let patientAlice;
    await ensureUser(
      transaction,
      {
        email: 'patient@doctorhub.com',
        name: 'Alice Patient',
        role: ROLES.PATIENT,
        phone: '777-777-7777'
      },
      async (user) => {
        patientAlice = await Patient.create(
          {
            user_id: user.id,
            dob: '1995-08-20',
            blood_group: 'O+',
            allergies: 'Penicillin, Peanuts'
          },
          { transaction }
        );
      }
    );
    if (!patientAlice) {
      const u = await User.findOne({ where: { email: 'patient@doctorhub.com' }, transaction });
      patientAlice = await Patient.findOne({ where: { user_id: u.id }, transaction });
    }

    let patientBob;
    await ensureUser(
      transaction,
      {
        email: 'patient2@doctorhub.com',
        name: 'Bob Patient',
        role: ROLES.PATIENT,
        phone: '777-777-7778'
      },
      async (user) => {
        patientBob = await Patient.create(
          {
            user_id: user.id,
            dob: '1988-03-15',
            blood_group: 'A+',
            allergies: 'None known'
          },
          { transaction }
        );
      }
    );
    if (!patientBob) {
      const u = await User.findOne({ where: { email: 'patient2@doctorhub.com' }, transaction });
      patientBob = await Patient.findOne({ where: { user_id: u.id }, transaction });
    }

    // ─── 6. Appointments & payments ────────────────────────────
    console.log('\n[Appointments & Payments]');
    const clinicSarah = clinics[doctorSarah?.id];
    const clinicJames = clinics[doctorJames?.id];

    const appointmentSeeds = [
      {
        key: 'alice-sarah-completed',
        patient: patientAlice,
        doctor: doctorSarah,
        clinic: clinicSarah,
        scheduled_at: new Date('2026-04-10T10:00:00Z'),
        status: 'completed',
        payment: { status: 'verified', screenshot_url: '/uploads/seed-payment-1.png' }
      },
      {
        key: 'alice-sarah-confirmed',
        patient: patientAlice,
        doctor: doctorSarah,
        clinic: clinicSarah,
        scheduled_at: new Date('2026-05-25T14:00:00Z'),
        status: 'confirmed',
        payment: { status: 'verified', screenshot_url: '/uploads/seed-payment-2.png' }
      },
      {
        key: 'alice-sarah-pending-payment',
        patient: patientAlice,
        doctor: doctorSarah,
        clinic: clinicSarah,
        scheduled_at: new Date('2026-06-15T11:00:00Z'),
        status: 'payment_uploaded',
        payment: { status: 'pending', screenshot_url: '/uploads/seed-payment-3.png' }
      },
      {
        key: 'bob-sarah-pending',
        patient: patientBob,
        doctor: doctorSarah,
        clinic: clinicSarah,
        scheduled_at: new Date('2026-06-20T09:00:00Z'),
        status: 'pending',
        payment: null
      },
      {
        key: 'bob-james-cancelled',
        patient: patientBob,
        doctor: doctorJames,
        clinic: clinicJames,
        scheduled_at: new Date('2026-05-01T16:00:00Z'),
        status: 'cancelled',
        payment: null
      }
    ];

    let completedAppointment = null;

    for (const seed of appointmentSeeds) {
      if (!seed.patient || !seed.doctor || !seed.clinic) continue;

      let appointment = await Appointment.findOne({
        where: {
          patient_id: seed.patient.id,
          doctor_id: seed.doctor.id,
          scheduled_at: seed.scheduled_at
        },
        transaction
      });

      if (!appointment) {
        appointment = await Appointment.create(
          {
            patient_id: seed.patient.id,
            doctor_id: seed.doctor.id,
            clinic_id: seed.clinic.id,
            scheduled_at: seed.scheduled_at,
            status: seed.status
          },
          { transaction }
        );
        console.log(`  + Appointment [${seed.key}]: ${seed.status}`);
      }

      if (seed.key === 'alice-sarah-completed') completedAppointment = appointment;

      if (seed.payment) {
        const existingPayment = await Payment.findOne({
          where: { appointment_id: appointment.id },
          transaction
        });
        if (!existingPayment) {
          await Payment.create(
            {
              appointment_id: appointment.id,
              screenshot_url: seed.payment.screenshot_url,
              status: seed.payment.status,
              verified_by:
                seed.payment.status === 'verified' ? assistantUser?.id || null : null,
              verified_at: seed.payment.status === 'verified' ? new Date() : null
            },
            { transaction }
          );
          console.log(`    + Payment (${seed.payment.status})`);
        }
      }
    }

    // ─── 7. Medical history & prescriptions ────────────────────
    console.log('\n[Medical History & Prescriptions]');
    if (patientAlice && doctorSarah && completedAppointment) {
      let history = await MedicalHistory.findOne({
        where: {
          patient_id: patientAlice.id,
          appointment_id: completedAppointment.id,
          diagnosis: 'Hypertension Stage 1'
        },
        transaction
      });

      if (!history) {
        history = await MedicalHistory.create(
          {
            patient_id: patientAlice.id,
            doctor_id: doctorSarah.id,
            appointment_id: completedAppointment.id,
            diagnosis: 'Hypertension Stage 1',
            notes:
              'Patient reports occasional headaches. BP elevated on visit. Lifestyle changes recommended; follow-up in 4 weeks.'
          },
          { transaction }
        );
        console.log('  + Medical history: Hypertension Stage 1');

        const rxList = [
          {
            medicine_name: 'Amlodipine',
            dosage: '5mg',
            duration: '30 days',
            instructions: 'Take once daily in the morning with water.'
          },
          {
            medicine_name: 'Lisinopril',
            dosage: '10mg',
            duration: '30 days',
            instructions: 'Take once daily; monitor blood pressure weekly.'
          }
        ];

        for (const rx of rxList) {
          const exists = await Prescription.findOne({
            where: { medical_history_id: history.id, medicine_name: rx.medicine_name },
            transaction
          });
          if (!exists) {
            await Prescription.create({ medical_history_id: history.id, ...rx }, { transaction });
            console.log(`    + Prescription: ${rx.medicine_name}`);
          }
        }
      }

      // Standalone history (no appointment link) for richer patient timeline
      let history2 = await MedicalHistory.findOne({
        where: {
          patient_id: patientAlice.id,
          diagnosis: 'Annual wellness check'
        },
        transaction
      });
      if (!history2) {
        history2 = await MedicalHistory.create(
          {
            patient_id: patientAlice.id,
            doctor_id: doctorSarah.id,
            appointment_id: null,
            diagnosis: 'Annual wellness check',
            notes: 'Routine screening. All vitals within normal range.'
          },
          { transaction }
        );
        console.log('  + Medical history: Annual wellness check');
        await Prescription.create(
          {
            medical_history_id: history2.id,
            medicine_name: 'Vitamin D3',
            dosage: '1000 IU',
            duration: '90 days',
            instructions: 'One capsule daily with food.'
          },
          { transaction }
        );
        console.log('    + Prescription: Vitamin D3');
      }
    }

    if (patientBob && doctorJames) {
      let bobHistory = await MedicalHistory.findOne({
        where: { patient_id: patientBob.id, diagnosis: 'Tension headache' },
        transaction
      });
      if (!bobHistory) {
        bobHistory = await MedicalHistory.create(
          {
            patient_id: patientBob.id,
            doctor_id: doctorJames.id,
            appointment_id: null,
            diagnosis: 'Tension headache',
            notes: 'Stress-related headaches. Advised rest and hydration.'
          },
          { transaction }
        );
        console.log('  + Medical history (Bob): Tension headache');
        await Prescription.create(
          {
            medical_history_id: bobHistory.id,
            medicine_name: 'Ibuprofen',
            dosage: '400mg',
            duration: '7 days',
            instructions: 'As needed, max 3 times per day after meals.'
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log('\nAll accounts use password: password123\n');
    console.log('  Super Admin : superadmin@doctorhub.com');
    console.log('  Admin       : admin@doctorhub.com');
    console.log('  Doctor 1    : doctor@doctorhub.com (approved)');
    console.log('  Doctor 2    : doctor2@doctorhub.com (approved)');
    console.log('  Doctor pend.: doctor.pending@doctorhub.com (NOT approved)');
    console.log('  Assistant 1 : assistant@doctorhub.com');
    console.log('  Assistant 2 : assistant2@doctorhub.com');
    console.log('  Patient 1   : patient@doctorhub.com');
    console.log('  Patient 2   : patient2@doctorhub.com');
    console.log('\nSeeded data includes: clinics, appointments (all statuses),');
    console.log('payments (pending + verified), medical history & prescriptions.');
    console.log('========================================\n');
  } catch (error) {
    await transaction.rollback();
    console.error('Database seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => seedData())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

module.exports = seedData;
