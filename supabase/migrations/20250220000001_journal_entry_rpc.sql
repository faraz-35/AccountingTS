-- Create RPC function for atomic journal entry posting
CREATE OR REPLACE FUNCTION public.post_journal_entry(
    p_date DATE,
    p_description TEXT,
    p_reference_type VARCHAR(50),
    p_reference_id UUID,
    p_status journal_status,
    p_lines JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (server-side)
AS $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_journal_id UUID;
    v_line JSONB;
    v_total_debit DECIMAL(20,2) := 0;
    v_total_credit DECIMAL(20,2) := 0;
BEGIN
    -- 1. Get Context (User & Org)
    v_user_id := auth.uid();

    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = v_user_id AND deleted_at IS NULL
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'User is not part of an organization';
    END IF;

    -- 2. Calculate Totals to ensure Balance (Server-side Validation)
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
    LOOP
        v_total_debit := v_total_debit + COALESCE((v_line->>'debit')::DECIMAL, 0);
        v_total_credit := v_total_credit + COALESCE((v_line->>'credit')::DECIMAL, 0);
    END LOOP;

    IF v_total_debit != v_total_credit THEN
        RAISE EXCEPTION 'Journal Entry is not balanced. Debits: %, Credits: %', v_total_debit, v_total_credit;
    END IF;

    -- 3. Insert Header
    INSERT INTO public.journal_entries (
        organization_id, date, description, reference_type, reference_id, status, created_by
    ) VALUES (
        v_org_id, p_date, p_description, p_reference_type, p_reference_id, p_status, v_user_id
    ) RETURNING id INTO v_journal_id;

    -- 4. Insert Lines
    INSERT INTO public.journal_entry_lines (
        journal_entry_id, account_id, description, debit, credit
    )
    SELECT
        v_journal_id,
        (line->>'account_id')::UUID,
        (line->>'description')::TEXT,
        COALESCE((line->>'debit')::DECIMAL, 0),
        COALESCE((line->>'credit')::DECIMAL, 0)
    FROM jsonb_array_elements(p_lines) AS line;

    -- 5. Update Account Balances (Denormalization for performance)
    -- Note: In a high-concurrency system, this might cause locking.
    -- For SMB V1, this is acceptable and makes reporting instant.
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
    LOOP
        UPDATE public.accounts
        SET current_balance = current_balance
            + COALESCE((v_line->>'debit')::DECIMAL, 0)
            - COALESCE((v_line->>'credit')::DECIMAL, 0)
        WHERE id = (v_line->>'account_id')::UUID;
    END LOOP;

    RETURN v_journal_id;
END;
$$;
