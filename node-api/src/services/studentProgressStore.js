const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../student-progress.json');
const RECOMMENDED_PATH = path.join(__dirname, '../../recommended-courses.json');

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
}

function readAll() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeAll(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUserProgress(userid) {
  const all = readAll();
  const key = String(userid);
  if (!all[key]) {
    all[key] = { courses: {} };
  }
  return all[key];
}

function saveUserProgress(userid, userData) {
  const all = readAll();
  all[String(userid)] = userData;
  writeAll(all);
}

function moduleKey(topicIndex, modIndex, mod) {
  return `${topicIndex}_${modIndex}_${mod.id || mod.name}`;
}

function getRecommendedIds() {
  try {
    if (fs.existsSync(RECOMMENDED_PATH)) {
      const ids = JSON.parse(fs.readFileSync(RECOMMENDED_PATH, 'utf8'));
      if (Array.isArray(ids) && ids.length) return ids.map(Number).filter(Boolean);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function setRecommendedIds(ids) {
  fs.writeFileSync(RECOMMENDED_PATH, JSON.stringify(ids.map(Number).filter(Boolean), null, 2));
}

function recordEvent(userid, payload) {
  const {
    courseId,
    courseName = '',
    action,
    moduleKey: mk,
    seconds = 0,
    source = 'catalog',
    totalModules = 0,
  } = payload;

  const user = getUserProgress(userid);
  const cid = String(courseId);
  const now = new Date().toISOString();

  if (!user.courses[cid]) {
    user.courses[cid] = {
      courseId: Number(courseId),
      courseName,
      startedAt: now,
      lastActivityAt: now,
      completedAt: null,
      source,
      timeSpentSeconds: 0,
      completedModules: [],
      moduleTimes: {},
    };
  }

  const course = user.courses[cid];
  if (courseName) course.courseName = courseName;
  course.lastActivityAt = now;

  if (action === 'start') {
    course.startedAt = course.startedAt || now;
    if (source) course.source = source;
    if (totalModules > 0) course.totalModules = totalModules;
  }

  if (action === 'view_module' && mk) {
    if (!course.moduleTimes[mk]) {
      course.moduleTimes[mk] = { startedAt: now, completedAt: null, seconds: 0 };
    }
    course.moduleTimes[mk].lastViewedAt = now;
    if (seconds > 0) {
      course.timeSpentSeconds += seconds;
      course.moduleTimes[mk].seconds += seconds;
    }
  }

  if (action === 'complete_module' && mk) {
    if (!course.completedModules.includes(mk)) {
      course.completedModules.push(mk);
    }
    if (!course.moduleTimes[mk]) {
      course.moduleTimes[mk] = { startedAt: now, completedAt: null, seconds: 0 };
    }
    course.moduleTimes[mk].completedAt = now;
    if (seconds > 0) {
      course.timeSpentSeconds += seconds;
      course.moduleTimes[mk].seconds += seconds;
    }
    if (course.totalModules > 0 && course.completedModules.length >= course.totalModules) {
      course.completedAt = course.completedAt || now;
    }
  }

  saveUserProgress(userid, user);
  return user;
}

function setCourseProgressPercent(userid, courseId, totalModules, completedCount) {
  const user = getUserProgress(userid);
  const cid = String(courseId);
  if (!user.courses[cid]) return user;
  const course = user.courses[cid];
  course.totalModules = totalModules;
  course.completedCount = completedCount;
  if (totalModules > 0 && completedCount >= totalModules) {
    course.completedAt = course.completedAt || new Date().toISOString();
  }
  saveUserProgress(userid, user);
  return user;
}

module.exports = {
  getUserProgress,
  recordEvent,
  getRecommendedIds,
  setRecommendedIds,
  moduleKey,
  setCourseProgressPercent,
};
