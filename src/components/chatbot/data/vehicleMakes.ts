export type SelectOption = { label: string; value: string };

const toOptions = (labels: string[]): SelectOption[] => labels.map((label) => ({ label, value: label }));

// Values intentionally equal labels to match any upstream naming.
export const MOTOR_PRIVATE_VEHICLE_MAKE_OPTIONS: SelectOption[] = toOptions([
  "Toyota",
  "Nissan",
  "Honda",
  "Subaru",
  "Suzuki",
  "Mazda",
  "Mitsubishi",
  "Isuzu",
  "Ford",
  "Hyundai",
  "Kia",
  "Volkswagen",
  "Mercedes-Benz",
  "BMW",
  "Peugeot",
  "Renault",
  "Other",
]);
