import {Route, Routes ,Navigate} from "react-router-dom"

import HomePage from "./pages/HomePage"
import PProfilePage from "./pages/Player-profile/PProfilePage"
import SignUpPage from "./pages/SignUpPage"
import LogInPage from "./pages/LogInPage"
import AboutUsPage from "./pages/AboutUsPage"
import HowItWorks from "./pages/HowItWorksPage"

import PDashboardPage from "./pages/Player-profile/PDashboardPage"
import PAddFriend from "./pages/Player-profile/PAddFriend"
import PHistoryPage from "./pages/Player-profile/PHistoryPage"

import PUpcomingMatches from "./pages/Player-profile/PUpcomingMatchesPage"

import FutsalHome from "./pages/FutsalHome"
import QuickFindFutsalPage from "./pages/QuickFindFutsalPage"
import TournamentPage from "./pages/TournamentPage"

import UpdateProfile from "./components/updatePage"

import ODashboard from "./pages/organizer-profile/ODashbaord"
import OHistory from "./pages/organizer-profile/OHistory"
import OMyFutsal from "./pages/organizer-profile/OMyFutsal"
import OSlotsPage from "./pages/organizer-profile/OSlotsPage"



import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"

import {Loader} from "lucide-react"

import { Toaster } from "react-hot-toast"

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()


  useEffect(() => {
    checkAuth()
  },
   [checkAuth])

  console.log({authUser})

  if(isCheckingAuth && !authUser  )
    return (<div className="flex items-center justify-center h-screen">
      <Loader className='size-10 animate-spin' />
    </div>)
  

  return (
    <div>
        
      <Routes>
        <Route path = '/'  element= {authUser? <HomePage />: <Navigate to='/login'/>} />
        <Route path = '/signup'  element= { !authUser? <SignUpPage />: <Navigate to = '/'/>}/>
        <Route path = '/login'  element= {!authUser?<LogInPage />: <Navigate to = '/'/>} />
        <Route path = '/about-us'  element= { authUser? <AboutUsPage />: <Navigate to='/login'/>} />
        <Route path = '/how-it-works'  element= { authUser? <HowItWorks />:<Navigate to = 'login'/>} />


        <Route path = '/player-profile'  element= {authUser?<PProfilePage />: <Navigate to='/login'/>} />
        <Route path = '/player-dashboard'  element= {authUser?<PDashboardPage />: <Navigate to='/login'/>} />
        <Route path = '/player-addfriend'  element= {authUser?<PAddFriend />: <Navigate to='/login'/>} />
        <Route path = '/player-history'  element= {authUser?<PHistoryPage />: <Navigate to='/login'/>} />
        <Route path = '/player-upcomingmatches'  element= {authUser?<PUpcomingMatches />: <Navigate to='/login'/>} />

        <Route path = '/futsalhome' element= {authUser?<FutsalHome />: <Navigate to='/login'/>} />
        <Route path = '/quickmatch' element= {authUser?<QuickFindFutsalPage />: <Navigate to='/login'/>} />
        <Route path = '/tournaments' element= {authUser?<TournamentPage />: <Navigate to='/login'/>} />

        <Route path = '/update-profile' element= {authUser?<UpdateProfile />: <Navigate to='/login'/>} />

        <Route path = '/organizer-dashboard' element= {authUser?<ODashboard />: <Navigate to='/login'/>} />
        <Route path = '/organizer-history' element= {authUser?<OHistory />: <Navigate to='/login'/>} />
        <Route path = '/organizer-futsals' element= {authUser?<OMyFutsal />: <Navigate to='/login'/>} />
        <Route path = '/organizer-slots' element= {authUser?<OSlotsPage />: <Navigate to='/login'/>} />

      </Routes>

      <Toaster />




    </div>
  )
}



export default App