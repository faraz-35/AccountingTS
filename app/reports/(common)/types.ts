export interface ReportRow {
  account_id: string | null;
  account_code: string;
  account_name: string;
  account_type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  amount: number;
}

export interface PnLRow extends ReportRow {
  net_amount: number;
}

export interface BalanceSheetRow extends ReportRow {
  balance: number;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  as_of_date?: string;
}
