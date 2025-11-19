import { describe, it, expect } from "vitest";
import { journalEntrySchema } from "../../(common)/schemas";
import { JournalStatus } from "../../(common)/types";

describe("Journal Entry Schema Logic", () => {
  it("should fail validation if debits do not equal credits", () => {
    const invalidData = {
      date: "2023-01-01",
      description: "Test",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 90,
          description: "Test line 2",
        }, // Missing 10
      ],
    };

    const result = journalEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Debits must equal Credits");
    }
  });

  it("should pass validation for balanced entry", () => {
    const validData = {
      date: "2023-01-01",
      description: "Test",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100,
          description: "Test line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail validation for single line entry (minimum 2 lines required)", () => {
    const invalidData = {
      date: "2023-01-01",
      description: "Test",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation for invalid date", () => {
    const invalidData = {
      date: "invalid-date",
      description: "Test",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100,
          description: "Test line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation for empty description", () => {
    const invalidData = {
      date: "2023-01-01",
      description: "",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100,
          description: "Test line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should pass validation for complex balanced entry with multiple lines", () => {
    const validData = {
      date: "2023-01-01",
      description: "Complex test entry",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Debit line 1",
        },
        {
          account_id: "uuid-2",
          debit: 200,
          credit: 0,
          description: "Debit line 2",
        },
        {
          account_id: "uuid-3",
          debit: 0,
          credit: 150,
          description: "Credit line 1",
        },
        {
          account_id: "uuid-4",
          debit: 0,
          credit: 150,
          description: "Credit line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should pass validation for draft status entry", () => {
    const validData = {
      date: "2023-01-01",
      description: "Draft entry",
      status: JournalStatus.DRAFT,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100,
          description: "Test line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should handle floating point precision correctly", () => {
    const validData = {
      date: "2023-01-01",
      description: "Precision test",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100.33,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100.33,
          description: "Test line 2",
        },
      ],
    };

    const result = journalEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail for floating point precision beyond tolerance", () => {
    const invalidData = {
      date: "2023-01-01",
      description: "Precision test fail",
      status: JournalStatus.POSTED,
      lines: [
        {
          account_id: "uuid-1",
          debit: 100.33,
          credit: 0,
          description: "Test line 1",
        },
        {
          account_id: "uuid-2",
          debit: 0,
          credit: 100.34,
          description: "Test line 2",
        }, // 0.01 difference
      ],
    };

    const result = journalEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
