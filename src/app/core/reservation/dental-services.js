 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }export var DentalService; (function (DentalService) {
  const Composite = 1; DentalService[DentalService["Composite"] = Composite] = "Composite";
  const Implant = 2; DentalService[DentalService["Implant"] = Implant] = "Implant";
  const Laminate = 3; DentalService[DentalService["Laminate"] = Laminate] = "Laminate";
})(DentalService || (DentalService = {}));

export const DENTAL_SERVICE_OPTIONS = [
  { value: DentalService.Composite, label: "کامپوزیت" },
  { value: DentalService.Implant, label: "ایمپلنت" },
  { value: DentalService.Laminate, label: "لمینت" },
] ;

export function dentalServicesOf(value


) {
  return _nullishCoalesce(_nullishCoalesce(value.dentalServices, () => ( value.DentalServices)), () => ( []));
}

export function formatDentalServices(value


) {
  const selected = new Set(dentalServicesOf(value));
  const labels = DENTAL_SERVICE_OPTIONS
    .filter((option) => selected.has(option.value))
    .map((option) => option.label);
  return labels.length ? labels.join("، ") : "خدمت ثبت نشده";
}
