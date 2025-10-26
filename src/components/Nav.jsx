import React from 'react'
import { Link } from 'react-router-dom'
import { getUser, logout } from '../utils/auth'

export default function Nav(){
  const user = getUser()
  return (
    <nav className="bg-white shadow">
      <div className="max-w-4xl mx-auto p-4 flex justify-between">
        <div className="font-bold">Fusion Meal</div>
        <div className="flex gap-3 items-center">
          <Link to="/">Dashboard</Link>
          <Link to="/analyze">Analyze</Link>
          <Link to="/pantry">Pantry</Link>
          {user ? (
            <>
              <span>{user.name}</span>
              <button onClick={logout} className="text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

