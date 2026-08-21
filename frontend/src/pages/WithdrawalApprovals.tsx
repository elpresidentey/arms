import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, DollarSign, User, Calendar } from 'lucide-react';
import Button from '../components/Button';
import { walletApi } from '../services/api';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: string;
  source: string;
  description: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed';
  externalTransactionId?: string;
  metadata: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    failureReason?: string;
    transferCode?: string;
    transferReference?: string;
    testMode?: boolean;
  };
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function WithdrawalApprovals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected' | 'failed'>('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      // Fetch all withdrawals (not just pending)
      const rows = await walletApi.getWithdrawals();
      setWithdrawals(rows as unknown as WithdrawalRequest[]);
    } catch (error: any) {
      console.error('Failed to fetch withdrawals:', error);
      toast.error(error?.message || 'Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal? This will initiate the bank transfer.')) {
      return;
    }

    try {
      setProcessing(true);
      const { error } = await supabase.functions.invoke('payouts', {
        body: { action: 'approve', id: withdrawalId },
      });
      if (error) throw error;
      toast.success('Withdrawal approved and transfer initiated successfully');
      fetchWithdrawals();
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to approve withdrawal:', error);
      toast.error(error?.message || 'This action is being migrated to Supabase and will be available soon.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this withdrawal request?')) {
      return;
    }

    try {
      setProcessing(true);
      const { error } = await supabase.functions.invoke('payouts', {
        body: { action: 'reject', id: withdrawalId, reason: rejectionReason },
      });
      if (error) throw error;
      toast.success('Withdrawal rejected successfully');
      fetchWithdrawals();
      setShowModal(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Failed to reject withdrawal:', error);
      toast.error(error?.message || 'This action is being migrated to Supabase and will be available soon.');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowModal(true);
    setRejectionReason('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setRejectionReason('');
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-amber-50 text-amber-700', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-primary-50 text-primary-700', icon: CheckCircle, text: 'Approved' },
      completed: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, text: 'Done' },
      rejected: { color: 'bg-rose-50 text-rose-700', icon: XCircle, text: 'Rejected' },
      failed: { color: 'bg-slate-100 text-slate-600', icon: AlertCircle, text: 'Failed' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `â‚¦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 text-slate-900">Withdrawal Management</h1>
          <p className="body text-slate-600 mt-1">Review, approve, and track all resident withdrawal requests</p>
        </div>
<Button onClick={fetchWithdrawals} variant="outline" size="md">
            Refresh
          </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="metric-panel group p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Requests</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{withdrawals.length}</p>
        </div>
        <div className="metric-panel group p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
            {withdrawals.filter((w) => w.status === 'pending').length}
          </p>
        </div>
        <div className="metric-panel group p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Done</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            {withdrawals.filter((w) => w.status === 'completed').length}
          </p>
        </div>
        <div className="metric-panel group p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            {withdrawals.filter((w) => w.status === 'rejected').length}
          </p>
        </div>
        <div className="metric-panel group p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Failed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-600">
            {withdrawals.filter((w) => w.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            {['all', 'pending', 'approved', 'completed', 'rejected', 'failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab === 'completed' ? 'Done' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Withdrawals List */}
        <div className="divide-y divide-slate-200">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No withdrawal requests found</p>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="heading-4 text-slate-900">
                        {formatCurrency(withdrawal.amount)}
                      </h3>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2 body-small text-slate-600">
                        <User className="w-4 h-4" />
                        <span>
                          {withdrawal.user
                            ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                            : 'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(withdrawal.createdAt)}</span>
                      </div>
                      <div className="body-small text-slate-600">
                        <span className="font-medium">Account:</span> {withdrawal.metadata?.accountName ?? 'N/A'}
                      </div>
                      <div className="body-small text-slate-600">
                        <span className="font-medium">Account Number:</span> {withdrawal.metadata?.accountNumber ?? 'N/A'}
                      </div>
                    </div>

                    {withdrawal.description && (
                      <p className="body-small text-slate-600 mt-2">{withdrawal.description}</p>
                    )}

                    {withdrawal.status === 'rejected' && withdrawal.metadata?.rejectionReason && (
                      <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <p className="text-sm text-rose-800">
                          <span className="font-medium">Rejection Reason:</span>{' '}
                          {withdrawal.metadata.rejectionReason}
                        </p>
                        {withdrawal.metadata.rejectedAt && (
                          <p className="text-xs text-rose-600 mt-1">
                            Rejected on {formatDate(withdrawal.metadata.rejectedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    {withdrawal.status === 'approved' && withdrawal.metadata?.approvedAt && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm text-emerald-800">
                          <span className="font-medium">Approved:</span>{' '}
                          {formatDate(withdrawal.metadata.approvedAt)}
                        </p>
                        {withdrawal.metadata.transferReference && (
                          <p className="text-xs text-emerald-600 mt-1">
                            Transfer Ref: {withdrawal.metadata.transferReference}
                          </p>
                        )}
                        {withdrawal.metadata.testMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            âš ï¸ Test Mode - No actual transfer
                          </p>
                        )}
                      </div>
                    )}

                    {withdrawal.status === 'failed' && withdrawal.metadata?.failureReason && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-800">
                          <span className="font-medium">Failure Reason:</span>{' '}
                          {withdrawal.metadata.failureReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openModal(withdrawal)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {withdrawal.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={processing}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openModal(withdrawal)}
                          disabled={processing}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="heading-3 text-slate-900">Withdrawal Request Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="body-small text-slate-600">Amount</p>
                  <p className="heading-4 text-slate-900">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div>
                  <p className="body-small text-slate-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
                <div>
                  <p className="body-small text-slate-600">Resident</p>
                  <p className="body font-medium text-slate-900">
                    {selectedWithdrawal.user
                      ? `${selectedWithdrawal.user.firstName} ${selectedWithdrawal.user.lastName}`
                      : 'Unknown'}
                  </p>
                  {selectedWithdrawal.user && (
                    <p className="caption text-slate-500">{selectedWithdrawal.user.email}</p>
                  )}
                </div>
                <div>
                  <p className="body-small text-slate-600">Request Date</p>
                  <p className="body font-medium text-slate-900">
                    {formatDate(selectedWithdrawal.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="body-small text-slate-600">Account Name</p>
                  <p className="body font-medium text-slate-900">
                    {selectedWithdrawal.metadata?.accountName ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="body-small text-slate-600">Account Number</p>
                  <p className="body font-medium text-slate-900">
                    {selectedWithdrawal.metadata?.accountNumber ?? 'N/A'}
                  </p>
                </div>
              </div>

              {selectedWithdrawal.description && (
                <div>
                  <p className="body-small text-slate-600">Description</p>
                  <p className="body text-slate-900 mt-1">{selectedWithdrawal.description}</p>
                </div>
              )}

              {selectedWithdrawal.status === 'pending' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              {selectedWithdrawal.status === 'completed' && selectedWithdrawal.metadata?.approvedAt && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm font-semibold text-emerald-900">âœ“ Withdrawal Completed</p>
                  <p className="text-sm text-emerald-800 mt-2">
                    Approved on {new Date(selectedWithdrawal.metadata.approvedAt).toLocaleString()}
                  </p>
                  {selectedWithdrawal.metadata.transferReference && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Transfer Ref: {selectedWithdrawal.metadata.transferReference}
                    </p>
                  )}
                  {selectedWithdrawal.metadata.testMode && (
                    <p className="text-xs text-amber-600 mt-1">
                      âš ï¸ Test Mode - No actual transfer
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={closeModal} disabled={processing}>
                Close
              </Button>
              {selectedWithdrawal.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(selectedWithdrawal.id)}
                    disabled={processing || !rejectionReason.trim()}
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedWithdrawal.id)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Approve & Transfer'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
