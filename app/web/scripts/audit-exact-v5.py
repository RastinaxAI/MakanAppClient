"""Audit the supplied matrix against product files, never against the atlas renderer.

Run from web/. Mapping is deliberately separate from state and visual verification.
The original matrix and public review remain unchanged under inputs/.
"""

import csv
import json
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[1]
folder = root / 'docs/design/exact-v1'
reference = json.loads((root / 'design/responsive-reference.json').read_text())
screens = {s['scenario_id']: s for s in reference['screens']}
with (folder / 'inputs/screen-route-matrix.csv').open(encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

# Explicit product component families. A family match is not proof of a state.
families = {}


def bind(ids, path):
    for id in ids:
        families[id] = 'src/features/' + path + '.tsx'


def mk(start, end):
    return [f'MK-{n:02}' for n in range(start, end + 1)]


bind(['MK-01'], 'auth/welcome')
bind(['MK-02', 'MK-03'] + mk(332, 334), 'auth/login')
bind(['MK-04', 'MK-07', 'MK-08', 'MK-09', 'MK-59'], 'reference/connected-school')
bind(['MK-83', 'MK-84'], 'auth/workspace-selection')
bind(['MK-85'] + mk(110, 112), 'personal/school/invitations')
bind(mk(86, 87) + ['MK-443', 'MK-455'], 'personal/school/manager-class-cards')
bind(['MK-88'], 'personal/school/class-detail')
bind(['MK-89', 'MK-91'], 'personal/school/catalog')
bind(['MK-90', 'MK-93', 'MK-94', 'MK-98', 'MK-99', 'MK-101', 'MK-102', 'MK-114', 'MK-150', 'MK-151', 'MK-152'], 'personal/school/creation-pages')
bind(mk(92, 94), 'personal/school/creation-pages')
bind(mk(95, 97), 'personal/school/class-settings')
bind(['MK-100', 'MK-103'], 'personal/school/creation-pages')
bind(mk(104, 106), 'personal/school/person-records')
bind(mk(107, 109), 'personal/school/member-directory')
bind(mk(113, 115), 'personal/school/manager')
bind(mk(116, 118), 'personal/school/parent-daily')
bind(mk(119, 121) + mk(128, 130) + ['MK-444', 'MK-456'], 'personal/school/schedule')
bind(mk(122, 123), 'personal/school/creation-pages')
bind(mk(124, 127), 'personal/school/session-page')
bind(mk(131, 133), 'personal/school/schedule-rules')
bind(mk(134, 139) + ['MK-05', 'MK-445', 'MK-457'], 'personal/school/lessons')
bind(mk(140, 142), 'personal/school/learning')
bind(mk(143, 145) + ['MK-06'], 'personal/school/submission-flow')
bind(mk(146, 148) + ['MK-458'], 'personal/school/assignment-evaluation')
bind(mk(149, 154), 'personal/school/exams')
bind(mk(155, 157), 'personal/school/exam-taking')
bind(mk(158, 160) + ['MK-459'], 'personal/school/exam-grading')
bind(['MK-161', 'MK-162'], 'personal/school/learning-reports')
bind(['MK-163', 'MK-169', 'MK-467'], 'personal/school/manager-reports')
bind(mk(164, 166), 'personal/school/report-export')
bind(['MK-167'], 'personal/school/official-spaces')
bind(['MK-168'], 'personal/messaging/academic-activity')
bind(['MK-35', 'MK-51'] + mk(170, 172) + mk(182, 187) + ['MK-460'], 'personal/messaging/messenger')
bind(mk(173, 175), 'personal/messaging/folders')
bind(mk(176, 178) + ['MK-181'], 'personal/messaging/contacts')
bind(['MK-36', 'MK-179'] + mk(227, 232) + mk(266, 271) + ['MK-446'], 'personal/messaging/conversation-room')
bind(['MK-37'] + mk(233, 235) + mk(254, 256) + mk(260, 265) + ['MK-448'], 'personal/messaging/message-actions')
bind(['MK-180'] + mk(194, 205) + mk(257, 258) + ['MK-447'], 'personal/messaging/conversation-pages')
bind(mk(188, 193), 'personal/messaging/create')
bind(mk(206, 211) + ['MK-461'], 'personal/messaging/management')
bind(mk(212, 214), 'personal/messaging/received-invitations')
bind(mk(215, 217) + ['MK-219'], 'personal/messaging/invite-links')
bind(['MK-218', 'MK-220', 'MK-221', 'MK-222'], 'personal/messaging/join')
bind(['MK-223'], 'personal/account-help')
bind(mk(224, 226), 'personal/messaging/topics')
bind(mk(236, 241), 'personal/messaging/media')
bind(mk(242, 253), 'personal/messaging/rich-messages')
bind(['MK-49', 'MK-259', 'MK-341', 'MK-342', 'MK-343'], 'personal/messaging/privacy')
bind(['MK-10', 'MK-11', 'MK-50', 'MK-53'], 'extracurricular/connected')
bind(['MK-12', 'MK-17', 'MK-18'] + mk(272, 274) + ['MK-282', 'MK-283', 'MK-289'], 'extracurricular/formation')
bind(mk(13, 16) + ['MK-58'] + mk(275, 281), 'extracurricular/connected')
bind(mk(20, 34) + mk(54, 57) + mk(290, 322) + mk(449, 451) + ['MK-462'], 'extracurricular/class-management')
bind(mk(44, 46) + mk(60, 82) + mk(323, 331), 'extracurricular/learning')
bind(['MK-38', 'MK-39', 'MK-40', 'MK-52'] + mk(365, 376) + ['MK-453', 'MK-466'], 'reference/connected-assistant')
bind(['MK-41', 'MK-42', 'MK-43'] + mk(356, 364) + ['MK-452', 'MK-465'], 'personal/sources/catalog')
bind(['MK-47'], 'reference/connected-profile')
bind(['MK-48'] + mk(350, 352), 'personal/security-devices')
bind(['MK-335', 'MK-336', 'MK-337'], 'personal/profile-edit')
bind(['MK-338', 'MK-339'], 'personal/settings')
bind(['MK-340'], 'personal/reading')
bind(mk(344, 349), 'personal/notification-settings')
bind(['MK-344'], 'personal/notifications')
bind(mk(353, 355) + mk(440, 442), 'personal/account-help')
bind(mk(377, 379), 'reference/connected-assistant')
bind(mk(380, 388) + ['MK-454'], 'personal/commerce')

overrides = {
    'MK-89': '/personal/education/periods',
    'MK-90': '/personal/education/periods/new',
    'MK-164': '/personal/education/reports',
    'MK-165': '/personal/education/reports?export={jobId}',
    'MK-166': '/personal/education/reports?export={jobId}',
    'MK-95': '/personal/education/classes/{classId}?tab=settings',
    'MK-96': '/personal/education/classes/{classId}?tab=settings',
    'MK-97': '/personal/education/classes/{classId}?tab=settings',
    'MK-93': '/personal/education/classes/new?step=details',
    'MK-94': '/personal/education/classes/new?step=review',
    'MK-98': '/personal/education/classes/{classId}/members',
    'MK-99': '/personal/education/classes/{classId}/enrollments/new',
    'MK-100': '/personal/education/classes/{classId}/members',
    'MK-101': '/personal/education/classes/{classId}/members',
    'MK-102': '/personal/education/classes/{classId}/teachers/new',
    'MK-103': '/personal/education/classes/{classId}/members',
    'MK-106': '/personal/education/people/{personId}',
    'MK-125': '/personal/education/sessions/{sessionId}/edit',
    'MK-134': '/personal/education/classes/{classId}/lessons/new',
    'MK-135': '/personal/education/lessons/{lessonId}/edit',
    'MK-136': '/personal/education/lessons/{lessonId}/review',
    'MK-141': '/personal/education/classes/{classId}/assignments/new',
    'MK-142': '/personal/education/classes/{classId}/assignments/new',
    'MK-144': '/personal/education/assignments/{assignmentId}/history',
    'MK-145': '/personal/education/assignments/{assignmentId}/receipt',
    'MK-146': '/personal/education/evaluations',
    'MK-150': '/personal/education/classes/{classId}/exams/new',
    'MK-152': '/personal/education/exams/{examId}/questions/new',
    'MK-154': '/personal/education/exams/{examId}/review',
    'MK-158': '/personal/education/exams/{examId}/grading',
    'MK-195': '/personal/messages/{conversationId}/edit',
    'MK-198': '/personal/messages/{conversationId}/edit',
    'MK-213': '/personal/invitations',
    'MK-214': '/personal/invitations',
    'MK-215': '/personal/messages/{conversationId}/invites?view=new',
    'MK-219': '/personal/messages/{conversationId}/invites?view=requests',
    'MK-220': '/personal/messages/join',
    'MK-340': '/personal/settings/reading',
    'MK-357': '/personal/resources/{resourceId}',
    'MK-359': '/personal/resources?upload=1',
}

# Shared scenarios are states of these real components, not synthetic routes.
shared = {
    'MK-419': ('personal/school/manager', '/personal/education/classes'),
    'MK-420': ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    'MK-421': ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/members'),
    'MK-422': ('personal/school/manager', '/personal/education/classes'),
    'MK-423': ('personal/messaging/messenger', '/personal/messages'),
    'MK-424': ('extracurricular/connected', '/personal/extracurricular'),
    'MK-425': ('personal/school/workflow', '/personal/education/classes/new'),
    'MK-426': ('personal/school/manager', '/personal/education/classes'),
    'MK-427': ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}'),
    'MK-428': ('personal/school/class-settings', '/personal/education/classes/{classId}?tab=settings'),
    'MK-429': ('extracurricular/connected', '/personal/extracurricular/requests/new?step=review'),
    'MK-430': ('personal/school/workflow', '/personal/education/classes/new'),
    'MK-431': ('personal/school/session-page', '/personal/education/sessions/{sessionId}/edit'),
    'MK-432': ('personal/school/submission-files', '/personal/education/assignments/{assignmentId}/answer'),
    'MK-433': ('personal/school/member-directory', '/personal/education/members'),
    'MK-434': ('personal/school/submission-files', '/personal/education/assignments/{assignmentId}/answer'),
    'MK-435': ('personal/notification-settings', '/personal/settings/notifications'),
    'MK-436': ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    'MK-437': ('auth/login', '/enter'),
    'MK-438': ('personal/messaging/join', '/personal/messages/join'),
    'MK-439': ('personal/messaging/join', '/personal/messages/join'),
}
rx = {
    1: ('personal/shell', '/personal/education'),
    2: ('personal/school/search', '/personal/education/search'),
    3: ('personal/school/workflow', '/personal/education/classes/new'),
    4: ('personal/school/manager-class-cards', '/personal/education/classes'),
    5: ('personal/profile-edit', '/personal/profile/edit'),
    6: ('personal/workspaces', '/personal/workspaces'),
    7: ('personal/school/manager-class-cards', '/personal/education/classes'),
    8: ('personal/school/workflow', '/personal/education/classes/new'),
    9: ('personal/school/session-page', '/personal/education/sessions/{sessionId}'),
    10: ('personal/school/session-page', '/personal/education/sessions/{sessionId}'),
    11: ('personal/school/schedule', '/personal/education/schedule'),
    12: ('personal/school/submission-flow', '/personal/education/assignments/{assignmentId}/answer'),
    13: ('personal/school/submission-files', '/personal/education/assignments/{assignmentId}/answer'),
    14: ('personal/school/assignment-evaluation', '/personal/education/submissions/{attemptId}/evaluate'),
    15: ('personal/school/exam-taking', '/personal/education/exams/{examId}'),
    16: ('personal/school/exam-taking', '/personal/education/exams/{examId}'),
    17: ('personal/school/manager-reports', '/personal/education/reports'),
    18: ('personal/school/parent-workspace', '/personal/education'),
    19: ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    20: ('personal/messaging/message-actions', '/personal/messages/{conversationId}'),
    21: ('personal/messaging/message-actions', '/personal/messages/{conversationId}'),
    22: ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    23: ('personal/messaging/media', '/personal/messages/{conversationId}'),
    24: ('personal/messaging/media', '/personal/messages/{conversationId}/media'),
    25: ('personal/messaging/message-actions', '/personal/messages/{conversationId}'),
    26: ('personal/messaging/conversation-room', '/personal/messages/{conversationId}?q={query}'),
    27: ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    28: ('personal/messaging/rich-messages', '/personal/messages/{conversationId}'),
    29: ('personal/messaging/live', '/personal/messages/{conversationId}'),
    30: ('personal/messaging/conversation-room', '/personal/messages/{conversationId}'),
    31: ('extracurricular/class-management', '/personal/extracurricular/invitations'),
    32: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/members'),
    33: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/members'),
    34: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/members'),
    35: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/setup'),
    36: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/setup'),
    37: ('extracurricular/class-management', '/personal/extracurricular/classes/{classId}/info'),
    38: ('extracurricular/learning', '/personal/extracurricular/classes/{classId}/evaluations'),
    39: ('personal/security-devices', '/personal/settings/devices'),
    40: ('personal/notification-settings', '/personal/settings/notifications'),
    41: ('personal/settings', '/personal/settings/appearance'),
    42: ('personal/profile-edit', '/personal/profile/edit'),
    43: ('personal/sources/catalog', '/personal/resources/{resourceId}'),
    44: ('reference/connected-assistant', '/personal/assistant'),
}
for number, (source, route) in rx.items():
    shared[f'RX-{number:03}'] = (source, route)

