const NOTIFICATION_TAGS = [
  '{user_fullname}',
  '{learningpath_name}',
  '{learningpath_startdate}',
  '{learningpath_enddate}',
  '{learningpath_coursesrequired}',
];

function defaultNotifications() {
  return {
    enrollment: {
      enabled: false,
      subject: 'Welcome to {learningpath_name}',
      body: '<p>Hello {user_fullname},</p><p>You have been enrolled in <strong>{learningpath_name}</strong>.</p><p>Start date: {learningpath_startdate}<br/>End date: {learningpath_enddate}</p>',
    },
    expiration: {
      enabled: false,
      subject: 'Learning path expiring soon',
      body: '<p>Hello {user_fullname},</p><p>Your access to <strong>{learningpath_name}</strong> is ending on {learningpath_enddate}.</p>',
    },
    enrollmentReminder: {
      enabled: false,
      subject: 'Enrollment Reminder',
      daysAfterEnrollment: 3,
      body: '<p>Hello {user_fullname},</p><p>This is a reminder about your enrollment in <strong>{learningpath_name}</strong>.</p>',
    },
    expirationReminder: {
      enabled: false,
      subject: 'Expiration Reminder',
      daysBeforeExpiration: 7,
      body: '<p>Hello {user_fullname},</p><p>Your learning path <strong>{learningpath_name}</strong> expires on {learningpath_enddate}. Please complete required courses: {learningpath_coursesrequired}.</p>',
    },
    completionReminder: {
      enabled: false,
      subject: 'Completion Reminder',
      dayFrequency: 7,
      body: '<p>Hello {user_fullname},</p><p>Please continue your progress in <strong>{learningpath_name}</strong>.</p>',
    },
    pathCompletion: {
      enabled: false,
      subject: 'Congratulations — path completed',
      body: '<p>Hello {user_fullname},</p><p>You have completed <strong>{learningpath_name}</strong>. Great work!</p>',
    },
  };
}

function replaceNotificationTags(template, data = {}) {
  if (!template) return '';
  let result = template;
  const map = {
    '{user_fullname}': data.user_fullname || '',
    '{learningpath_name}': data.learningpath_name || '',
    '{learningpath_startdate}': data.learningpath_startdate || '',
    '{learningpath_enddate}': data.learningpath_enddate || '',
    '{learningpath_coursesrequired}': data.learningpath_coursesrequired || '',
  };
  Object.entries(map).forEach(([tag, value]) => {
    result = result.split(tag).join(value);
  });
  return result;
}

module.exports = { NOTIFICATION_TAGS, defaultNotifications, replaceNotificationTags };
