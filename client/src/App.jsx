import React from 'react'
import './App.css'
import Form from './modules/form/Index'
import Dashboard from './modules/dashboard/Dashboard'
import {Routes, Route, Navigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
  const isLoggedIn = localStorage.getItem('user:token') !== null || true

  if(!isLoggedIn){ 
  
    return  <Navigate to={'/users/sign_in'} />
  }

  else if (isLoggedIn && ['/sign_in','/sign_up'].includes(window.location.href)){
    return <Navigate to={'/'}/> 
  }

  
  return children
}

export default function App() {

  return (
    <Routes>
        <Route path='/' element={
          <ProtectedRoute>
              <Dashboard/>
          </ProtectedRoute>
        } />
        <Route path='/users/sign_in' element={
            <ProtectedRoute>
              <Form isSignInPage={true}/>
            </ProtectedRoute> } />
        <Route path='/users/sign_up' element={
          
          <ProtectedRoute>
            <Form isSignInPage={false}/>
          </ProtectedRoute>}/>
    </Routes>
    
  )
}