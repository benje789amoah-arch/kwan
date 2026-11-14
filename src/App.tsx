import { useEffect, type ReactNode } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { TabBar } from './ui'
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
import Account from './screens/Account'
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

/**
 * The four top-level screens share the tab bar. Booking, changing a stop and the missed-bus
 * screen are focused tasks with their own action pinned to the bottom, so they show a Back
 * button instead of stacking a second bar on a small phone.
 */
function Tabs() {
  return (
    <SignedIn>
      <div className="flex min-h-dvh flex-col">
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
        <TabBar />
      </div>
    </SignedIn>
  )
}

export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-canvas">
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route element={<Tabs />}>
            <Route path="/home" element={<Home />} />
            <Route path="/pass" element={<BoardingPass />} />
            <Route path="/routes" element={<FindRoute />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="/routes/:id" element={<SignedIn><Stops /></SignedIn>} />
          <Route path="/plan" element={<SignedIn><Plan /></SignedIn>} />
          <Route path="/pay" element={<SignedIn><Pay /></SignedIn>} />
          <Route path="/change-stop" element={<SignedIn><ChangeStop /></SignedIn>} />
          <Route path="/missed" element={<SignedIn><Missed /></SignedIn>} />
          <Route path="/driver" element={<Driver />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  )
}
