import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BALANCE_AFFECTING_STATUSES = ['approved', 'pending', 'completed']

interface TxRow {
  type: string
  amount: number
  status?: string | null
  source?: string | null
  createdAt?: string | null
}

const asNumber = (value: unknown): number => Number(value) || 0

export function affectsBalance(status?: string | null): boolean {
  return BALANCE_AFFECTING_STATUSES.includes(status || 'approved')
}

export async function fetchBalance(client: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await client.from('wallet_transactions').select('type,amount,status').eq('userId', userId)
  if (error) {
    throw new Error(error.message)
  }
  const rows = (data ?? []) as TxRow[]
  return rows.reduce((sum, tx) => {
    if (!affectsBalance(tx.status)) return sum
    const amount = asNumber(tx.amount)
    return tx.type === 'credit' ? sum + amount : sum - amount
  }, 0)
}

export async function fetchDailyWithdrawn(client: SupabaseClient, userId: string): Promise<number> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { data, error } = await client
    .from('wallet_transactions')
    .select('amount,status')
    .eq('userId', userId)
    .eq('type', 'debit')
    .eq('source', 'withdrawal')
    .gte('createdAt', start.toISOString())
  if (error) {
    throw new Error(error.message)
  }
  const rows = (data ?? []) as TxRow[]
  return rows.reduce((sum, tx) => (affectsBalance(tx.status) ? sum + asNumber(tx.amount) : sum), 0)
}