components = {
    50: 'components/ui/button', 51: 'components/v4/page',
    52: 'features/personal/school/directory', 53: 'features/personal/school/search',
    54: 'features/personal/school/manager-class-cards', 55: 'features/personal/school/shared',
    56: 'components/ui/jalali-date-input', 57: 'components/hooks/use-unsaved-changes',
    58: 'components/ui/states', 59: 'components/ui/states',
    60: 'features/personal/messaging/message-actions', 61: 'components/ui/states',
}
for number, source in components.items():
    families[f'RX-{number:03}'] = 'src/' + source + '.tsx'
    overrides[f'RX-{number:03}'] = '/personal/education/classes'
for id, (source, route) in shared.items():
    bind([id], source)
    overrides[id] = route

# Router-selected implementations take precedence over broad family ranges.
bind(['MK-90', 'MK-93', 'MK-94', 'MK-98', 'MK-99', 'MK-100', 'MK-101', 'MK-102', 'MK-103', 'MK-114', 'MK-150', 'MK-151', 'MK-152'], 'personal/school/creation-pages')
bind(['MK-98', 'MK-101'], 'personal/school/class-members')
bind(['MK-100', 'MK-103'], 'personal/school/directory')
bind(['MK-135'], 'personal/school/lessons')
bind(['MK-142'], 'personal/school/learning')
bind(['MK-153'], 'personal/school/exams')
bind(['MK-154'], 'personal/school/exam-review')
bind(['MK-156', 'MK-157'], 'personal/school/exam-taking')
component_names = {
    'MK-89': 'SchoolCatalog', 'MK-90': 'CatalogCreatePage', 'MK-91': 'SchoolCatalog',
    'MK-92': 'ClassCreatePage', 'MK-93': 'ClassCreatePage', 'MK-94': 'ClassCreatePage',
    'MK-95': 'ClassSettings', 'MK-96': 'ClassSettings', 'MK-97': 'ClassSettings',
    'MK-98': 'ClassMembersOverview', 'MK-99': 'ClassMembersPage', 'MK-100': 'ClassRoster',
    'MK-101': 'ClassMembersOverview', 'MK-102': 'ClassMembersPage', 'MK-103': 'ClassRoster',
    'MK-104': 'People', 'MK-105': 'PersonFormPage', 'MK-106': 'PersonDetailPage',
    'MK-107': 'MemberDirectory', 'MK-108': 'MemberDirectory', 'MK-109': 'MemberDirectory',
    'MK-110': 'InvitationsPage', 'MK-111': 'InvitationsPage', 'MK-112': 'InvitationsPage',
    'MK-113': 'Guardians', 'MK-114': 'GuardianCreatePage', 'MK-115': 'Guardians',
    'MK-122': 'SessionCreatePage', 'MK-123': 'SessionCreatePage',
    'MK-124': 'SessionPage', 'MK-125': 'SessionPage', 'MK-126': 'SessionPage', 'MK-127': 'SessionPage',
    'MK-131': 'ScheduleRules', 'MK-132': 'ScheduleRules', 'MK-133': 'ScheduleRules',
    'MK-134': 'LessonFormPage', 'MK-135': 'LessonFormPage', 'MK-136': 'LessonDetail',
    'MK-137': 'ResourcesClasses', 'MK-138': 'LessonDetail', 'MK-139': 'LessonDetail',
    'MK-140': 'Assignments', 'MK-141': 'AssignmentFormPage', 'MK-142': 'AssignmentFormPage',
    'MK-146': 'AssignmentEvaluationQueue', 'MK-147': 'AssignmentEvaluationPage', 'MK-148': 'AssignmentEvaluationPage',
    'MK-150': 'ExamCreatePage', 'MK-151': 'ExamCreatePage', 'MK-152': 'QuestionCreatePage',
    'MK-154': 'ExamReviewPage', 'MK-158': 'ExamGradingQueue', 'MK-159': 'ExamGradingPage', 'MK-160': 'ExamGradingPage',
    'MK-161': 'LearningReports', 'MK-162': 'LearningReports', 'MK-163': 'ManagerReports',
    'MK-164': 'ReportExportDialog', 'MK-165': 'ReportExportStatus', 'MK-166': 'ReportExportStatus',
}
# Re-export modules are followed to their implementation file.
bind(['MK-104'], 'personal/school/person-records')

