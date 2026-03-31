export const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

export const DAY_ORDER = DAYS_OF_WEEK.reduce((accumulator, day, index) => {
  accumulator[day] = index;
  return accumulator;
}, {});

function collapseWhitespace(value) {
  return value.trim().replace(/\s+/g, " ");
}

function capitalizeWord(word) {
  if (!word) {
    return "";
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function normalizeName(value) {
  const normalizedValue = collapseWhitespace(value ?? "");

  return normalizedValue
    .split(" ")
    .filter(Boolean)
    .map(capitalizeWord)
    .join(" ");
}

export function normalizePhone(value) {
  const rawValue = `${value ?? ""}`.trim();

  if (!rawValue) {
    return "";
  }

  return rawValue.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function sanitizeQuantity(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return Math.trunc(parsedValue);
}

export function normalizeDistributorPayload(distributorInput) {
  const nombre = normalizeName(distributorInput?.nombre ?? "");
  const telefono = normalizePhone(distributorInput?.telefono ?? "");
  const diaSemana = distributorInput?.diaSemana ?? DAYS_OF_WEEK[0];

  if (!nombre) {
    throw new Error("El nombre del distribuidor es obligatorio.");
  }

  if (!DAYS_OF_WEEK.includes(diaSemana)) {
    throw new Error("Selecciona un dia valido para el distribuidor.");
  }

  return {
    nombre,
    telefono,
    diaSemana,
  };
}

export function normalizeProductPayload(productInput) {
  const nombre = normalizeName(productInput?.nombre ?? "");
  const cantActual = sanitizeQuantity(productInput?.cantActual ?? 0);
  const cantDeseada = sanitizeQuantity(productInput?.cantDeseada ?? 0);

  if (!nombre) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  return {
    nombre,
    cantActual,
    cantDeseada,
  };
}
