// Muscle groups aligned with react-body-highlighter library
export const MUSCLE_GROUPS = [
  // Back
  { value: "trapezius", label: "Trapezius", category: "Back" },
  { value: "upper-back", label: "Upper Back", category: "Back" },
  { value: "lower-back", label: "Lower Back", category: "Back" },

  // Chest
  { value: "chest", label: "Chest", category: "Chest" },

  // Arms
  { value: "biceps", label: "Biceps", category: "Arms" },
  { value: "triceps", label: "Triceps", category: "Arms" },
  { value: "forearm", label: "Forearms", category: "Arms" },
  {
    value: "front-deltoids",
    label: "Front Deltoids (Shoulders)",
    category: "Arms",
  },
  {
    value: "back-deltoids",
    label: "Back Deltoids (Shoulders)",
    category: "Arms",
  },

  // Abs
  { value: "abs", label: "Abs", category: "Core" },
  { value: "obliques", label: "Obliques", category: "Core" },

  // Legs
  { value: "quadriceps", label: "Quadriceps", category: "Legs" },
  { value: "hamstring", label: "Hamstrings", category: "Legs" },
  { value: "calves", label: "Calves", category: "Legs" },
  { value: "gluteal", label: "Glutes", category: "Legs" },
  { value: "adductor", label: "Adductors (Inner Thigh)", category: "Legs" },
  { value: "abductors", label: "Abductors (Outer Thigh)", category: "Legs" },

  // Head/Neck
  { value: "neck", label: "Neck", category: "Head/Neck" },
  { value: "head", label: "Head", category: "Head/Neck" },
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]["value"];

// Helper function to get label from value
export function getMuscleGroupLabel(value: string): string {
  return MUSCLE_GROUPS.find((g) => g.value === value)?.label || value;
}

// Helper function to get category from value
export function getMuscleGroupCategory(value: string): string {
  return MUSCLE_GROUPS.find((g) => g.value === value)?.category || "Other";
}

// Grouped muscle groups for better UI organization
export const MUSCLE_GROUPS_BY_CATEGORY = {
  Back: MUSCLE_GROUPS.filter((g) => g.category === "Back"),
  Chest: MUSCLE_GROUPS.filter((g) => g.category === "Chest"),
  Arms: MUSCLE_GROUPS.filter((g) => g.category === "Arms"),
  Core: MUSCLE_GROUPS.filter((g) => g.category === "Core"),
  Legs: MUSCLE_GROUPS.filter((g) => g.category === "Legs"),
  "Head/Neck": MUSCLE_GROUPS.filter((g) => g.category === "Head/Neck"),
};
