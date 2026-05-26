import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, DollarSign, User, Calendar } from 'lucide-react';
import api from '../services/api';
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
      const response = await api.get('/wallet/withdrawals');
      setWithdrawals(response.data);
    } catch (error: any) {
      console.error('Failed to fetch withdrawals:', error);
      toast.error(error.response?.data?.message || 'Failed to load withdrawal requests');
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
      await api.post(`/wallet/admin/withdrawals/${withdrawalId}/approve`);
      toast.success('Withdrawal approved and transfer initiated successfully');
      fetchWithdrawals();
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to approve withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to approve withdrawal');
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
      await api.post(`/wallet/admin/withdrawals/${withdrawalId}/reject`, {
        reason: rejectionReason,
      });
      toast.success('Withdrawal rejected successfully');
      fetchWithdrawals();
      setShowModal(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Failed to reject withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Approved' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Done' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      failed: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Failed' },
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
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <h1 className="heading-1 text-gray-900">Withdrawal Management</h1>
          <p className="body text-gray-600 mt-1">Review, approve, and track all resident withdrawal requests</p>
        </div>
        <button
          onClick={fetchWithdrawals}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-gray-600">Total Requests</p>
              <p className="heading-3 text-gray-900">{withdrawals.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-gray-600">Pending</p>
              <p className="heading-3 text-yellow-600">
                {withdrawals.filter((w) => w.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-gray-600">Done</p>
              <p className="heading-3 text-green-600">
                {withdrawals.filter((w) => w.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-gray-600">Rejected</p>
              <p className="heading-3 text-red-600">
                {withdrawals.filter((w) => w.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-gray-600">Failed</p>
              <p className="heading-3 text-gray-600">
                {withdrawals.filter((w) => w.status === 'failed').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['all', 'pending', 'approved', 'completed', 'rejected', 'failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'completed' ? 'Done' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Withdrawals List */}
        <div className="divide-y divide-gray-200">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No withdrawal requests found</p>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="heading-4 text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </h3>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2 body-small text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {withdrawal.user
                            ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                            : 'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(withdrawal.createdAt)}</span>
                      </div>
                      <div className="body-small text-gray-600">
                        <span className="font-medium">Account:</span> {withdrawal.metadata.accountName}
                      </div>
                      <div className="body-small text-gray-600">
                        <span className="font-medium">Account Number:</span> {withdrawal.metadata.accountNumber}
                      </div>
                    </div>

                    {withdrawal.description && (
                      <p className="body-small text-gray-600 mt-2">{withdrawal.description}</p>
                    )}

                    {withdrawal.status === 'rejected' && withdrawal.metadata.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Rejection Reason:</span>{' '}
                          {withdrawal.metadata.rejectionReason}
                        </p>
                        {withdrawal.metadata.rejectedAt && (
                          <p className="text-xs text-red-600 mt-1">
                            Rejected on {formatDate(withdrawal.metadata.rejectedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    {withdrawal.status === 'approved' && withdrawal.metadata.approvedAt && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Approved:</span>{' '}
                          {formatDate(withdrawal.metadata.approvedAt)}
                        </p>
                        {withdrawal.metadata.transferReference && (
                          <p className="text-xs text-green-600 mt-1">
                            Transfer Ref: {withdrawal.metadata.transferReference}
                          </p>
                        )}
                        {withdrawal.metadata.testMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ Test Mode - No actual transfer
                          </p>
                        )}
                      </div>
                    )}

                    {withdrawal.status === 'failed' && withdrawal.metadata.failureReason && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">Failure Reason:</span>{' '}
                          {withdrawal.metadata.failureReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openModal(withdrawal)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {withdrawal.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={processing}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(withdrawal)}
                          disabled={processing}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="heading-3 text-gray-900">Withdrawal Request Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="body-small text-gray-600">Amount</p>
                  <p className="heading-4 text-gray-900">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div>
                  <p className="body-small text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
                <div>
                  <p className="body-small text-gray-600">Resident</p>
                  <p className="body font-medium text-gray-900">
                    {selectedWithdrawal.user
                      ? `${selectedWithdrawal.user.firstName} ${selectedWithdrawal.user.lastName}`
                      : 'Unknown'}
                  </p>
                  {selectedWithdrawal.user && (
                    <p className="caption text-gray-500">{selectedWithdrawal.user.email}</p>
                  )}
                </div>
                <div>
                  <p className="body-small text-gray-600">Request Date</p>
                  <p className="body font-medium text-gray-900">
                    {formatDate(selectedWithdrawal.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="body-small text-gray-600">Account Name</p>
                  <p className="body font-medium text-gray-900">
                    {selectedWithdrawal.metadata.accountName}
                  </p>
                </div>
                <div>
                  <p className="body-small text-gray-600">Account Number</p>
                  <p className="body font-medium text-gray-900">
                    {selectedWithdrawal.metadata.accountNumber}
                  </p>
                </div>
              </div>

              {selectedWithdrawal.description && (
                <div>
                  <p className="body-small text-gray-600">Description</p>
                  <p className="body text-gray-900 mt-1">{selectedWithdrawal.description}</p>
                </div>
              )}

              {selectedWithdrawal.status === 'pending' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              {selectedWithdrawal.status === 'completed' && selectedWithdrawal.metadata.approvedAt && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900">✓ Withdrawal Completed</p>
                  <p className="text-sm text-green-800 mt-2">
                    Approved on {new Date(selectedWithdrawal.metadata.approvedAt).toLocaleString()}
                  </p>
                  {selectedWithdrawal.metadata.transferReference && (
                    <p className="text-xs text-green-700 mt-1">
                      Transfer Ref: {selectedWithdrawal.metadata.transferReference}
                    </p>
                  )}
                  {selectedWithdrawal.metadata.testMode && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Test Mode - No actual transfer
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={processing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Close
              </button>
              {selectedWithdrawal.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedWithdrawal.id)}
                    disabled={processing || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedWithdrawal.id)}
                    disabled={processing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Approve & Transfer'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
