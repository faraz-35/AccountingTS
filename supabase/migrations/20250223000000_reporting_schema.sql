-- Migration: General Ledger & Reporting Functions
-- Description: Creates optimized database RPC functions for P&L and Balance Sheet reporting

-- ============================================
-- PROFIT & LOSS REPORT FUNCTION
-- Calculates the net movement of Revenue and Expense accounts for a specific period
-- ============================================

CREATE OR REPLACE FUNCTION public.get_pnl_report(
    p_organization_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    account_id UUID,
    account_code TEXT,
    account_name TEXT,
    account_type TEXT,
    net_amount DECIMAL(18,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify Access
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_organization_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access Denied';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.code as account_code,
        a.name as account_name,
        a.type as account_type,
        -- Logic:
        -- For Revenue (Credit Normal): Sum(Credit) - Sum(Debit)
        -- For Expense (Debit Normal): Sum(Debit) - Sum(Credit)
        SUM(
            CASE
                WHEN a.type = 'REVENUE' THEN (jel.credit - jel.debit)
                WHEN a.type = 'EXPENSE' THEN (jel.debit - jel.credit)
                ELSE 0
            END
        ) as net_amount
    FROM public.accounts a
    JOIN public.journal_entry_lines jel ON jel.account_id = a.id
    JOIN public.journal_entries je ON jel.journal_entry_id = je.id
    WHERE
        a.organization_id = p_organization_id
        AND a.type IN ('REVENUE', 'EXPENSE')
        AND je.date >= p_start_date
        AND je.date <= p_end_date
        AND je.status = 'POSTED'
        AND je.organization_id = p_organization_id
    GROUP BY a.id, a.code, a.name, a.type
    HAVING SUM(
        CASE
            WHEN a.type = 'REVENUE' THEN (jel.credit - jel.debit)
            WHEN a.type = 'EXPENSE' THEN (jel.debit - jel.credit)
            ELSE 0
        END
    ) != 0
    ORDER BY a.type DESC, a.code ASC;
END;
$$;

-- ============================================
-- BALANCE SHEET FUNCTION
-- Calculates balances "As Of" a specific date (Cumulative from beginning of time)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_balance_sheet(
    p_organization_id UUID,
    p_as_of_date DATE
)
RETURNS TABLE (
    account_id UUID,
    account_code TEXT,
    account_name TEXT,
    account_type TEXT,
    balance DECIMAL(18,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify Access
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_organization_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access Denied';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.code as account_code,
        a.name as account_name,
        a.type as account_type,
        -- Logic:
        -- Assets (Debit Normal): Debit - Credit
        -- Liabilities/Equity (Credit Normal): Credit - Debit
        SUM(
            CASE
                WHEN a.type = 'ASSET' THEN (jel.debit - jel.credit)
                ELSE (jel.credit - jel.debit)
            END
        ) as balance
    FROM public.accounts a
    JOIN public.journal_entry_lines jel ON jel.account_id = a.id
    JOIN public.journal_entries je ON jel.journal_entry_id = je.id
    WHERE
        a.organization_id = p_organization_id
        AND a.type IN ('ASSET', 'LIABILITY', 'EQUITY')
        AND je.date <= p_as_of_date
        AND je.status = 'POSTED'
        AND je.organization_id = p_organization_id
    GROUP BY a.id, a.code, a.name, a.type
    HAVING SUM(
        CASE
            WHEN a.type = 'ASSET' THEN (jel.debit - jel.credit)
            ELSE (jel.credit - jel.debit)
        END
    ) != 0

    UNION ALL

    -- Dynamic "Net Income" Calculation (Revenue - Expenses) to balance the sheet
    -- This technically belongs in Equity for the report
    SELECT
        NULL as account_id,
        '9999' as account_code,
        'Net Income (Current Year)' as account_name,
        'EQUITY' as account_type,
        SUM(jel.credit - jel.debit) as balance -- Net Income (Revenue - Expense)
    FROM public.accounts a
    JOIN public.journal_entry_lines jel ON jel.account_id = a.id
    JOIN public.journal_entries je ON jel.journal_entry_id = je.id
    WHERE
        a.organization_id = p_organization_id
        AND a.type IN ('REVENUE', 'EXPENSE')
        AND je.date <= p_as_of_date
        AND je.status = 'POSTED'
        AND je.organization_id = p_organization_id
    HAVING SUM(jel.credit - jel.debit) != 0;
END;
$$;

-- ============================================
-- PERFORMANCE INDEXES FOR REPORTING
-- ============================================

-- Composite indexes for optimal reporting performance
CREATE INDEX IF NOT EXISTS idx_accounts_org_type
ON public.accounts(organization_id, type);

CREATE INDEX IF NOT EXISTS idx_journal_entries_org_date_status
ON public.journal_entries(organization_id, date, status)
WHERE status = 'POSTED';

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_entry
ON public.journal_entry_lines(account_id, journal_entry_id);

-- ============================================
-- SECURITY POLICIES
-- ============================================

-- These functions use SECURITY DEFINER and include access control
-- No additional RLS policies needed for the reporting functions

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION public.get_pnl_report(UUID, DATE, DATE) IS 'Generates Profit & Loss statement showing revenue, expenses, and net income for a given period';
COMMENT ON FUNCTION public.get_balance_sheet(UUID, DATE) IS 'Generates Balance Sheet showing assets, liabilities, equity as of a specific date';
