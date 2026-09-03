import { readFileSync } from "node:fs";

const service = readFileSync("src/app/features/secretary/sales/services/secretary-sales.service.ts", "utf8");
const routes = readFileSync("src/app/features/secretary/account/secretary-account.routes.ts", "utf8");
const admin = readFileSync("src/app/pages/dashboard/dashboard.component.html", "utf8");
const createBody = service.match(/createSale\([\s\S]*?\n  }/m)?.[0] ?? "";
const checks = [
  [createBody.includes("{ patientUserId, serviceId }") && !createBody.includes("secretaryReward") && !createBody.includes("salePrice"), "frontend sale request must only send patient and service"],
  [routes.includes('path: "sales/new"') && routes.includes('path: "sales"') && routes.includes('path: "wallet"'), "secretary accounting routes are missing"],
  [admin.includes("app-admin-secretary-sale-services") && admin.includes("app-admin-secretary-sales-approval"), "admin sales sections are missing"],
];
const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, message]) => console.error(`FAIL: ${message}`));
  process.exit(1);
}
console.log("OK: secretary sales UI routes and trusted backend pricing contract are valid");
