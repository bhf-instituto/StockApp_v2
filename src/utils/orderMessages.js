export function getMissingQuantity(product) {
  const cantActual = Number(product?.cantActual ?? 0);
  const cantDeseada = Number(product?.cantDeseada ?? 0);

  return Math.max(cantDeseada - cantActual, 0);
}

export function buildDistributorOrderText(distributor, products = []) {
  if (!distributor) {
    return "";
  }

  const missingProducts = products
    .filter((product) => getMissingQuantity(product) > 0)
    .map((product) => `- ${product.nombre} ${getMissingQuantity(product)}`);

  if (missingProducts.length === 0) {
    return "";
  }

  return missingProducts.join("\n");
}

export function buildGlobalOrderText(
  productsByDistributor = {},
  distributorsById = {}
) {
  const sections = Object.entries(distributorsById)
    .map(([distributorId, distributor]) => {
      const message = buildDistributorOrderText(
        distributor,
        productsByDistributor[distributorId] ?? []
      );

      if (!message) {
        return "";
      }

      return `${distributor.nombre}:\n${message}`;
    })
    .filter(Boolean);

  if (sections.length === 0) {
    return "";
  }

  return `Productos faltantes:\n\n${sections.join("\n\n")}`;
}
