const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../cohorts.json');

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
}

function getCohorts() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveCohorts(cohorts) {
  fs.writeFileSync(DB_PATH, JSON.stringify(cohorts, null, 2));
}

function createCohort({ name, description = '', idnumber }) {
  const cohorts = getCohorts();
  const safeIdnumber =
    idnumber ||
    `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;

  if (cohorts.some(c => c.idnumber === safeIdnumber)) {
    throw new Error(`A cohort with idnumber "${safeIdnumber}" already exists`);
  }

  const cohort = {
    id: `local_${Date.now()}`,
    name,
    idnumber: safeIdnumber,
    description,
    visible: true,
    memberCount: 0,
    timecreated: Math.floor(Date.now() / 1000),
    source: 'local',
  };

  cohorts.push(cohort);
  saveCohorts(cohorts);
  return cohort;
}

function deleteCohorts(cohortids) {
  const ids = new Set(cohortids.map(String));
  const cohorts = getCohorts().filter(c => !ids.has(String(c.id)));
  saveCohorts(cohorts);
  return { success: true };
}

function isLocalId(id) {
  return String(id).startsWith('local_');
}

module.exports = {
  getCohorts,
  createCohort,
  deleteCohorts,
  isLocalId,
};
