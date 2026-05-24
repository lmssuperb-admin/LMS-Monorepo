const moodleService = require('./moodleService');
const cohortStore = require('./cohortStore');

const MOODLE_COHORT_HINT =
  'Enable these on your Moodle external service token: core_cohort_get_cohorts, core_cohort_create_cohorts, core_cohort_delete_cohorts, core_cohort_get_cohort_members.';

function isMoodleAccessError(err) {
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('access control') ||
    msg.includes('accessexception') ||
    msg.includes('invalid token') ||
    msg.includes('nopermissions') ||
    msg.includes('web service')
  );
}

function shouldUseLocalOnly() {
  return (process.env.COHORT_PROVIDER || 'auto').toLowerCase() === 'local';
}

function shouldTryMoodle() {
  const mode = (process.env.COHORT_PROVIDER || 'auto').toLowerCase();
  return mode === 'moodle' || mode === 'auto';
}

async function getCohorts(search = '') {
  if (shouldUseLocalOnly()) {
    return filterCohorts(cohortStore.getCohorts(), search);
  }

  let moodleCohorts = [];
  let moodleFailed = false;

  if (shouldTryMoodle()) {
    try {
      moodleCohorts = await moodleService.getCohorts(search);
    } catch (err) {
      if (!isMoodleAccessError(err)) throw err;
      moodleFailed = true;
    }
  }

  const localCohorts = filterCohorts(cohortStore.getCohorts(), search);
  const merged = mergeCohorts(moodleCohorts, localCohorts);

  if (moodleFailed && merged.length === 0 && localCohorts.length === 0) {
    const err = new Error('Access control exception');
    err.hint = MOODLE_COHORT_HINT;
    err.fallbackAvailable = true;
    throw err;
  }

  return merged;
}

async function createCohort(data) {
  if (shouldUseLocalOnly()) {
    return cohortStore.createCohort(data);
  }

  if (shouldTryMoodle()) {
    try {
      const cohort = await moodleService.createCohort(data);
      return { ...cohort, source: 'moodle' };
    } catch (err) {
      if (!isMoodleAccessError(err)) throw err;
      // Fall through to local store
      const local = cohortStore.createCohort(data);
      local._warning =
        'Saved locally because Moodle denied access. Enable cohort webservice functions to sync with Moodle.';
      return local;
    }
  }

  return cohortStore.createCohort(data);
}

async function deleteCohorts(cohortids) {
  const ids = (cohortids || []).map(String);
  const localIds = ids.filter(id => cohortStore.isLocalId(id));
  const moodleIds = ids.filter(id => !cohortStore.isLocalId(id)).map(id => parseInt(id, 10)).filter(Boolean);

  if (localIds.length) {
    cohortStore.deleteCohorts(localIds);
  }

  if (moodleIds.length && shouldTryMoodle()) {
    try {
      await moodleService.deleteCohorts(moodleIds);
    } catch (err) {
      if (!isMoodleAccessError(err)) throw err;
      if (localIds.length === 0) {
        const e = new Error('Access control exception');
        e.hint = MOODLE_COHORT_HINT;
        throw e;
      }
    }
  }

  return { success: true };
}

function filterCohorts(list, search) {
  if (!search) return list;
  const q = search.toLowerCase();
  return list.filter(
    c =>
      c.name?.toLowerCase().includes(q) ||
      c.idnumber?.toLowerCase().includes(q)
  );
}

function mergeCohorts(moodleList, localList) {
  const byKey = new Map();
  [...moodleList, ...localList].forEach(c => {
    const key = (c.idnumber || c.name || '').toLowerCase();
    if (!byKey.has(key)) byKey.set(key, c);
  });
  return Array.from(byKey.values());
}

module.exports = {
  getCohorts,
  createCohort,
  deleteCohorts,
  MOODLE_COHORT_HINT,
};
