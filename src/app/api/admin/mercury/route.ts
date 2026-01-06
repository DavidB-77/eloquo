import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MERCURY_API_URL = 'https://api.mercury.com/api/v1';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const token = process.env.MERCURY_API_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'Mercury API token not configured' }, { status: 500 });
        }

        const accountsRes = await fetch(`${MERCURY_API_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!accountsRes.ok) {
            const error = await accountsRes.json();
            console.error('Mercury API error:', error);
            return NextResponse.json({ error: 'Failed to fetch Mercury data' }, { status: 500 });
        }

        const accountsData = await accountsRes.json();
        
        const accounts = await Promise.all(
            accountsData.accounts.map(async (acc: any) => {
                let transactions: any[] = [];
                try {
                    const txRes = await fetch(
                        `${MERCURY_API_URL}/account/${acc.id}/transactions?limit=5`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (txRes.ok) {
                        const txData = await txRes.json();
                        transactions = (txData.transactions || []).map((tx: any) => ({
                            id: tx.id,
                            date: tx.postedAt || tx.createdAt,
                            description: tx.bankDescription || tx.externalMemo || 'Transaction',
                            amount: tx.amount,
                            type: tx.amount >= 0 ? 'credit' : 'debit',
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching transactions:', err);
                }

                return {
                    id: acc.id,
                    name: acc.name,
                    type: acc.kind,
                    balance: acc.currentBalance,
                    accountNumber: acc.accountNumber.slice(-4),
                    transactions,
                };
            })
        );

        const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

        return NextResponse.json({ success: true, accounts, totalBalance });
    } catch (error) {
        console.error('Mercury API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
