import { data } from "react-router";

import type { Route } from "./+types/families.$familyId.people.$personId.pay.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { payCommissions } from "~/lib/repository/commissions.server.js";
import { getFamily } from "~/lib/repository/family.server.js";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const { familyId, personId } = params;

  if (!familyId || !personId) {
    return data({ errorMessage: `Family or person does not exist` }, 404);
  }
  const family = await getFamily(user.id, familyId);
  if (!family) {
    return data({ errorMessage: `Family [${familyId}] does not exist` }, 404);
  }

  return await payCommissions(familyId, personId);
};
