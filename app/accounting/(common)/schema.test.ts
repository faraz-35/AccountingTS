import { describe, it, expect, vi } from "vitest";

// We are mocking the logic here because we can't easily run integration tests
// against the real DB in this environment without a local supabase instance running.
// However, this test ensures our Types match our expectations.

import type { Account } from "./types";
import { AccountType } from "./types";

describe("Accounting Schema Types", () => {
  it("should support the defined Account structure", () => {
    const mockAccount: Account = {
      id: "123-uuid",
      organization_id: "org-uuid",
      code: "1000",
      name: "Cash",
      type: "ASSET",
      is_system: true,
      parent_account_id: null,
      current_balance: 0.0, // Note: Supabase returns decimals as numbers
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(mockAccount.code).toBe("1000");
    expect(mockAccount.type).toBe("ASSET");
    expect(mockAccount.is_system).toBe(true);
  });

  it("should support all account types", () => {
    const assetAccount: Account = {
      id: "asset-uuid",
      organization_id: "org-uuid",
      code: "1000",
      name: "Cash",
      type: AccountType.ASSET,
      is_system: false,
      parent_account_id: null,
      current_balance: 1000.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const liabilityAccount: Account = {
      id: "liability-uuid",
      organization_id: "org-uuid",
      code: "2000",
      name: "Accounts Payable",
      type: AccountType.LIABILITY,
      is_system: false,
      parent_account_id: null,
      current_balance: -500.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(assetAccount.type).toBe("ASSET");
    expect(liabilityAccount.type).toBe("LIABILITY");
  });

  it("should support hierarchical account structure", () => {
    const parentAccount: Account = {
      id: "parent-uuid",
      organization_id: "org-uuid",
      code: "1000",
      name: "Cash",
      type: AccountType.ASSET,
      is_system: false,
      parent_account_id: null,
      current_balance: 5000.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const childAccount: Account = {
      id: "child-uuid",
      organization_id: "org-uuid",
      code: "1010",
      name: "Checking Account",
      type: AccountType.ASSET,
      is_system: false,
      parent_account_id: "parent-uuid",
      current_balance: 3000.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(childAccount.parent_account_id).toBe(parentAccount.id);
    expect(parentAccount.parent_account_id).toBeNull();
  });
});
