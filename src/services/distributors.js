import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/client";
import {
  getDistributorDocumentPath,
  getDistributorsCollectionPath,
  getProductsCollectionPath,
} from "../utils/stockPaths";
import {
  DAY_ORDER,
  normalizeDistributorPayload,
} from "../utils/stockValidation";

function sortDistributors(distributors) {
  return [...distributors].sort((left, right) => {
    const dayDifference =
      (DAY_ORDER[left.diaSemana] ?? 99) - (DAY_ORDER[right.diaSemana] ?? 99);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return left.nombre.localeCompare(right.nombre, "es", {
      sensitivity: "base",
    });
  });
}

export function subscribeToDistributors(uid, onChange) {
  const distributorsRef = collection(db, getDistributorsCollectionPath(uid));

  return onSnapshot(distributorsRef, (snapshot) => {
    const distributors = snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data(),
    }));

    onChange(sortDistributors(distributors));
  });
}

export async function saveDistributor(uid, distributorInput, distributorId) {
  const payload = normalizeDistributorPayload(distributorInput);
  const nextDistributorId = distributorId ?? crypto.randomUUID();
  const distributorRef = doc(
    db,
    getDistributorDocumentPath(uid, nextDistributorId)
  );

  const data = {
    ...payload,
    updatedAt: serverTimestamp(),
  };

  if (!distributorId) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(distributorRef, data, { merge: true });
  return nextDistributorId;
}

export async function deleteDistributor(uid, distributorId) {
  const productsRef = collection(db, getProductsCollectionPath(uid, distributorId));
  const productsSnapshot = await getDocs(productsRef);
  const batch = writeBatch(db);

  productsSnapshot.forEach((productDocument) => {
    batch.delete(productDocument.ref);
  });

  batch.delete(doc(db, getDistributorDocumentPath(uid, distributorId)));
  await batch.commit();
}
