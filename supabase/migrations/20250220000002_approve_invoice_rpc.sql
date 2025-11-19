-- Approve Invoice & Post to GL
CREATE OR REPLACE FUNCTION public.approve_invoice(
    p_invoice_id UUID,
    p_ar_account_id UUID, -- The Accounts Receivable Account
    p_date DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice RECORD;
    v_lines JSONB;
    v_journal_id UUID;
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    v_user_id := auth.uid();

    -- Get user's organization
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = v_user_id AND deleted_at IS NULL
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'User is not part of an organization';
    END IF;

    -- Get Invoice Details and verify ownership
    SELECT * INTO v_invoice FROM public.invoices
    WHERE id = p_invoice_id AND organization_id = v_org_id;

    IF v_invoice IS NULL THEN
        RAISE EXCEPTION 'Invoice not found or access denied';
    END IF;

    IF v_invoice.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Invoice is already finalized';
    END IF;

    -- Construct GL Lines from Invoice Lines
    -- 1. Credit Lines (Revenue)
    SELECT jsonb_agg(jsonb_build_object(
        'account_id', account_id,
        'description', description,
        'debit', 0,
        'credit', amount
    )) INTO v_lines
    FROM public.invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- 2. Debit Line (Accounts Receivable)
    v_lines := v_lines || jsonb_build_object(
        'account_id', p_ar_account_id,
        'description', 'Invoice #' || v_invoice.invoice_number,
        'debit', v_invoice.total_amount,
        'credit', 0
    );

    -- Call the existing post_journal_entry RPC (Reuse!)
    -- We assume post_journal_entry handles the balancing check
    v_journal_id := public.post_journal_entry(
        p_date,
        'Invoice #' || v_invoice.invoice_number || ' - ' || COALESCE((SELECT name FROM public.customers WHERE id = v_invoice.customer_id), 'Unknown Customer'),
        'INVOICE',
        p_invoice_id,
        'POSTED',
        v_lines
    );

    -- Update Invoice Status
    UPDATE public.invoices
    SET status = 'SENT', updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN v_journal_id;
END;
$$;
