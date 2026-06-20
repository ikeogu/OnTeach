import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthGuard, GuestGuard } from './components/AuthGuard'
import DashboardLayout from './components/DashboardLayout'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import AccountType from './pages/auth/AccountType'
import Welcome from './pages/auth/Welcome'
import DashboardHome from './pages/dashboard/DashboardHome'
import SessionsList from './pages/dashboard/SessionsList'
import SessionDetail from './pages/dashboard/SessionDetail'
import CreateSession from './pages/sessions/CreateSession'
import UploadContent from './pages/sessions/UploadContent'
import GeneratingScript from './pages/sessions/GeneratingScript'
import ScriptEditor from './pages/sessions/editor/ScriptEditor'
import AvatarVoice from './pages/sessions/AvatarVoice'
import ReviewPublish from './pages/sessions/ReviewPublish'
import SessionPublished from './pages/sessions/SessionPublished'
import JoinPage from './pages/student/JoinPage'
import SessionLoading from './pages/student/SessionLoading'
import ActiveSession from './pages/student/ActiveSession'
import EmbedPlayer from './pages/student/EmbedPlayer'
import StudentsPage from './pages/dashboard/StudentsPage'
import GoogleCallback from './pages/auth/GoogleCallback'
import HomePage from './pages/marketing/HomePage'
import FeaturesPage from './pages/marketing/FeaturesPage'
import PricingPage from './pages/marketing/PricingPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Google OAuth callback — must be outside GuestGuard */}
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Guest-only */}
          <Route element={<GuestGuard />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Post-signup onboarding */}
          <Route element={<AuthGuard />}>
            <Route path="/onboarding/account-type" element={<AccountType />} />
            <Route path="/onboarding/welcome" element={<Welcome />} />
          </Route>

          {/* Full-screen session flows (no dashboard chrome) */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard/sessions/:id/edit" element={<ScriptEditor />} />
            <Route path="/dashboard/sessions/:id/upload" element={<UploadContent />} />
            <Route path="/dashboard/sessions/:id/generating" element={<GeneratingScript />} />
            <Route path="/dashboard/sessions/:id/avatar-voice" element={<AvatarVoice />} />
            <Route path="/dashboard/sessions/:id/review" element={<ReviewPublish />} />
            <Route path="/dashboard/sessions/:id/published" element={<SessionPublished />} />
          </Route>

          {/* Creator dashboard */}
          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/sessions" element={<SessionsList />} />
              <Route path="/dashboard/sessions/new" element={<CreateSession />} />
              <Route path="/dashboard/sessions/:id" element={<SessionDetail />} />
              <Route path="/dashboard/analytics" element={<div className="text-gray-400 p-4">Analytics — coming in Milestone 8</div>} />
              <Route path="/dashboard/students" element={<StudentsPage />} />
              <Route path="/dashboard/settings" element={<div className="text-gray-400 p-4">Settings — coming soon</div>} />
            </Route>
          </Route>

          {/* Student player — public, no auth required */}
          <Route path="/s/:shareSlug" element={<JoinPage />} />
          <Route path="/s/:shareSlug/loading" element={<SessionLoading />} />
          <Route path="/s/:shareSlug/play" element={<ActiveSession />} />

          {/* Embed player — iframe, no auth */}
          <Route path="/embed/:embedSlug" element={<EmbedPlayer />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
