import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../contexts/SocketContext'
import ScrollToTop from '../components/ScrollToTop'
import ProtectedRoute from '../components/ProtectedRoute'
import { AppCatchAll, AppHome, GuestGuard, RoleGuard } from './guards'
import { INFO_PAGE_SLUGS, PATHS } from './paths'

const Layout = lazy(() => import('../components/Layout'))

const LandingPage = lazy(() => import('../pages/LandingPage'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))
const AuthCallback = lazy(() => import('../pages/AuthCallback'))
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage'))
const BootstrapAdmin = lazy(() => import('../pages/BootstrapAdmin'))
const AcceptAdminInvite = lazy(() => import('../pages/AcceptAdminInvite'))
const FooterInfoPage = lazy(() => import('../pages/FooterInfoPage'))
const VerifyReceiptPage = lazy(() => import('../pages/VerifyReceiptPage'))
const WasteHistory = lazy(() => import('../pages/WasteHistory'))
const Recyclables = lazy(() => import('../pages/Recyclables'))
const Wallet = lazy(() => import('../pages/Wallet'))
const Reports = lazy(() => import('../pages/Reports'))
const CollectionSchedules = lazy(() => import('../pages/CollectionSchedules'))
const CollectionRequests = lazy(() => import('../pages/CollectionRequests'))
const CollectionRequestsQueue = lazy(() => import('../pages/CollectionRequestsQueue'))
const Locations = lazy(() => import('../pages/LocationsWithMap'))
const ServiceRequests = lazy(() => import('../pages/ServiceRequests'))
const ServiceSchedules = lazy(() => import('../pages/ServiceSchedules'))
const Bills = lazy(() => import('../pages/Bills'))
const BillReceiptPage = lazy(() => import('../pages/BillReceiptPage'))
const PaymentVerification = lazy(() => import('../pages/PaymentVerification'))
const AdminBilling = lazy(() => import('../pages/AdminBilling'))
const FinanceDashboard = lazy(() =>
  import('../pages/FinanceDashboard').then((m) => ({ default: m.FinanceDashboard })),
)
const Operations = lazy(() => import('../pages/Operations'))
const FleetManagement = lazy(() => import('../pages/FleetManagement'))
const Profile = lazy(() => import('../pages/Profile'))
const ScheduleCollection = lazy(() => import('../pages/ScheduleCollection'))
const SubmitRecyclable = lazy(() => import('../pages/SubmitRecyclable'))
const WithdrawalApprovals = lazy(() => import('../pages/WithdrawalApprovals'))

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
  </div>
)

export const AppRoutes = () => (
  <AuthProvider>
    <SocketProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Marketing */}
          <Route path={PATHS.home} element={<LandingPage />} />

          {/* Auth — guests only when already signed in */}
          <Route
            path={PATHS.login}
            element={<Navigate to={PATHS.residentLogin} replace />}
          />
          <Route
            path={PATHS.register}
            element={<Navigate to={PATHS.residentRegister} replace />}
          />
          <Route
            path={PATHS.residentLogin}
            element={
              <GuestGuard>
                <Login />
              </GuestGuard>
            }
          />
          <Route
            path={PATHS.residentRegister}
            element={
              <GuestGuard>
                <Register />
              </GuestGuard>
            }
          />

          <Route path={PATHS.forgotPassword} element={<ForgotPassword />} />
          <Route path={PATHS.resetPassword} element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path={PATHS.bootstrap} element={<BootstrapAdmin />} />
          <Route path={PATHS.acceptInvite} element={<AcceptAdminInvite />} />
          <Route path={PATHS.verifyReceipt} element={<VerifyReceiptPage />} />

          {/* Static info pages (must stay after /app and /resident/*) */}
          {INFO_PAGE_SLUGS.map((slug) => (
            <Route key={slug} path={slug} element={<FooterInfoPage slug={slug} />} />
          ))}

          {/* Authenticated workspace */}
          <Route
            path={PATHS.app}
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AppHome />} />

            {/* Shared */}
            <Route path="waste-history" element={<WasteHistory />} />
            <Route path="recyclables" element={<Recyclables />} />
            <Route path="reports" element={<Reports />} />
            <Route path="schedules" element={<CollectionSchedules />} />
            <Route path="service-schedules" element={<ServiceSchedules />} />
            <Route path="locations" element={<Locations />} />
            <Route path="service-requests" element={<ServiceRequests />} />
            <Route path="profile" element={<Profile />} />

            {/* Resident-only */}
            <Route
              path="wallet"
              element={
                <RoleGuard access="resident">
                  <Wallet />
                </RoleGuard>
              }
            />
            <Route
              path="bills"
              element={
                <RoleGuard access="resident">
                  <Bills />
                </RoleGuard>
              }
            />
            <Route
              path="bills/:billId/receipt"
              element={
                <RoleGuard access="resident">
                  <BillReceiptPage />
                </RoleGuard>
              }
            />
            <Route
              path="payment/verify"
              element={
                <RoleGuard access="resident">
                  <PaymentVerification />
                </RoleGuard>
              }
            />
            <Route
              path="collection-requests"
              element={
                <RoleGuard access="resident">
                  <CollectionRequests />
                </RoleGuard>
              }
            />
            <Route
              path="schedule-collection"
              element={
                <RoleGuard access="resident">
                  <ScheduleCollection />
                </RoleGuard>
              }
            />
            <Route
              path="submit-recyclable"
              element={
                <RoleGuard access="resident">
                  <SubmitRecyclable />
                </RoleGuard>
              }
            />

            {/* Staff / operations */}
            <Route
              path="operations"
              element={
                <RoleGuard access="staff">
                  <Operations />
                </RoleGuard>
              }
            />
            <Route
              path="fleet"
              element={
                <RoleGuard access="staff">
                  <FleetManagement />
                </RoleGuard>
              }
            />
            <Route
              path="collection-requests-queue"
              element={
                <RoleGuard access="staff">
                  <CollectionRequestsQueue />
                </RoleGuard>
              }
            />
            <Route
              path="billing-admin"
              element={
                <RoleGuard access="billing-admin">
                  <AdminBilling />
                </RoleGuard>
              }
            />
            <Route
              path="finance"
              element={
                <RoleGuard access="finance">
                  <FinanceDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="withdrawal-approvals"
              element={
                <RoleGuard access="withdrawal-approver">
                  <WithdrawalApprovals />
                </RoleGuard>
              }
            />

            <Route path="*" element={<AppCatchAll />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Routes>
      </Suspense>
    </SocketProvider>
  </AuthProvider>
)

export default AppRoutes
