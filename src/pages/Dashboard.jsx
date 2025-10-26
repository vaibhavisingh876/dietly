import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function Dashboard(){
  const [meals, setMeals] = useState([])
  const [streak, setStreak] = useState(0)

  useEffect(()=>{
    async function fetchMeals(){
      try{
        const res = await api.get('/meals')
        setMeals(res.data)
      } catch(err){ console.error(err) }
    }
    fetchMeals()
  },[])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Current Streak: <span className="font-semibold">{streak}</span></p>
      {meals.length ? meals.map(m=>
        <div key={m._id} className="bg-white p-3 mb-2 rounded shadow">
          <p>{m.text}</p>
          <pre className="text-sm">{JSON.stringify(m.analysis, null, 2)}</pre>
        </div>
      ) : <p>No meals logged yet.</p>}
    </div>
  )
}

