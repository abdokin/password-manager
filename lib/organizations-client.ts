"use server";

import { getUserOrganizations as getOrgs } from "./tenant/context";

export async function getUserOrganizations() {
  return await getOrgs();
}
