import { readFile } from "node:fs/promises";

const templatePath = new URL(
  "../src/app/pages/secretary-dashboard/secretary-reservations.component.html",
  import.meta.url,
);
const componentPath = new URL(
  "../src/app/pages/secretary-dashboard/secretary-reservations.component.ts",
  import.meta.url,
);

const [template, component] = await Promise.all([
  readFile(templatePath, "utf8"),
  readFile(componentPath, "utf8"),
]);

const legacyParentBindings = [
  "announcements[",
  "announcementUpdatedAt(",
  "isCanceled(",
  "saveAnnouncement(",
  "savingAnnouncementIds",
];
const remainingBindings = legacyParentBindings.filter((binding) =>
  template.includes(binding),
);

if (remainingBindings.length > 0) {
  throw new Error(
    `Secretary reservations template still uses removed parent bindings: ${remainingBindings.join(
      ", ",
    )}`,
  );
}

if (!template.includes("<app-secretary-announcement-editor")) {
  throw new Error("Secretary reservations template must render the announcement editor");
}

if (!component.includes("SecretaryAnnouncementEditorComponent")) {
  throw new Error("Secretary reservations component must import the announcement editor");
}

console.log("OK: secretary announcement bindings are owned by the editor component");