# Canonical product entry points, checked against the actual route dispatchers.
# Some references are local states of one route, not an accepted URL suffix.
canonical_routes = {
    'MK-03': '/enter',
    'MK-128': '/personal/education/sessions/{sessionId}',
    'MK-129': '/personal/education/sessions/{sessionId}',
    'MK-130': '/personal/education/sessions/{sessionId}',
    'MK-444': '/personal/education/sessions/{sessionId}',
    'MK-137': '/personal/education/classes/{classId}?tab=lessons',
    'MK-171': '/personal/messages?filter=Unread',
    'MK-172': '/personal/messages?filter=Archived',
    'MK-184': '/personal/messages/{savedConversationId}',
    'MK-190': '/personal/messages/{conversationId}',
    'MK-193': '/personal/messages/{conversationId}',
    'MK-203': '/personal/messages/{conversationId}/members',
    'MK-204': '/personal/messages/{conversationId}/members',
    'MK-273': '/personal/extracurricular/requests/{requestId}',
    'MK-274': '/personal/extracurricular/requests/{requestId}',
    'MK-275': '/personal/extracurricular/requests/new?step=details',
    'MK-276': '/personal/extracurricular/requests/new?step=details',
    'MK-277': '/personal/extracurricular/requests/new?step=details',
    'MK-278': '/personal/extracurricular/requests/new?step=management',
    'MK-279': '/personal/extracurricular/requests/new?step=management',
    'MK-280': '/personal/extracurricular/requests/new?step=management',
    'MK-281': '/personal/extracurricular/requests/new?step=review',
    'MK-317': '/personal/extracurricular/requests/{requestId}',
    'MK-346': '/personal/settings/notifications/Assignments',
    'MK-344': '/personal/notifications',
    'MK-345': '/personal/settings/notifications',
    'MK-358': '/personal/resources/{resourceId}',
    'MK-360': '/personal/resources/{resourceId}?view=knowledge',
    'MK-361': '/personal/resources/{resourceId}?view=versions',
    'MK-362': '/personal/resources/{resourceId}?view=versions',
    'MK-363': '/personal/resources/{resourceId}?view=visibility',
    'MK-364': '/personal/resources/{resourceId}?view=content',
    'MK-465': '/personal/resources/{resourceId}',
    'RX-050': '/personal/resources?upload=1&scope=Personal', 'RX-051': '/personal/education/classes/new',
    'RX-052': '/personal/resources',
    'RX-053': '/personal/education/schedule', 'RX-055': '/personal/education/members',
    'RX-056': '/personal/education/schedule', 'RX-057': '/personal/education/classes/new',
    'RX-059': '/personal/messages/{conversationId}', 'RX-060': '/personal/messages/{conversationId}',
    'RX-061': '/personal/education/assignments/{assignmentId}/answer',
}
personal_base = '/personal/extracurricular/classes/{classId}'
pending_entries = {
    44: '/learning', 45: '/assignments/{assignmentId}', 46: '/assignments/{assignmentId}/answer',
    60: '/assignments/new', 61: '/assignments/{assignmentId}/publish-review',
    62: '/assignments/{assignmentId}/evaluations', 63: '/assignments/{assignmentId}/receipt?attempt={attemptId}',
    64: '/submissions/{attemptId}/evaluate', 65: '/submissions/{attemptId}/result',
    66: '/exams', 67: '/exams/{examId}', 68: '/exams/{examId}', 69: '/exams/new',
    70: '/exams/{examId}/edit', 71: '/exams/{examId}/review', 72: '/exams/{examId}',
    73: '/exams/{examId}', 74: '/exam-submissions/{attemptId}/result',
    75: '/exam-submissions/{attemptId}/grading', 76: '/exam-submissions/{attemptId}/grading',
    77: '/exam-submissions/{attemptId}/result', 78: '/exams/{examId}', 79: '/assignments',
    80: '/assignments', 81: '/learning', 82: '/exams/{examId}/edit',
    323: '/learning', 324: '/learning', 325: '/learning', 326: '/assignments/{assignmentId}',
    327: '/assignments/{assignmentId}/answer', 328: '/submissions/{attemptId}/evaluate',
    329: '/exams/{examId}', 330: '/exams/{examId}', 331: '/exam-submissions/{attemptId}/result',
}
canonical_routes.update({f'MK-{n:02}': personal_base + path for n, path in pending_entries.items()})
overrides.update(canonical_routes)
bind(['MK-128', 'MK-129', 'MK-444', 'RX-009', 'RX-010'], 'personal/school/session-attendance')
for id in ['MK-128', 'MK-129', 'MK-444', 'RX-009', 'RX-010']:
    component_names[id] = 'SessionAttendancePage'
    overrides[id] = '/personal/education/sessions/{sessionId}?view=attendance'
