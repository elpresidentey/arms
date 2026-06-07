import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { walletApi } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency, formatDayTime } from '../utils/format'

const Wallet: React.FC = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const payoutsEnabled =
    import.meta.env.VITE_ENABLE_PAYOUTS !== 'false' &&
    Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: walletApi.getBalance,
    enabled: Boolean(user?.id),
  })

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: walletApi.getTransactions,
    enabled: Boolean(user?.id),
  })

  const {
    data: withdrawalLimits,
    isLoading: isLimitsLoading,
    isError: isLimitsError,
  } = useQuery({
    queryKey: ['wallet-withdrawal-limits', user?.id],
    queryFn: walletApi.getWithdrawalLimits,
    enabled: payoutsEnabled && Boolean(user?.id),
  })

  const {
    data: walletSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ['wallet-summary', user?.id],
    queryFn: walletApi.getSummary,
    enabled: Boolean(user?.id),
  })

  const {
    data: banks,
    isLoading: isBanksLoading,
    isError: isBanksError,
  } = useQuery({
    queryKey: ['wallet-banks'],
    queryFn: walletApi.getBanks,
    enabled: payoutsEnabled && showWithdraw,
  })

  const cleanAccountNumber = accountNumber.replace(/\D/g, '')
  const {
    data: resolvedAccount,
    isFetching: isResolvingAccount,
    isError: isAccountResolutionError,
    error: accountResolutionError,
  } = useQuery({
    queryKey: ['wallet-account-resolution', cleanAccountNumber, bankCode],
    queryFn: () => walletApi.resolveAccount({ accountNumber: cleanAccountNumber, bankCode }),
    enabled: payoutsEnabled && showWithdraw && cleanAccountNumber.length === 10 && Boolean(bankCode),
    retry: false,
  })

  const withdrawMutation = useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet-withdrawal-limits', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet-summary', user?.id] })
      setShowWithdraw(false)
      setWithdrawAmount('')
      setBankCode('')
      setAccountNumber('')
      toast.success('Payout transfer initiated.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not process withdrawal.'))
    },
  })

  const currentBalance = balance?.balance || 0
  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0

  const minWithdrawal = withdrawalLimits?.minAmount ?? 10
  const perTransactionMax = withdrawalLimits?.maxAmount ?? 1000
  const remainingDaily = withdrawalLimits?.remainingDaily ?? 0
  const allowedMax = Math.max(0, Math.min(currentBalance, perTransactionMax, remainingDaily))

  const handleWithdraw = (event: React.FormEvent) => {
    event.preventDefault()

    if (
      parsedWithdrawAmount >= minWithdrawal &&
      parsedWithdrawAmount <= allowedMax &&
      resolvedAccount &&
      bankCode &&
      cleanAccountNumber.length === 10
    ) {
      withdrawMutation.mutate({
        amount: parsedWithdrawAmount,
        bankCode,
        accountNumber: cleanAccountNumber,
        accountName: resolvedAccount.account_name,
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wallet"
        title="Wallet and payout requests"
        description="Track recycling earnings, monitor balance movement, and submit payout requests for operations review."
        action={
          payoutsEnabled ? (
            <button
              type="button"
              onClick={() => setShowWithdraw((current) => !current)}
              className="btn btn-primary h-11 px-4"
              disabled={currentBalance <= 0}
            >
              {showWithdraw ? 'Close form' : 'Request payout'}
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-primary-100 bg-primary-700 px-4 py-3 text-white shadow-sm">
              <p className="label text-primary-200">Balance</p>
              <p className="mt-2 heading-3 text-white">{isBalanceLoading ? 'Loading...' : formatCurrency(currentBalance)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Total earned</p>
              <p className="mt-2 heading-3 text-slate-950">
                {isSummaryLoading ? 'Loading...' : formatCurrency(walletSummary?.totalCredits || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Total withdrawn</p>
              <p className="mt-2 heading-3 text-slate-950">
                {isSummaryLoading ? 'Loading...' : formatCurrency(walletSummary?.totalDebits || 0)}
              </p>
            </div>
          </div>
        }
      />

      {!payoutsEnabled ? (
        <Surface
          title="Payout requests are not enabled for MVP"
          subtitle="Wallet earnings remain visible, but bank payouts stay disabled until Paystack and reconciliation are fully production-tested."
        >
          <StatePanel
            title="Payouts coming after MVP hardening"
            description="Enable VITE_ENABLE_PAYOUTS=true only after live Paystack transfers, bank verification, limits, and finance reconciliation have been tested end-to-end."
          />
        </Surface>
      ) : null}

      {payoutsEnabled && showWithdraw && (
        <Surface
          title="Request payout"
          subtitle="Send available wallet balance to a verified Nigerian bank account through Paystack."
        >
          <form onSubmit={handleWithdraw} className="space-y-4">
            {isLimitsError || isSummaryError ? (
              <StatePanel
                tone="error"
                title="Couldn't load withdrawal limits"
                description="Please try again in a moment."
              />
            ) : isLimitsLoading ? (
              <StatePanel
                tone="loading"
                title="Loading limits"
                description="Preparing withdrawal rules for your account."
              />
            ) : null}
            {isBanksError ? (
              <StatePanel
                tone="error"
                title="Couldn't load banks"
                description="Paystack bank list is temporarily unavailable."
              />
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="withdraw-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payout amount
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  min={minWithdrawal}
                  max={allowedMax}
                  className="input"
                  placeholder="Enter payout amount"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="withdraw-bank" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Bank
                </label>
                <select
                  id="withdraw-bank"
                  className="input"
                  value={bankCode}
                  onChange={(event) => setBankCode(event.target.value)}
                  disabled={isBanksLoading}
                >
                  <option value="">{isBanksLoading ? 'Loading banks...' : 'Select bank'}</option>
                  {banks?.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="withdraw-account" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account number
                </label>
                <input
                  id="withdraw-account"
                  inputMode="numeric"
                  maxLength={10}
                  className="input"
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {isResolvingAccount ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying account...
                  </p>
                ) : resolvedAccount ? (
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {resolvedAccount.account_name}
                  </p>
                ) : isAccountResolutionError ? (
                  <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                    <p className="text-sm font-medium text-rose-700">
                      Account could not be verified
                    </p>
                    <p className="mt-1 text-xs text-rose-600">
                      {getErrorMessage(accountResolutionError, 'Please check the bank and account number. If using test mode, ensure you have a valid test account.')}
                    </p>
                  </div>
                ) : cleanAccountNumber.length === 10 && bankCode ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Enter a valid 10-digit account number to verify
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Minimum withdrawal: {formatCurrency(minWithdrawal)}</p>
                <p className="mt-1 text-sm text-slate-500">Max per transaction: {formatCurrency(perTransactionMax)}</p>
                <p className="mt-1 text-sm text-slate-500">Remaining today: {formatCurrency(remainingDaily)}</p>
                <p className="mt-1 text-sm text-slate-500">Available balance: {formatCurrency(currentBalance)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="btn btn-secondary h-11 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    withdrawMutation.isPending ||
                    parsedWithdrawAmount < minWithdrawal ||
                    parsedWithdrawAmount > allowedMax ||
                    allowedMax <= 0 ||
                    !resolvedAccount ||
                    !bankCode ||
                    cleanAccountNumber.length !== 10
                  }
                  className="btn btn-primary h-11 px-4"
                >
                  {withdrawMutation.isPending ? 'Sending...' : 'Send payout'}
                </button>
              </div>
            </div>
          </form>
        </Surface>
      )}

      <Surface
        title="Transactions"
        subtitle="Every credit and debit stays visible for quick reconciliation."
      >
        {isBalanceError || isTransactionsError ? (
          <StatePanel
            tone="error"
            title="Couldn't load wallet activity"
            description="Balance or transaction history is temporarily unavailable."
          />
        ) : isTransactionsLoading ? (
          <StatePanel
            tone="loading"
            title="Loading transactions"
            description="Fetching the latest wallet activity."
          />
        ) : !transactions?.length ? (
          <StatePanel
            title="No transactions yet"
            description="Your credits and withdrawals will appear here once wallet activity begins."
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      transaction.type === 'credit'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {transaction.type === 'credit' ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-950">
                      {transaction.source.replace('_', ' ')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDayTime(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Balance after: {formatCurrency(transaction.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default Wallet
