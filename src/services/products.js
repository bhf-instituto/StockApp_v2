import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/client";
import {
  getProductDocumentPath,
  getProductsCollectionPath,
} from "../utils/stockPaths";
import {
  normalizeProductPayload,
  sanitizeQuantity,
} from "../utils/stockValidation";
import { getMissingQuantity } from "../utils/orderMessages";

function sortProducts(products) {
  return [...products].sort((left, right) => {
    const leftMissing = getMissingQuantity(left);
    const rightMissing = getMissingQuantity(right);

    if (leftMissing !== rightMissing) {
      return rightMissing - leftMissing;
    }

    return left.nombre.localeCompare(right.nombre, "es", {
      sensitivity: "base",
    });
  });
}

export function subscribeToProducts(uid, distributorId, onChange) {
  const productsRef = collection(db, getProductsCollectionPath(uid, distributorId));

  return onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data(),
    }));

    onChange(sortProducts(products));
  });
}

export async function saveProduct(uid, distributorId, productInput, productId) {
  if (!distributorId) {
    throw new Error("Selecciona un distribuidor antes de guardar el producto.");
  }

  const payload = normalizeProductPayload(productInput);
  const nextProductId = productId ?? crypto.randomUUID();
  const productRef = doc(
    db,
    getProductDocumentPath(uid, distributorId, nextProductId)
  );

  const data = {
    ...payload,
    updatedAt: serverTimestamp(),
  };

  if (!productId) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(productRef, data, { merge: true });
  return nextProductId;
}

export async function updateProductStock(
  uid,
  distributorId,
  productId,
  nextQuantity
) {
  const productRef = doc(db, getProductDocumentPath(uid, distributorId, productId));

  await updateDoc(productRef, {
    cantActual: sanitizeQuantity(nextQuantity),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(uid, distributorId, productId) {
  const productRef = doc(db, getProductDocumentPath(uid, distributorId, productId));
  await deleteDoc(productRef);
}
