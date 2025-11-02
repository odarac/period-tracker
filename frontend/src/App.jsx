import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './layout/Header'
import Footer from './layout/Footer'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'
import History from './components/History'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-fill container py-5">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/log-in" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>      
    </Router>
  )
}

export default App
