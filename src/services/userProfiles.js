import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { getUserDocumentPath } from "../utils/stockPaths";

export async function getUserProfile(uid) {
  const userRef = doc(db, getUserDocumentPath(uid));
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export function hasActiveAccess(profile) {
  return profile?.isActive === true;
}
