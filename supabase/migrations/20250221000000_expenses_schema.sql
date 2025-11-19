-- BILL LINES TABLE
CREATE TABLE IF NOT EXISTS public.bill_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(20, 2) DEFAULT 0.00,
    amount DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    account_id UUID REFERENCES public.accounts(id), -- Expense or Asset Account
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bill_lines ENABLE ROW LEVEL SECURITY;

-- Index for bill_lines
CREATE INDEX IF NOT EXISTS idx_bill_lines_bill ON public.bill_lines(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_lines_account ON public.bill_lines(account_id);

-- RLS Policy
CREATE POLICY "Org Members Access Bill Lines" ON public.bill_lines
    FOR ALL USING (
        bill_id IN (
            SELECT id FROM public.bills WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members
                WHERE user_id = auth.uid() AND deleted_at IS NULL
            )
        )
    );

-- 2. APPROVE BILL RPC (Finalize Bill -> GL)
CREATE OR REPLACE FUNCTION public.approve_bill(
    p_bill_id UUID,
    p_ap_account_id UUID, -- The Accounts Payable Liability Account
    p_date DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bill RECORD;
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

    -- Get Bill Details and verify ownership
    SELECT * INTO v_bill FROM public.bills
    WHERE id = p_bill_id AND organization_id = v_org_id;

    IF v_bill IS NULL THEN
        RAISE EXCEPTION 'Bill not found or access denied';
    END IF;

    IF v_bill.status != 'DRAFT' AND v_bill.status != 'OPEN' THEN
        -- Allow approving if currently DRAFT or OPEN
        RAISE EXCEPTION 'Bill status must be DRAFT or OPEN';
    END IF;

    -- Construct GL Lines
    -- A. Debit Lines (Expenses/Assets) from Bill Lines
    SELECT jsonb_agg(jsonb_build_object(
        'account_id', account_id,
        'description', description,
        'debit', amount,   -- DEBIT the Expense
        'credit', 0
    )) INTO v_lines
    FROM public.bill_lines
    WHERE bill_id = p_bill_id;

    -- B. Credit Line (Accounts Payable Liability)
    v_lines := v_lines || jsonb_build_object(
        'account_id', p_ap_account_id,
        'description', 'Bill #' || v_bill.bill_number || ' - ' || COALESCE((SELECT name FROM public.vendors WHERE id = v_bill.vendor_id), 'Unknown Vendor'),
        'debit', 0,
        'credit', v_bill.total_amount -- CREDIT the Liability
    );

    -- Call Post Journal Entry RPC
    v_journal_id := public.post_journal_entry(
        p_date,
        'Bill #' || v_bill.bill_number || ' - ' || COALESCE((SELECT name FROM public.vendors WHERE id = v_bill.vendor_id), 'Unknown Vendor'),
        'BILL',
        p_bill_id,
        'POSTED',
        v_lines
    );

    -- Update Bill Status to OPEN (Ready for payment)
    UPDATE public.bills
    SET status = 'OPEN', updated_at = NOW()
    WHERE id = p_bill_id;

    RETURN v_journal_id;
END;
$$;

-- 3. PAY BILL RPC (Record Payment -> GL)
CREATE OR REPLACE FUNCTION public.pay_bill(
    p_bill_id UUID,
    p_payment_account_id UUID, -- Asset (Bank/Cash)
    p_amount DECIMAL,
    p_date DATE,
    p_ref_number TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bill RECORD;
    v_ap_account_id UUID;
    v_journal_id UUID;
    v_lines JSONB;
    v_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = auth.uid() AND deleted_at IS NULL
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'User is not part of an organization';
    END IF;

    -- Get Bill Details and verify ownership
    SELECT * INTO v_bill FROM public.bills
    WHERE id = p_bill_id AND organization_id = v_org_id;

    IF v_bill IS NULL THEN
        RAISE EXCEPTION 'Bill not found or access denied';
    END IF;

    -- Find the AP account used for this bill.
    -- For V1, we'll look up the default system AP account for the Org.
    SELECT id INTO v_ap_account_id FROM public.accounts
    WHERE organization_id = v_org_id AND code = '2000' LIMIT 1; -- Assuming 2000 is AP

    IF v_ap_account_id IS NULL THEN
        RAISE EXCEPTION 'Accounts Payable account not found (code: 2000)';
    END IF;

    -- GL Entries
    -- 1. Debit AP (Reduce Liability)
    -- 2. Credit Bank (Reduce Cash)
    v_lines := jsonb_build_array(
        jsonb_build_object(
            'account_id', v_ap_account_id,
            'description', 'Payment for Bill #' || v_bill.bill_number,
            'debit', p_amount,
            'credit', 0
        ),
        jsonb_build_object(
            'account_id', p_payment_account_id,
            'description', 'Payment Ref: ' || p_ref_number,
            'debit', 0,
            'credit', p_amount
        )
    );

    v_journal_id := public.post_journal_entry(
        p_date,
        'Bill Payment: ' || v_bill.bill_number,
        'PAYMENT',
        p_bill_id,
        'POSTED',
        v_lines
    );

    -- Update Bill Status
    -- Simple logic: If full payment, mark PAID.
    IF p_amount >= v_bill.total_amount THEN
        UPDATE public.bills SET status = 'PAID' WHERE id = p_bill_id;
    ELSE
        UPDATE public.bills SET status = 'PARTIAL' WHERE id = p_bill_id;
    END IF;

    RETURN v_journal_id;
END;
$$;
