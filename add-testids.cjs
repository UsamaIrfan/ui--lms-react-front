const fs = require("fs");
const path = require("path");

const pages = [
  ["admin-panel/page-content.tsx", "admin-dashboard"],
  ["student-portal/page-content.tsx", "student-dashboard"],
  ["staff-portal/page-content.tsx", "staff-dashboard"],
  ["admin-panel/users/page-content.tsx", "admin-users-page"],
  ["admin-panel/users/create/page-content.tsx", "admin-users-create-page"],
  [
    "admin-panel/academics/courses/page-content.tsx",
    "admin-academics-courses-page",
  ],
  [
    "admin-panel/academics/classes/page-content.tsx",
    "admin-academics-classes-page",
  ],
  [
    "admin-panel/academics/subjects/page-content.tsx",
    "admin-academics-subjects-page",
  ],
  ["admin-panel/academics/year/page-content.tsx", "admin-academics-year-page"],
  [
    "admin-panel/students/registrations/page-content.tsx",
    "admin-students-registrations-page",
  ],
  [
    "admin-panel/students/enquiries/page-content.tsx",
    "admin-students-enquiries-page",
  ],
  [
    "admin-panel/students/attendance/page-content.tsx",
    "admin-students-attendance-page",
  ],
  ["admin-panel/students/fees/page-content.tsx", "admin-students-fees-page"],
  ["admin-panel/students/exams/page-content.tsx", "admin-students-exams-page"],
  [
    "admin-panel/students/materials/page-content.tsx",
    "admin-students-materials-page",
  ],
  ["admin-panel/staff/page-content.tsx", "admin-staff-page"],
  [
    "admin-panel/staff/attendance/page-content.tsx",
    "admin-staff-attendance-page",
  ],
  ["admin-panel/staff/leaves/page-content.tsx", "admin-staff-leaves-page"],
  ["admin-panel/staff/payroll/page-content.tsx", "admin-staff-payroll-page"],
  [
    "admin-panel/staff/timetable/page-content.tsx",
    "admin-staff-timetable-page",
  ],
  [
    "admin-panel/accounts/income/page-content.tsx",
    "admin-accounts-income-page",
  ],
  [
    "admin-panel/accounts/expenses/page-content.tsx",
    "admin-accounts-expenses-page",
  ],
  [
    "admin-panel/accounts/reports/page-content.tsx",
    "admin-accounts-reports-page",
  ],
  ["admin-panel/reports/page-content.tsx", "admin-reports-page"],
  ["admin-panel/notices/page-content.tsx", "admin-notices-page"],
  [
    "admin-panel/authorization/role-permissions/page-content.tsx",
    "admin-role-permissions-page",
  ],
  [
    "admin-panel/authorization/audit-logs/page-content.tsx",
    "admin-audit-logs-page",
  ],
  ["admin-panel/settings/page-content.tsx", "admin-settings-page"],
  [
    "admin-panel/settings/general/page-content.tsx",
    "admin-settings-general-page",
  ],
  [
    "admin-panel/settings/tenants/page-content.tsx",
    "admin-settings-tenants-page",
  ],
  [
    "admin-panel/settings/branches/page-content.tsx",
    "admin-settings-branches-page",
  ],
  ["admin-panel/settings/fees/page-content.tsx", "admin-settings-fees-page"],
  [
    "admin-panel/settings/attendance/page-content.tsx",
    "admin-settings-attendance-page",
  ],
  [
    "admin-panel/settings/notifications/page-content.tsx",
    "admin-settings-notifications-page",
  ],
  [
    "admin-panel/settings/invitations/page-content.tsx",
    "admin-settings-invitations-page",
  ],
  ["student-portal/attendance/page-content.tsx", "student-attendance-page"],
  ["student-portal/fees/page-content.tsx", "student-fees-page"],
  ["student-portal/exams/page-content.tsx", "student-exams-page"],
  ["student-portal/materials/page-content.tsx", "student-materials-page"],
  ["student-portal/assignments/page-content.tsx", "student-assignments-page"],
  ["student-portal/timetable/page-content.tsx", "student-timetable-page"],
  ["student-portal/notices/page-content.tsx", "student-notices-page"],
];

const basePath = "src/app/[language]/";
let updated = 0;
let skipped = 0;
const errors = [];

for (const [file, testId] of pages) {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(fullPath + " NOT FOUND");
    continue;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  if (content.includes('data-testid="' + testId + '"')) {
    skipped++;
    continue;
  }

  const returnMatches = [...content.matchAll(/return\s*\(/g)];
  if (returnMatches.length === 0) {
    errors.push(fullPath + " - no return( found");
    continue;
  }

  const lastReturn = returnMatches[returnMatches.length - 1];
  const afterReturn = content.substring(
    lastReturn.index + lastReturn[0].length
  );

  const divMatch = afterReturn.match(/<div[\s\S]*?className="/);
  if (!divMatch) {
    const bareDivMatch = afterReturn.match(/<div[>\s]/);
    if (bareDivMatch) {
      const divIndex =
        lastReturn.index + lastReturn[0].length + bareDivMatch.index;
      const original = bareDivMatch[0];
      let replacement;
      if (original === "<div>") {
        replacement = '<div data-testid="' + testId + '">';
      } else {
        replacement =
          '<div data-testid="' +
          testId +
          '"' +
          original.charAt(original.length - 1);
      }
      content =
        content.substring(0, divIndex) +
        replacement +
        content.substring(divIndex + original.length);
      fs.writeFileSync(fullPath, content, "utf8");
      updated++;
      continue;
    }
    errors.push(fullPath + " - no div after return");
    continue;
  }

  const divIndex = lastReturn.index + lastReturn[0].length + divMatch.index;
  const original = divMatch[0];
  const replacement = original.replace(
    "<div",
    '<div data-testid="' + testId + '"'
  );
  content =
    content.substring(0, divIndex) +
    replacement +
    content.substring(divIndex + original.length);

  fs.writeFileSync(fullPath, content, "utf8");
  updated++;
}

console.log("Updated:", updated, "Skipped:", skipped, "Errors:", errors.length);
if (errors.length) {
  errors.forEach(function (e) {
    console.log("  ERROR:", e);
  });
}
