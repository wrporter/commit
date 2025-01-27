import { data } from "react-router";

import { getFamily } from "~/lib/repository/family.server.js";
import type { User } from "~/lib/repository/user.server.js";

export async function requireFamilyAccess(user: User, familyId?: string) {
  if (!familyId) {
    throw data({ errorMessage: `Family does not exist` }, 404);
  }

  const family = await getFamily(user.id, familyId);
  if (!family) {
    throw data({ errorMessage: `Family [${familyId}] does not exist` }, 404);
  }

  return family;
}
