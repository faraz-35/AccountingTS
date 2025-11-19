import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { JournalEntryForm } from "./components/journal-entry-form";
import { Button } from "@/common/components/ui";
import { Card, CardContent } from "@/common/components/ui";
import { paths } from "@/common/lib/paths";
import Link from "next/link";

export default async function JournalPage() {
  const supabase = await createSupabaseServerClient();

  // We need accounts to populate the dropdown
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .order("code", { ascending: true });

  // Also fetch recent journal entries for reference
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select(
      `
      *,
      journal_entry_lines (
        account_id,
        description,
        debit,
        credit
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">New Journal Entry</h1>
          <p className="text-gray-600 mt-1">
            Create manual journal entries with double-entry bookkeeping
          </p>
        </div>
        <Link href={paths.accounting.journal}>
          <Button variant="outline">View Journal Entries</Button>
        </Link>
      </div>

      <JournalEntryForm accounts={accounts || []} />

      {/* Recent Entries for Reference */}
      {recentEntries && recentEntries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Recent Journal Entries</h3>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-gray-500">{entry.date}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        entry.status === "POSTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  {entry.journal_entry_lines && (
                    <div className="mt-2 text-sm space-y-1">
                      {entry.journal_entry_lines.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-gray-600"
                        >
                          <span>{line.description}</span>
                          <span className="font-mono">
                            {line.debit > 0 ? `$${line.debit.toFixed(2)}` : ""}
                            {line.credit > 0
                              ? `($${line.credit.toFixed(2)})`
                              : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
