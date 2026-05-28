const moodleService = require('./moodleService');

let enrolmentTotalCache = { value: null, ts: 0 };

async function mapPool(items, mapper, concurrency = 6) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function getUserCourseStats(userid) {
  try {
    const courses = await moodleService.request('core_enrol_get_users_courses', {
      userid: parseInt(userid, 10),
      returnusercount: 0,
    });
    const list = Array.isArray(courses) ? courses : [];
    return {
      coursesEnrolled: list.length,
      coursesCompleted: list.filter(c => c.completed === true || c.completed === 1).length,
    };
  } catch {
    return { coursesEnrolled: 0, coursesCompleted: 0 };
  }
}

async function getTotalEnrolments() {
  const now = Date.now();
  if (enrolmentTotalCache.value !== null && now - enrolmentTotalCache.ts < 120000) {
    return enrolmentTotalCache.value;
  }

  let total = 0;
  try {
    const courses = await moodleService.getCourses();
    const visible = (courses || []).filter(c => c.id !== 1);

    await mapPool(
      visible,
      async course => {
        try {
          const enrolled = await moodleService.request('core_enrol_get_enrolled_users', {
            courseid: course.id,
          });
          const count = Array.isArray(enrolled) ? enrolled.length : 0;
          total += count;
        } catch {
          /* skip course */
        }
      },
      4
    );
  } catch {
    total = 0;
  }

  enrolmentTotalCache = { value: total, ts: now };
  return total;
}

function computeStats(users) {
  const now = Math.floor(Date.now() / 1000);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartTs = Math.floor(monthStart.getTime() / 1000);
  const activeThreshold = now - 30 * 86400;

  let inactiveUsers = 0;
  let activeUsers = 0;
  let newUsersThisMonth = 0;

  users.forEach(u => {
    const suspended = u.suspended === 1 || u.suspended === true;
    const lastaccess = u.lastaccess || 0;
    const timecreated = u.timecreated || 0;

    if (suspended || lastaccess === 0 || lastaccess < activeThreshold) {
      inactiveUsers++;
    } else {
      activeUsers++;
    }

    if (timecreated >= monthStartTs) {
      newUsersThisMonth++;
    }
  });

  return {
    totalUsers: users.length,
    inactiveUsers,
    activeUsers,
    newUsersThisMonth,
  };
}

function filterUsers(users, search, searchFields = [], filterByRole = 'all', filters = {}) {
  let filtered = users;
  if (filterByRole && filterByRole !== 'all') {
    filtered = filtered.filter(u => {
      const roleValue = (u.role || '').toString().toLowerCase();
      return roleValue === filterByRole.toLowerCase();
    });
  }

  const normalized = (value) => (value || '').toString().toLowerCase();
  const courseValue = (u) => [
    Array.isArray(u.courses) ? u.courses.map(c => (typeof c === 'string' ? c : c.fullname || c.shortname || '')).join(' ') : '',
    (u.course || ''),
  ].join(' ').toLowerCase();

  filtered = filtered.filter(u => {
    const first = normalized(u.firstname);
    const last = normalized(u.lastname);
    const email = normalized(u.email);
    const full = `${first} ${last}`.trim();
    const username = normalized(u.username);
    const city = normalized(u.city);
    const country = normalized(u.country);
    const role = normalized(u.role);
    const courseText = courseValue(u);

    if (filters.fullName && !full.includes(normalized(filters.fullName))) return false;
    if (filters.email && !email.includes(normalized(filters.email))) return false;
    if (filters.username && !username.includes(normalized(filters.username))) return false;
    if (filters.city && !city.includes(normalized(filters.city))) return false;
    if (filters.country && !country.includes(normalized(filters.country))) return false;
    if (filters.course && !courseText.includes(normalized(filters.course))) return false;
    if (filters.systemRole && !role.includes(normalized(filters.systemRole))) return false;

    if (!search?.trim()) return true;
    const q = search.trim().toLowerCase();
    const fields = Array.isArray(searchFields) && searchFields.length > 0 ? searchFields : ['name', 'email'];

    const checks = [];
    if (fields.includes('name')) checks.push(full, first, last);
    if (fields.includes('email')) checks.push(email);
    if (fields.includes('username')) checks.push(username);
    if (fields.includes('city')) checks.push(city);
    if (fields.includes('country')) checks.push(country);
    if (fields.includes('course')) checks.push(courseText);
    if (fields.includes('role')) checks.push(role);

    return checks.some(value => value.includes(q));
  });

  return filtered;
}

function sortUsers(users, sortBy, sortDir) {
  const dir = sortDir === 'asc' ? 1 : -1;
  const sorted = [...users];

  sorted.sort((a, b) => {
    let av;
    let bv;

    switch (sortBy) {
      case 'firstname':
        av = (a.firstname || '').toLowerCase();
        bv = (b.firstname || '').toLowerCase();
        break;
      case 'lastname':
        av = (a.lastname || '').toLowerCase();
        bv = (b.lastname || '').toLowerCase();
        break;
      case 'lastaccess':
        av = a.lastaccess || 0;
        bv = b.lastaccess || 0;
        break;
      default:
        av = (a.firstname || '').toLowerCase();
        bv = (b.firstname || '').toLowerCase();
    }

    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  return sorted;
}

async function getUsersManagement({ page = 1, limit = 10, search = '', sortBy = 'firstname', sortDir = 'asc', filterByRole = 'all', searchFields = [], filters = {} }) {
  const rawUsers = await moodleService.getUsers();
  const users = (rawUsers || []).filter(
    u => !u.deleted && u.id !== 1 && u.username !== 'guest'
  );

  const statsBase = computeStats(users);
  const totalEnrolments = await getTotalEnrolments();

  const filtered = sortUsers(filterUsers(users, search, searchFields, filterByRole, filters), sortBy, sortDir);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  const enriched = await mapPool(slice, async u => {
    const courseStats = await getUserCourseStats(u.id);
    const suspended = u.suspended === 1 || u.suspended === true;
    const lastaccess = u.lastaccess || 0;
    const activeThreshold = Math.floor(Date.now() / 1000) - 30 * 86400;
    const isActive = !suspended && lastaccess > 0 && lastaccess >= activeThreshold;

    return {
      id: u.id,
      firstname: u.firstname || '',
      lastname: u.lastname || '',
      email: u.email || '',
      username: u.username || '',
      city: u.city || '',
      country: u.country || '',
      role: u.role || '',
      lastaccess,
      suspended,
      timecreated: u.timecreated || 0,
      coursesEnrolled: courseStats.coursesEnrolled,
      coursesCompleted: courseStats.coursesCompleted,
      status: isActive ? 'active' : 'inactive',
    };
  });

  return {
    stats: {
      ...statsBase,
      totalEnrolments,
    },
    users: enriched,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

module.exports = { getUsersManagement };
