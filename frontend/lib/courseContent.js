/** Static demo curriculum when API course id is invalid or unavailable */
export const STATIC_DEMO_CURRICULUM = [
  {
    name: 'Course content',
    modules: [
      { name: 'Course overview', modname: 'resource', url: '/Posh_Policy.pdf' },
      { name: 'Policy handout', modname: 'resource', url: '/Posh_Forms.pdf' },
      { name: 'Live session', modname: 'zoom', url: 'https://zoom.us/' },
      { name: 'Knowledge check', modname: 'quiz', url: '#' },
    ],
  },
];

export function isNumericCourseId(id) {
  return /^\d+$/.test(String(id));
}

export function normalizeCurriculumSections(data, fallbackName = 'Course') {
  if (!Array.isArray(data) || data.length === 0) return STATIC_DEMO_CURRICULUM;

  return data.map(section => ({
    ...section,
    name: section.name || fallbackName,
    modules: (section.modules || [])
      .filter(m => m.name?.toLowerCase() !== 'announcements' && m.modname !== 'forum')
      .map(m => {
        const url = m.externalurl || m.url || '';
        const lowUrl = url.toLowerCase();
        if (m.modname === 'url' && (lowUrl.endsWith('.pdf') || lowUrl.includes('pluginfile.php'))) {
          return { ...m, modname: 'resource' };
        }
        if (m.modname === 'url' && (lowUrl.endsWith('.mp4') || lowUrl.endsWith('.mov') || lowUrl.endsWith('.webm'))) {
          return { ...m, modname: 'video' };
        }
        return m;
      }),
  }));
}
