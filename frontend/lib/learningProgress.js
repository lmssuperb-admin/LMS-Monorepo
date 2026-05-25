import { apiUrl } from './apiBase';

export function countCurriculumModules(curriculum) {
  if (!Array.isArray(curriculum)) return 0;
  return curriculum.reduce((sum, topic) => sum + (topic.modules?.length || 0), 0);
}

export function calcProgressPercent(courseProgress, totalModules) {
  if (!totalModules) return 0;
  const done = courseProgress?.completedModules?.length || 0;
  return Math.min(100, Math.round((done / totalModules) * 100));
}

export async function fetchRecommendedIds() {
  try {
    const res = await fetch(apiUrl('/progress/recommended'));
    const data = await res.json();
    return Array.isArray(data) ? data.map(Number) : [];
  } catch {
    return [];
  }
}

export async function fetchUserProgress(userId) {
  if (!userId) return { courses: {} };
  try {
    const res = await fetch(apiUrl(`/progress?userid=${userId}`));
    const data = await res.json();
    if (data?.courses !== undefined) return data;
    return { courses: {} };
  } catch {
    return { courses: {} };
  }
}

export async function trackLearningEvent({
  userId,
  courseId,
  courseName,
  action,
  moduleKey,
  seconds = 0,
  source = 'catalog',
  totalModules = 0,
}) {
  if (!userId || !courseId) return null;
  try {
    const res = await fetch(apiUrl('/progress'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userid: userId,
        courseId,
        courseName,
        action,
        moduleKey,
        seconds,
        source,
        totalModules,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('trackLearningEvent failed', err);
    return null;
  }
}

export function formatActivityTime(iso) {
  if (!iso) return 'Not started';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDurationMinutes(totalSeconds) {
  const mins = Math.max(0, Math.round((totalSeconds || 0) / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function buildModuleKey(topicIndex, modIndex, mod) {
  return `${topicIndex}_${modIndex}_${mod.id || mod.name}`;
}
