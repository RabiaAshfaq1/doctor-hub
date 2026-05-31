const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ASSISTANT: 'assistant',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

module.exports = {
  ROLES,
  ROLE_LIST: Object.values(ROLES)
};
