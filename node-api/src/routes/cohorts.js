const express = require('express');
const router = express.Router();
const cohortService = require('../services/cohortService');

router.get('/', async (req, res) => {
  try {
    const cohorts = await cohortService.getCohorts(req.query.search || '');
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: err.hint || cohortService.MOODLE_COHORT_HINT,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const cohort = await cohortService.createCohort(req.body);
    res.json(cohort);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: err.hint || cohortService.MOODLE_COHORT_HINT,
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    const cohortids = req.body.cohortids || [];
    if (!cohortids.length) {
      return res.status(400).json({ error: 'No cohort IDs provided' });
    }
    await cohortService.deleteCohorts(cohortids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: err.hint || cohortService.MOODLE_COHORT_HINT,
    });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const cohortStore = require('../services/cohortStore');
    const moodleService = require('../services/moodleService');
    const userids = req.body.userids || [];
    const cohortId = req.params.id;

    if (cohortStore.isLocalId(cohortId)) {
      cohortStore.addMembers(cohortId, userids);
      return res.json({ success: true, source: 'local' });
    }

    await moodleService.addCohortMembers(parseInt(cohortId, 10), userids);
    res.json({ success: true, source: 'moodle' });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: cohortService.MOODLE_COHORT_HINT,
    });
  }
});

module.exports = router;