bind(['MK-130'], 'personal/school/student-attendance')
component_names['MK-130'] = 'StudentAttendanceHistory'
overrides['MK-130'] = '/personal/education/reports?kind=attendance'
component_names['MK-137'] = 'ClassLessons'
bind(['MK-150', 'MK-151'], 'personal/school/exam-form')
component_names.update({'MK-150': 'ExamForm', 'MK-151': 'ExamForm'})
overrides['MK-151'] = '/personal/education/classes/{classId}/exams/new?step=rules'
bind(['MK-152'], 'personal/school/exam-question-form')
component_names['MK-152'] = 'ExamQuestionForm'
bind(['MK-153'], 'personal/school/exam-question-remove')
component_names['MK-153'] = 'ExamQuestionRemove'
overrides['MK-153'] = '/personal/education/exams/{examId}/edit?question={questionId}'
bind(['MK-126', 'MK-127'], 'personal/school/session-actions')
component_names.update({'MK-125': 'SessionEditor', 'MK-126': 'SessionCommandDialog', 'MK-127': 'SessionCommandDialog'})
overrides.update({id: '/personal/education/sessions/{sessionId}/edit' for id in ['MK-126', 'MK-127']})
bind(['MK-184', 'MK-190', 'MK-193'], 'personal/messaging/conversation-room')
bind(['MK-203', 'MK-204'], 'personal/messaging/management')
bind(['MK-317'], 'extracurricular/formation')
bind(['RX-053'], 'personal/school/schedule')
bind(['MK-93'], 'personal/school/directory')
component_names['MK-93'] = 'CatalogPicker'
bind(['MK-456'], 'personal/school/session-page')
overrides['MK-456'] = '/personal/education/sessions/{sessionId}'
bind(['MK-169'], 'personal/school/teacher-content')
overrides['MK-169'] = '/personal/education/content'
bind(['MK-20', 'MK-21', 'MK-22', 'MK-290', 'MK-291'], 'extracurricular/formation')
for id in ['MK-20', 'MK-21', 'MK-22', 'MK-290', 'MK-291']:
    overrides[id] = '/personal/extracurricular/requests/{requestId}'
    component_names[id] = 'FormationProgress'
