import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../contexts/SocketContext'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import ScrollToTop from '../components/ScrollToTop'
import LandingPage from '../pages/LandingPage'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import AuthCallback from '../pages/AuthCallback'
import FooterInfoPage from '../pages/FooterInfoPage'
import WasteHistory from '../pages/WasteHistory'
import Recyclables from '../pages/Recyclables'
import Wallet from '../pages/Wallet'
import Reports from '../pages/Reports'
import CollectionSchedules from '../pages/CollectionSchedules'
import CollectionRequests from '../pages/CollectionRequests'
import CollectionRequestsQueue from '../pages/CollectionRequestsQueue'
import Locations from '../pages/Locations'
import ServiceRequests from '../pages/ServiceRequests'
import ServiceSchedules from '../pages/ServiceSchedules'
import Bills from '../pages/Bills'
import BillReceiptPage from '../pages/BillReceiptPage'
import PaymentVerification from '../pages/PaymentVerification'
import AdminBilling from '../pages/AdminBilling'
import { FinanceDashboard } from '../pages/FinanceDashboard'
import Operations from '../pages/Operations'
import Profile from '../pages/Profile'
import ScheduleCollection from '../pages/ScheduleCollection'
import SubmitRecyclable from '../pages/SubmitRecyclable'
import WithdrawalApprovals from '../pages/WithdrawalApprovals'
import { AppCatchAll, AppHome, GuestGuard, RoleGuard } from './guards'
import { INFO_PAGE_SLUGS, PATHS } from './paths'

export const AppRoutes = () => (
  <AuthProvider>
    <SocketProvider>
      <ScrollToTop />
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
          path={PATHS.adminLogin}
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
        <Route
          path={PATHS.adminRegister}
          element={
            <GuestGuard>
              <Register />
            </GuestGuard>
          }
        />
        <Route path={PATHS.forgotPassword} element={<ForgotPassword />} />
        <Route path={PATHS.resetPassword} element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Static info pages (must stay after /app and /resident/*) */}
        {INFO_PAGE_SLUGS.map((slug) => (
          <Route key={slug} path={slug} element={<FooterInfoPage />} />
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
    </SocketProvider>
  </AuthProvider>
)

export default AppRoutes
