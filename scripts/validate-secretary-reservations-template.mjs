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
const secretaryServicePath = new URL(
  "../src/app/core/secretary/secretary-dashboard.service.ts",
  import.meta.url,
);

const [template, component, requestsComponent, secretaryService] = await Promise.all([
  readFile(templatePath, "utf8"),
  readFile(componentPath, "utf8"),
  readFile(requestsComponentPath, "utf8"),
  readFile(secretaryServicePath, "utf8"),
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

if (template.includes("<app-secretary-announcement-editor")) {
  throw new Error("Attendance confirmations must not render the announcement editor");
}

if (component.includes("SecretaryAnnouncementEditorComponent")) {
  throw new Error("Attendance confirmations must not import the announcement editor");
}

if (!/^  notes: Record<number, string> = \{\};$/m.test(component)) {
  throw new Error(
    "Secretary reservations component must declare the notes map used by attendance review",
  );
}

const createFlowMembers = [
  "openCreateDialog",
  "closeCreateDialog",
  "createReservation",
  "loadCreateOptions",
  "filteredPatientOptions",
  "selectedPatientOption",
  "patientOptionId",
  "patientOptionName",
  "patientOptionPhone",
  "onPatientSelected",
  "patientConsultantName",
  "patientConsultantPhone",
  "normalizeSearch",
];

for (const memberName of createFlowMembers) {
  const declarations = requestsComponent.match(
    new RegExp(
      `^  (?:(?:private )?${memberName}\\(|get ${memberName}\\()`,
      "gm",
    ),
  ) ?? [];
  if (declarations.length !== 1) {
    throw new Error(
      `Secretary reservation requests component must declare ${memberName} exactly once; found ${declarations.length}`,
    );
  }
}

for (const declaration of [
  "patientSearch = \"\";",
  "patientOptions: SecretaryPatientOption[] = [];",
]) {
  if (!requestsComponent.includes(declaration)) {
    throw new Error(
      `Secretary reservation requests component is missing create-flow state: ${declaration}`,
    );
  }
}

if (!requestsComponent.includes("SecretaryPatientOption,")) {
  throw new Error(
    "Secretary reservation requests component must import SecretaryPatientOption",
  );
}

if (!/^  getPatientOptions\(\): Observable<SecretaryPatientOption\[]> \{$/m.test(secretaryService)) {
  throw new Error(
    "Secretary dashboard service must expose getPatientOptions for the create flow",
  );
}

console.log(
  "OK: secretary reservation bindings and create-flow methods are valid",
);