overrides['MK-101'] = '/personal/education/classes/{classId}/members?member=teachers'
component_names['MK-305'] = 'Members'
for id in ['MK-31', 'MK-306', 'MK-307', 'MK-309', 'MK-310', 'MK-450']:
    overrides[id] = '/personal/extracurricular/classes/{classId}/members/{memberId}'
    component_names[id] = 'Member'
bind(['RX-050', 'RX-052'], 'personal/sources/catalog')
component_names.update({'RX-050': 'SourceUpload', 'RX-052': 'SourceCatalog'})
component_names.update({id: 'SourceDetail' for id in ['MK-357', 'MK-358', 'MK-360', 'MK-361', 'MK-362', 'MK-363', 'MK-364', 'MK-465']})
bind(['RX-059'], 'personal/messaging/conversation-pages')
bind(['RX-061'], 'personal/school/submission-flow')
bind(['MK-461'], 'personal/messaging/conversation-pages')
bind(['MK-437'], 'auth/login-resume')
bind(['MK-09', 'MK-116', 'MK-117', 'MK-118'], 'personal/school/parent-workspace')
component_names.update({id: 'ParentWorkspace' for id in ['MK-09', 'MK-116', 'MK-117', 'MK-118', 'RX-018']})
overrides.update({'MK-116': '/personal/education?view=children', 'MK-117': '/personal/education?view=program', 'MK-118': '/personal/education/assignments'})
overrides.update({id: '/personal/education/classes/{classId}/schedule-rules/new?step=range' for id in ['MK-132', 'MK-133']})
component_names['MK-437'] = 'LoginResume'
overrides['MK-461'] = '/personal/messages/{conversationId}/settings'
component_names.update({
    'MK-421': 'Members', 'MK-424': 'ExtracurricularHome',
    'MK-427': 'ClassOverview', 'MK-429': 'ClassRequestWizard',
    'MK-461': 'ConversationSettings', 'RX-059': 'ArchiveAction',
})

bind(['MK-347', 'MK-348', 'MK-349', 'MK-435', 'RX-040'], 'personal/notification-devices')
component_names.update({'MK-347': 'NotificationDevice', 'MK-435': 'NotificationDevice',
                        'RX-040': 'NotificationDevice', 'MK-348': 'NotificationDevices',
                        'MK-349': 'DeletePushDevice'})
overrides.update({'MK-347': '/personal/settings/notifications/device',
                  'MK-435': '/personal/settings/notifications/device',
                  'RX-040': '/personal/settings/notifications/device?view=preferences',
                  'MK-348': '/personal/settings/notifications/devices',
                  'MK-349': '/personal/settings/notifications/devices'})

