import { readFile } from "node:fs/promises";

const templatePath = new URL(
  "../src/app/pages/secretary-dashboard/secretary-reservations.component.html",
  import.meta.url,
);
const componentPath = new URL(
  "../src/app/pages/secretary-dashboard/secretary-reservations.component.ts",
  import.meta.url,
);
const requestsComponentPath = new URL(
  "../src/app/pages/secretary-dashboard/secretary-reservation-requests.component.ts",
  import.meta.url,
);

const [template, component, requestsComponent] = await Promise.all([
  readFile(templatePath, "utf8"),
  readFile(componentPath, "utf8"),
  readFile(requestsComponentPath, "utf8"),
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

if (!/^  notes: Record<number, string> = \{\};$/m.test(component)) {
  throw new Error(
    "Secretary reservations component must declare the notes map used by attendance review",
  );
}

for (const methodName of [
  "openCreateDialog",
  "closeCreateDialog",
  "createReservation",
]) {
  const declarations = requestsComponent.match(
    new RegExp(`^  ${methodName}\\(`, "gm"),
  ) ?? [];
  if (declarations.length !== 1) {
    throw new Error(
      `Secretary reservation requests component must declare ${methodName} exactly once; found ${declarations.length}`,
    );
  }
}

console.log(
  "OK: secretary reservation bindings and create-flow methods are valid",
);
