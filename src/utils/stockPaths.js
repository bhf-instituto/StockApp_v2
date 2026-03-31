function requireUid(uid) {
  if (!uid) {
    throw new Error("No se encontro un usuario autenticado.");
  }

  return uid;
}

export function getUserDocumentPath(uid) {
  return `users/${requireUid(uid)}`;
}

export function getDistributorsCollectionPath(uid) {
  return `${getUserDocumentPath(uid)}/distributors`;
}

export function getDistributorDocumentPath(uid, distributorId) {
  return `${getDistributorsCollectionPath(uid)}/${distributorId}`;
}

export function getProductsCollectionPath(uid, distributorId) {
  return `${getDistributorDocumentPath(uid, distributorId)}/products`;
}

export function getProductDocumentPath(uid, distributorId, productId) {
  return `${getProductsCollectionPath(uid, distributorId)}/${productId}`;
}