unsupported = {
    'MK-220': 'The reference is requester self-cancellation, not a manager approval/rejection dialog. This client snapshot registers only manager approve/reject; no self-cancel operation is integrated. The existing redemption/pending state is preserved. A verified server contract and client mapping are required; absence here is not proof of absence on the live server.',
    'MK-377': 'The real assistant can summarize selected authorized sources through RAG after preflight. A dedicated structured source-summary flow matching MK-377 has no verified control mapping; it is not fabricated from atlas output.',
    'MK-378': 'The observed Test OpenAPI has no registered flashcard-generation operation/result. The old fake-answer studio was removed; no sample cards are presented as a real service.',
    'MK-379': 'The observed Test OpenAPI has no registered audio-review generation operation/result. Browser TTS is not substituted for a verified generated-audio product.',
    'MK-440': 'Account phone mutation has no enabled product flow; help/pending page only.',
    'MK-441': 'Account deletion has no enabled product flow; help/pending page only.',
    'MK-442': 'Ticket creation has no enabled product flow; help/pending page only.',
}

evidence_file = root / 'output/review/exact-v1/after/results.json'
evidence = json.loads(evidence_file.read_text()) if evidence_file.exists() else []
native_states = {}
for native in sorted((root / 'output/review/exact-v1/states-native').glob('*.json'), key=lambda p: p.stat().st_mtime):
    for item in json.loads(native.read_text()):
        item['status'] = 'captured'
        item.setdefault('stateVerified', True)
        identity = (item.get('testFile'), item.get('test'), tuple(item.get('scenarios', [])), item.get('detail'), item.get('width'), item.get('height'), item.get('theme'), item.get('role'), item.get('workspaceType'))
        native_states[identity] = item
evidence.extend(native_states.values())
# Keep historical JSON receipts, but never present deleted media as current visual proof.
for name in ['current-family-1', 'current-family-2', 'current-family-3',
             'current-boundaries', 'current-large', 'current-short',
             'current-school-boundaries', 'current-school-large', 'current-final']:
    latest = root / f'output/review/exact-v1/{name}/results.json'
    if latest.exists():
        evidence.extend(json.loads(latest.read_text()))
pruned_media = [item for item in evidence if item.get('image') and not (root / item['image']).is_file()]
evidence = [item for item in evidence if item.get('image') and (root / item['image']).is_file()]
# Prefer the latest retained checkpoint for the same state/actor/viewport.
# Each receipt keeps its true build ID; an older image is never relabelled as final.
unique_evidence = {}
for item in evidence:
    state = item.get('key') or (item.get('testFile'), item.get('test'), item.get('detail'))
    identity = (state, item.get('route'), item.get('width'), item.get('height'),
                item.get('theme'), item.get('role'), item.get('workspaceType'),
                item.get('conversationRole'),
                item.get('reading') or ('200%' if '-large/' in item['image'] else '100%'))
    unique_evidence[identity] = item
evidence = list(unique_evidence.values())
by_id = {}
for item in evidence:
    for id in item.get('scenarios', []):
        by_id.setdefault(id, []).append(item)


def matches_reference_role(check, row):
    if row['scenario_id'] == 'RX-004' and check.get('key') == 'large-classes':
        return False  # Useful 200% behavior coverage; the reference has different content/components.
    if row['scenario_id'] == 'MK-09' and check.get('key') == 'school-parent' and not check.get('parentSelectionVerified'):
        return False  # The selected-child dashboard is distinct from the child chooser.
    if row['scenario_id'] in ['RX-012', 'RX-013', 'RX-015', 'RX-016', 'RX-018']:
        return False  # The reference inventory/content actor ambiguity is unresolved.
    if row['scenario_id'] == 'MK-220':
        return False  # No integrated requester self-cancel command to exercise.
    if row['scenario_id'] == 'MK-215' and 'view=new' not in check.get('route', ''):
        return False  # V5 depicts the full form, not the old overlaid dialog.
    if row['group'] == 'messaging':
        expected_conversation_role = {'مالک گفتگو': 'Owner', 'مدیر گفتگو': 'Admin', 'عضو گفتگو': 'Member'}.get(row['role'])
        if expected_conversation_role and check.get('conversationRole') != expected_conversation_role:
            return False
    # A valid Manager page is not evidence of the Student variant, even at the same URL.
    if check.get('workspaceType') == 'Organization' and row['scenario_id'].startswith('MK-'):
        expected = next((role for title, role in [('دانش‌آموز', 'Student'), ('مدرس', 'Teacher'), ('مدیر', 'Manager'), ('والد', 'Parent')] if title in row['role']), None)
        if expected and check.get('role') != expected:
            return False
    if row['scenario_id'] == 'MK-456' and check.get('key') == 'teacher-schedule':
        return False  # The reference is session/attendance detail, not the weekly list.
    if row['scenario_id'] == 'MK-426' and check.get('key') == 'class-fetch-error' and not check.get('layout', {}).get('alerts'):
        return False  # A successful list read cannot verify a failed refresh.
    if row['scenario_id'] == 'MK-20' and check.get('key') == 'independent-overview':
        return False  # Setup progress and the ready class overview are separate states.
    return True

