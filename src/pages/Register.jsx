import React, { useState } from 'react'
import api from '../api/api'
import { saveAuth } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/auth/register', form)
      saveAuth(res.data)
      nav('/')
    } catch(err){
      alert(err?.response?.data?.msg || 'Error')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <input className="w-full mb-2 p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input className="w-full mb-2 p-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input className="w-full mb-2 p-2" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
    </form>
  )
}

