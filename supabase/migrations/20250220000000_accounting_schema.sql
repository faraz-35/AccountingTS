-- supabase/migrations/20250220000000_accounting_schema.sql

-- 1. ENUMS
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE journal_status AS ENUM ('DRAFT', 'POSTED', 'ARCHIVED');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'VOID');
CREATE TYPE bill_status AS ENUM ('OPEN', 'PAID', 'PARTIAL', 'OVERDUE', 'VOID');

-- 2. CHART OF ACCOUNTS (COA)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type account_type NOT NULL,
    is_system BOOLEAN DEFAULT false, -- Prevents deletion of core accounts
    parent_account_id UUID REFERENCES public.accounts(id),
    current_balance DECIMAL(20, 2) DEFAULT 0.00, -- Denormalized for performance, updated via triggers/logic
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT accounts_code_org_unique UNIQUE (organization_id, code)
);

-- 3. JOURNAL ENTRIES (The Ledger Header)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entry_number SERIAL, -- Auto-incrementing ID for human reference
    date DATE NOT NULL,
    description TEXT,
    status journal_status DEFAULT 'DRAFT',
    reference_type VARCHAR(50), -- 'INVOICE', 'BILL', 'PAYMENT', 'MANUAL'
    reference_id UUID,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. JOURNAL ENTRY LINES (Debits/Credits)
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id),
    description TEXT,
    debit DECIMAL(20, 2) DEFAULT 0.00,
    credit DECIMAL(20, 2) DEFAULT 0.00,

    -- Ensure line belongs to same org as header (optional strictness)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS (Extends profiles or standalone? Standalone for accounting usually)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENDORS
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    invoice_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'DRAFT',
    total_amount DECIMAL(20, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT invoices_number_org_unique UNIQUE (organization_id, invoice_number)
);

-- 8. INVOICE LINES
CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(20, 2) DEFAULT 0.00,
    amount DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    account_id UUID REFERENCES public.accounts(id), -- Revenue account
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BILLS
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id),
    bill_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status bill_status DEFAULT 'OPEN',
    total_amount DECIMAL(20, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_accounts_org ON public.accounts(organization_id);
CREATE INDEX idx_journal_entries_org_date ON public.journal_entries(organization_id, date);
CREATE INDEX idx_journal_lines_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines(account_id);
CREATE INDEX idx_invoices_org_status ON public.invoices(organization_id, status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Helper function to check org access (Reusing existing logic patterns)
-- We assume 'organization_members' table exists from the starter template

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Generic Policy: View/Edit based on Organization Membership
-- Note: In production, we might optimize this with a claim or a security definer function to avoid join overhead,
-- but for standard accounting volume, this subquery pattern is acceptable.

CREATE POLICY "Org Members Access Accounts" ON public.accounts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

CREATE POLICY "Org Members Access Journal Entries" ON public.journal_entries
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

-- Journal Lines inherit access via the Entry, but for direct RLS, we need to join up to Entry -> Org
-- For simplicity in V1, we assume if you have access to the Entry ID, you can see the line.
-- However, strictly speaking, we should verify the org.
CREATE POLICY "Org Members Access Journal Lines" ON public.journal_entry_lines
    FOR ALL USING (
        journal_entry_id IN (
            SELECT id FROM public.journal_entries WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members
                WHERE user_id = auth.uid() AND deleted_at IS NULL
            )
        )
    );

CREATE POLICY "Org Members Access Invoices" ON public.invoices
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

CREATE POLICY "Org Members Access Customers" ON public.customers
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

CREATE POLICY "Org Members Access Vendors" ON public.vendors
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

CREATE POLICY "Org Members Access Invoice Lines" ON public.invoice_lines
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM public.invoices WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members
                WHERE user_id = auth.uid() AND deleted_at IS NULL
            )
        )
    );

CREATE POLICY "Org Members Access Bills" ON public.bills
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

-- =============================================
-- AUTOMATION: Seed Default COA
-- =============================================

CREATE OR REPLACE FUNCTION public.seed_default_accounts()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    org_id := NEW.id;

    -- ASSETS
    INSERT INTO public.accounts (organization_id, code, name, type, is_system) VALUES
    (org_id, '1000', 'Cash on Hand', 'ASSET', true),
    (org_id, '1010', 'Checking Account', 'ASSET', false),
    (org_id, '1200', 'Accounts Receivable', 'ASSET', true),
    (org_id, '1500', 'Original Asset', 'ASSET', false);

    -- LIABILITIES
    INSERT INTO public.accounts (organization_id, code, name, type, is_system) VALUES
    (org_id, '2000', 'Accounts Payable', 'LIABILITY', true),
    (org_id, '2100', 'Sales Tax Payable', 'LIABILITY', true);

    -- EQUITY
    INSERT INTO public.accounts (organization_id, code, name, type, is_system) VALUES
    (org_id, '3000', 'Owner Equity', 'EQUITY', false),
    (org_id, '3900', 'Retained Earnings', 'EQUITY', true);

    -- REVENUE
    INSERT INTO public.accounts (organization_id, code, name, type, is_system) VALUES
    (org_id, '4000', 'Sales Revenue', 'REVENUE', false),
    (org_id, '4100', 'Service Income', 'REVENUE', false);

    -- EXPENSES
    INSERT INTO public.accounts (organization_id, code, name, type, is_system) VALUES
    (org_id, '5000', 'Cost of Goods Sold', 'EXPENSE', false),
    (org_id, '6000', 'Advertising', 'EXPENSE', false),
    (org_id, '6010', 'Rent Expense', 'EXPENSE', false),
    (org_id, '6020', 'Office Supplies', 'EXPENSE', false);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Organization Creation
CREATE TRIGGER on_org_created_seed_accounts
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_default_accounts();

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER handle_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
