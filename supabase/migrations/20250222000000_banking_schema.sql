-- 1. BANK TRANSACTIONS (Staging Table)
CREATE TYPE reconciliation_status AS ENUM ('UNMATCHED', 'MATCHED', 'EXCLUDED');

CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE, -- The Bank/CC Account in COA

    date DATE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL, -- Positive = Deposit, Negative = Withdrawal
    description TEXT,
    external_id VARCHAR(255), -- Transaction ID from the bank CSV

    status reconciliation_status DEFAULT 'UNMATCHED',
    matched_journal_entry_id UUID REFERENCES public.journal_entries(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_bank_tx_org_status ON public.bank_transactions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bank_tx_account ON public.bank_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_tx_date ON public.bank_transactions(date);

-- 3. RLS
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org Members Manage Bank Tx" ON public.bank_transactions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

-- 4. Trigger for updated_at
CREATE TRIGGER handle_bank_transactions_updated_at
    BEFORE UPDATE ON public.bank_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
