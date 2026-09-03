import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`Missing ${label}: ${expected}`);
};

const dashboard = read("src/app/pages/dashboard/dashboard.component.ts");
const template = read("src/app/pages/admin-dashboard/admin-lead-assignment-settings.component.html");
const service = read("src/app/features/admin/lead-assignment-settings/lead-assignment-settings.service.ts");

requireText(dashboard, '"leadAssignmentSettings"', "dashboard section");
requireText(template, "لیدهای جدید", "new leads option");
requireText(template, "لیدهای سوخته", "burned leads option");
requireText(template, 'type="radio"', "accessible radio controls");
requireText(service, "/admin/lead-assignment-settings", "backend endpoint");
requireText(service, "assignmentSourceType", "source type payload");

console.log("Lead assignment settings UI validation passed.");
