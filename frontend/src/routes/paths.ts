/** Public marketing & auth */
export const PATHS = {
  home: '/',
  residentLogin: '/resident/login',
  adminLogin: '/admin/login',
  login: '/login',
  residentRegister: '/resident/register',
  adminRegister: '/admin/register',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  app: '/app',
  appOperations: '/app/operations',
  appBills: '/app/bills',
  appBillReceipt: (billId: string) => `/app/bills/${billId}/receipt`,
  appPaymentVerify: '/app/payment/verify',
  appBillingAdmin: '/app/billing-admin',
  appFinance: '/app/finance',
  appWithdrawals: '/app/withdrawal-approvals',
  appWallet: '/app/wallet',
  appProfile: '/app/profile',

  info: (slug: string) => `/${slug}`,
} as const

export const INFO_PAGE_SLUGS = [
  'help',
  'contact',
  'faqs',
  'privacy',
  'terms',
  'cookies',
  'accessibility',
  'status',
  'api-docs',
  'security',
  'changelog',
] as const
