import { useEffect, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import Welcome from './screens/Welcome'
import SignIn from './screens/SignIn'
import Home from './screens/Home'
import FindRoute from './screens/FindRoute'
import Stops from './screens/Stops'
import Plan from './screens/Plan'
import Pay from './screens/Pay'
import BoardingPass from './screens/BoardingPass'
import ChangeStop from './screens/ChangeStop'
import Missed from './screens/Missed'
import Driver from './screens/Driver'

/** Each screen starts at the top instead of inheriting the last screen's scroll position. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function SignedIn({ children }: { children: ReactNode }) {
  const { state } = useStore()
  return state.name ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-paper shadow-xl">
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/home" element={<SignedIn><Home /></SignedIn>} />
          <Route path="/routes" element={<SignedIn><FindRoute /></SignedIn>} />
          <Route path="/routes/:id" element={<SignedIn><Stops /></SignedIn>} />
          <Route path="/plan" element={<SignedIn><Plan /></SignedIn>} />
          <Route path="/pay" element={<SignedIn><Pay /></SignedIn>} />
          <Route path="/pass" element={<SignedIn><BoardingPass /></SignedIn>} />
          <Route path="/change-stop" element={<SignedIn><ChangeStop /></SignedIn>} />
          <Route path="/missed" element={<SignedIn><Missed /></SignedIn>} />
          <Route path="/driver" element={<Driver />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  )
}
