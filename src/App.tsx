
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Index from './pages/Index'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Account from './pages/Account'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import './styles/globals.css'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Toaster position="top-right" richColors />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
