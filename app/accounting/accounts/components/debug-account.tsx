"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createAccount } from "../actions";
import { Button } from "@/common/components/ui";
import { createSupabaseClient } from "@/common/lib/supabase-client";

export function DebugAccount() {
  const [result, setResult] = useState<string>("");

  const testCreateAccount = useAction(createAccount, {
    onSuccess: (data) => {
      setResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
    },
    onError: (error) => {
      setResult(`❌ Error: ${JSON.stringify(error, null, 2)}`);
    },
  });

  const testAuth = async () => {
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setResult(`❌ Auth Error: ${error.message}`);
        return;
      }

      if (!user) {
        setResult(`❌ No user found`);
        return;
      }

      // Test organization membership
      const { data: orgMember, error: orgError } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .single();

      if (orgError) {
        setResult(`❌ Org Error: ${orgError.message}`);
        return;
      }

      setResult(
        `✅ Auth OK: User ${user.email}, Org: ${orgMember?.organization_id}, Role: ${orgMember?.role}`,
      );
    } catch (err) {
      setResult(
        `❌ Exception: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const createTestAccount = () => {
    testCreateAccount.execute({
      name: "Test Account " + Date.now(),
      type: "ASSET" as const,
      parent_account_id: null,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold">Debug Account Creation</h3>

      <div className="space-x-2">
        <Button onClick={testAuth}>Test Authentication</Button>
        <Button onClick={createTestAccount}>Create Test Account</Button>
      </div>

      {result && (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {result}
        </pre>
      )}

      {testCreateAccount.status === "executing" && (
        <div>Creating account...</div>
      )}
    </div>
  );
}
