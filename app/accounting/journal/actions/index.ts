"use server";

import { authAction } from "@/(common)/lib/safe-action";
import { journalEntrySchema } from "../../(common)/schemas";
import { revalidatePath } from "next/cache";
import { paths } from "@/(common)/lib/paths";

export const postJournalEntry = authAction(
  journalEntrySchema,
  async (data, { supabase }) => {
    // Call the RPC function we created in Step 2.1
    const { error, data: journalId } = await supabase.rpc(
      "post_journal_entry",
      {
        p_date: data.date,
        p_description: data.description,
        p_reference_type: "MANUAL",
        p_reference_id: null,
        p_status: data.status,
        p_lines: data.lines, // Passed as JSONB
      },
    );

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message);
    }

    revalidatePath(paths.accounting.journal);
    return { success: true, journalId };
  },
);
