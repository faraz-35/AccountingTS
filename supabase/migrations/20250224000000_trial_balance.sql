-- Migration: Trial Balance Report Function
-- Description: Creates a database RPC function for generating Trial Balance reports

-- ============================================
-- TRIAL BALANCE FUNCTION
-- Lists all accounts with their total debits and credits for a specific period
-- Used to verify that total debits equal total credits (fundamental accounting principle)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_trial_balance(
    p_organization_id UUID,
    p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    account_id UUID,
    account_code TEXT,
    account_name TEXT,
    account_type TEXT,
    total_debit DECIMAL(18,2),
    total_credit DECIMAL(18,2),
    net_balance DECIMAL(18,2)
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
        a.id as account_id,
        a.code as account_code,
        a.name as account_name,
        a.type as account_type,
        -- Sum all debits for this account up to the specified date
        COALESCE(SUM(jel.debit), 0) as total_debit,
        -- Sum all credits for this account up to the specified date
        COALESCE(SUM(jel.credit), 0) as total_credit,
        -- Net balance (can be positive or negative depending on account type)
        COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) as net_balance
    FROM public.accounts a
    LEFT JOIN public.journal_entry_lines jel ON jel.account_id = a.id
    LEFT JOIN public.journal_entries je ON jel.journal_entry_id = je.id
    WHERE
        a.organization_id = p_organization_id
        AND (
            je.date IS NULL -- Include accounts with no transactions
            OR (je.date <= p_as_of_date AND je.status = 'POSTED')
        )
    GROUP BY a.id, a.code, a.name, a.type
    HAVING
        -- Include accounts with no transactions OR accounts with activity
        COUNT(jel.id) = 0 OR
        SUM(jel.debit) > 0 OR
        SUM(jel.credit) > 0
    ORDER BY a.type, a.code;
END;
$$;

-- ============================================
-- TRIAL BALANCE SUMMARY FUNCTION
-- Returns summary totals for validation
-- ============================================

CREATE OR REPLACE FUNCTION public.get_trial_balance_summary(
    p_organization_id UUID,
    p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_debits DECIMAL(18,2),
    total_credits DECIMAL(18,2),
    is_balanced BOOLEAN,
    difference DECIMAL(18,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_debits DECIMAL(18,2);
    v_total_credits DECIMAL(18,2);
BEGIN
    -- Verify Access
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_organization_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access Denied';
    END IF;

    -- Calculate totals
    SELECT
        COALESCE(SUM(total_debit), 0),
        COALESCE(SUM(total_credit), 0)
    INTO v_total_debits, v_total_credits
    FROM public.get_trial_balance(p_organization_id, p_as_of_date);

    -- Return summary
    RETURN QUERY
    SELECT
        v_total_debits as total_debits,
        v_total_credits as total_credits,
        (v_total_debits = v_total_credits) as is_balanced,
        (v_total_debits - v_total_credits) as difference;
END;
$$;

-- ============================================
-- PERFORMANCE INDEXES FOR TRIAL BALANCE
-- ============================================

-- Composite index for efficient trial balance queries
CREATE INDEX IF NOT EXISTS idx_trial_balance_accounts_org
ON public.accounts(organization_id, code, type);

CREATE INDEX IF NOT EXISTS idx_trial_balance_journal_entries_org_date_status
ON public.journal_entries(organization_id, date, status)
WHERE status = 'POSTED';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION public.get_trial_balance(UUID, DATE) IS 'Generates Trial Balance showing all accounts with their debit and credit totals as of a specific date';
COMMENT ON FUNCTION public.get_trial_balance_summary(UUID, DATE) IS 'Returns summary totals for Trial Balance validation - shows if debits equal credits';
