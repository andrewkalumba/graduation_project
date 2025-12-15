"use server";

import { useSchema } from "@/store/schemaStore";

export async function saveSchema() {
  const { tables, relationships } = useSchema.getState();

  console.log("Saving schema:", { tables, relationships });

  return { success: true };
}