for row in rows:
    id = row['scenario_id']
    s = screens[id]
    if s['scope'] != 'client':
        row.update(actual_route='MakanManagement (separate sibling)',
                   actual_component='outside-this-repository',
                   actual_role_state=row['role'] or 'Authorized platform owner/admin',
                   implementation_status='out_of_scope_separate_owner_application',
                   visual_qa_status='not_reviewed_in_this_client',
                   backend_or_product_dependency='Root AGENTS.md: do not restore owner routes/endpoints into web/.',
                   notes='46 owner scenarios are intentionally outside the active client. No owner code or endpoint was added.')
        continue
    route = overrides.get(id, s.get('route')) or ''
    source = families.get(id, '')
    if source.endswith('.tsx') and not (root / source).exists() and (root / source[:-1]).is_file():
        source = source[:-1]
    if not source or not (root / source).is_file():
        raise RuntimeError(f'Missing product mapping {id}: {source}')
    text = (root / source).read_text()
    exports = re.findall(r'export function (\w+)', text)
    row.update(actual_route=route,
               actual_component=source + ('#' + component_names[id] if id in component_names else '#' + exports[0] if len(exports) == 1 else ''),
               actual_role_state=(row['role'] or 'Current authorized account') + ' | ' + row['title'] + ' | ' + row['kind'],
               implementation_status='product_component_mapped_specific_state_not_yet_verified',
               visual_qa_status='not_reviewed_no_independent_state_checkpoint',
               backend_or_product_dependency='Uses existing server authorization and DTOs. Candidate API-family mappings do not prove a control contract.',
               notes='Product component audited separately from reference HTML. A path template and a family component are not proof of this particular state. This row has no independent state checkpoint in the current evidence; it is unfinished QA, not an asserted API blocker.')
    if id == 'MK-03':
        row['notes'] += ' OTP is a local authenticated challenge state on /enter, not a step=otp router branch. Six-digit validation is preserved.'
    if id in ['MK-72', 'MK-73', 'MK-330']:
        row['notes'] += ' Review/receipt are local states of StudentExam, after a valid server attempt/receipt, not separate attempt URL suffixes.'
    if id in ['MK-141', 'MK-142']:
        row['actual_component'] = 'src/features/personal/school/assignment-form.tsx#AssignmentForm'
        if id == 'MK-142':
            row['actual_route'] = '/personal/education/classes/{classId}/assignments/new?step=rules'
        row['notes'] += ' Statement and rules are native steps of one organization-scoped draft; the learning AssignmentFormPage retains role/workspace guards and the separate independent-class flow. The required review checkbox binds to account/context/content/rules/files, not a fabricated server permission. Build59/60 MK142 checkpoints missing that control are explicitly rejected; source61 verification is tracked in evidence.'
    if id in ['MK-152', 'MK-153']:
        row['notes'] += ' The organization question form uses the existing Add/Update commands and a scoped versioned draft. Removal is available from the selected question More menu and the existing editor list; only the registered versioned DELETE204 confirms success. A newer background snapshot keeps frozen confirmation metadata visible and blocks deletion until explicit review. Build68 evidence and limitations are recorded in question-native.json; no independent-class rollout or sample short title is invented.'
    if id in ['MK-124', 'MK-125', 'MK-126', 'MK-127']:
        row['notes'] += ' Native detail/edit and the More-menu cancel/complete states use existing authorized session commands. Explicit edit review, scoped drafts and server-version conflict recovery remain. Completion reads the actual authorized attendance snapshot and requires its explicit review; a foreign or failed response never becomes a zero count. See session-native.json for build-specific evidence. SessionResult has no bound instructor name; Student is not granted the private management roster and the unknown value remains an em dash.'
    if id == 'MK-126':
        row['implementation_status'] = 'partial_contract_reference_control_unmapped'
        row['backend_or_product_dependency'] = 'In both active generated contract and the full recorded OpenAPI, POST sessions/{sessionId}/cancel accepts SessionVersionCommand with only expectedRowVersion. The reference cancellation-reason textarea has no verified persisted field. Existing cancellation is retained; no reason is invented, packed elsewhere or claimed as saved. Its missing control and naturally shorter dialog remain a documented visual/contract difference requiring a verified command update or product decision.'
    if id in ['MK-128', 'MK-129', 'MK-130', 'RX-009', 'RX-010']:
        row['notes'] += ' Native organization session attendance and own Student history use the existing registered GET/PUT/PATCH/report operations. Learner names bind both enrollment and organization-person IDs from the authorized class roster. Drafts are scoped to account/context/session and individual row versions. First registration and correction are distinct commands; each matching200 acknowledgment clears only its confirmed rows. Failed or uncertain writes require a fresh explicit review, and one row conflict preserves other drafts. Runtime and geometry evidence are build-specific in attendance-native.json; an implementation alone does not verify every state.'
    if id == 'MK-130':
        row['notes'] += ' The real report summary is used; the DTO does not identify the recorder role, so the atlas sample attribution to a teacher is not asserted.'
    if id == 'MK-444':
        row['implementation_status'] = 'partial_contract_reference_control_unmapped'
        row['backend_or_product_dependency'] = 'RecordAttendanceCommand in active and full recorded OpenAPI has entries only. The reference bulk explanation has no verified persisted field; it is not invented or packed into a row correction reason. This two-row source variant also omits MK128 search/policy and uses a different action caption; without a verified product-state trigger it is not treated as an interchangeable MK128 screenshot. See attendance-native.json for the explicit visual/contract difference and the candidate real route.'
    if id in ['MK-206', 'MK-461']:
        row['notes'] += ' The integrated member-list operation accepts page/pageSize. Search and administrator filtering apply only to the returned authorized page, with a visible scope notice on multi-page results. No unregistered server search parameter is sent. MK-461 includes policy/table controls beyond the MK-206 member list; that family alias is not a complete checkpoint.'
    if id in ['MK-421', 'MK-424', 'MK-427', 'MK-429', 'MK-434', 'RX-059', 'RX-061']:
        row['notes'] += ' The shared-state family was remapped from the actual reference content to its product domain; an unrelated school/chat creation route is not used as a substitute checkpoint. The precise pending/empty/ended/file-picker/archive/error variant still needs its own asserted state.'
    if id in ['RX-012', 'RX-013', 'RX-015', 'RX-016', 'RX-018']:
        row['notes'] += ' Reference-role ambiguity: the inventory labels this school scene Teacher, while its content describes a learner answer/exam or a parent relation. The product keeps the existing authorized actor; no Teacher submission or unrelated parent permission is fabricated to match an inconsistent label. Exact role parity requires resolving this reference ambiguity.'
    if id in ['MK-49', 'MK-259', 'MK-341', 'MK-342']:
        row['notes'] += ' The detailed MK-341 list and MK-342 audience dialog share the existing six-field versioned privacy command. MK-49 depicts a separate quick form and a notification-preview toggle absent from that integrated command; no fake preview preference is introduced. MK-259 depicts a four-field list; the optional presence fields are retained when returned. These source variants are not counted as interchangeable screenshots.'
    if id in ['MK-347', 'MK-348', 'MK-349', 'MK-435', 'RX-040']:
        row['backend_or_product_dependency'] = 'Native self-scoped configuration, registration, paginated list and strict204 removal now use the recorded operations. Account preference, browser permission and confirmed registration remain separate; no automatic POST retry or first-Web identity inference. A first lost acknowledgment has no deterministic endpoint-to-registration lookup in the recorded list DTO; recovery needs verified correlation/idempotency semantics. Platform names are generic because the DTO has no friendly device name/form factor. Physical permission and delivery remain unverified. See notification-devices-native.json for build81 evidence and limits.'
    if id == 'MK-358':
        row['implementation_status'] = 'partial_contract_reference_control_unmapped'
        row['backend_or_product_dependency'] = 'The recorded client integration exposes Library metadata only. Central library management stays in the owner app; binary/AI access is not enabled by a contradictory DTO alone. A verified consumer allocation/content contract is needed for the reference file-reading control. See RELEASE_154C437_INTEGRATION_FA.md.'
    if id in ['MK-377', 'MK-378', 'MK-379']:
        row['notes'] += ' The retired studio address redirects to the real assistant in every runtime. Sample answers and study outputs were removed from product source. This scenario remains a declared product/control gap.'
    if id in ['MK-131', 'MK-132', 'MK-133']:
        row['notes'] += ' Native details and range steps share the scoped workflow draft. MK-133 is the in-page apply-date dialog for an acknowledged rule. Existing POST creation and versioned PATCH update are retained; the acknowledged identity/version is stored with edit intent so reload cannot silently create another rule. No rule GET or idempotency key is invented. Empty or unrelated class/organization/rule acknowledgments do not announce success.'
    if row['kind'] == 'modal':
        row['notes'] += ' This is an in-page dialog/menu state; it is not an additional route.'
    if id in unsupported:
        row['implementation_status'] = 'existing_product_gap'
        row['backend_or_product_dependency'] = unsupported[id]
    if source.endswith('extracurricular/learning.tsx'):
        row['implementation_status'] = 'product_pending_existing_flow_preserved'
        row['backend_or_product_dependency'] = 'V5 marks independent assignments/exams as product pending. Existing capability-gated API integration retained; this visual change does not authorize rollout. Historical V2 approval differs from V5 and requires a recorded final product decision.'
    if id.startswith('RX-'):
        row['notes'] += ' Shared responsive/interaction scenario must be exercised on this real component; reference content is not injected into normal runtime.'
    if id == 'RX-004':
        row['notes'] += ' The large-classes capture proves 200% navigation reflow on the real Manager class list, not visual parity with the illustrative long-title/learner/source reference composition. Its unmatched hero/list geometry remains unverified.'
    if id in ['MK-14', 'MK-16', 'MK-281']:
        row['implementation_status'] = 'partial_contract_local_fields_preserved'
        row['backend_or_product_dependency'] = 'The currently integrated PersonalClassRequestInput accepts title, purpose, description, suggestedCapacity, suggestedManagerUserId and suggestedTeacherUserId. Audience/attendance-rules are legacy local-draft fields and this client does not persist them as named server fields. Existing payload is preserved; the UI states their browser-only persistence. A verified contract/client mapping decision is required for server persistence; fields are not silently invented or packed into description. The unauthenticated live contract read was unavailable; see request-contract-check.json.'
    checks = by_id.get(id, [])
    if checks:
        passed = [c for c in checks if c.get('status') == 'captured' and c.get('stateVerified', False) and not c.get('pageErrors') and matches_reference_role(c, row)]
        row['visual_qa_status'] = f'product_state_captured_{len(passed)}_retained_checkpoints; see evidence' if passed else 'not_reviewed_reference_role_or_state_not_matched'
        if passed:
            row['notes'] = row['notes'].replace(' This row has no independent state checkpoint in the current evidence; it is unfinished QA, not an asserted API blocker.', '')
        passed.sort(key=lambda c: (not c['image'].startswith('output/review/exact-v1/current-final/'),
                                   not c['image'].startswith('output/review/exact-v1/current-')))
        row['notes'] += ' Evidence: ' + ', '.join(c['image'] for c in passed[:3])
        if any(not matches_reference_role(c, row) for c in checks):
            row['notes'] += ' Earlier captures from a different reference role/state are retained as history and excluded from verification.'
        if passed and row['implementation_status'] == 'product_component_mapped_specific_state_not_yet_verified':
            row['implementation_status'] = 'product_state_exercised_visual_parity_tracked_in_evidence'

folder.mkdir(parents=True, exist_ok=True)
with (folder / 'screen-route-matrix.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
(folder / 'screen-route-matrix.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
summary = {'total': len(rows), 'implementation': dict(Counter(r['implementation_status'] for r in rows)),
           'visual': dict(Counter(r['visual_qa_status'] for r in rows)),
           'prunedHistoricalMediaExcluded': len(pruned_media), 'source': 'Supplied 528-row matrix + current product source + retained PNG checkpoints. Missing historical media are excluded. A captured state is not a claim of full visual parity.'}
(folder / 'coverage.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False, indent=2))
