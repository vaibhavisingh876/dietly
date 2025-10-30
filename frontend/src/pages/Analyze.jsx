import React, { useState } from 'react'
import MealForm from '../components/MealForm'
import api from '../api/api'

export default function Analyze(){
  const [result, setResult] = useState(null)
  const [streak, setStreak] = useState(0)

  async function analyze(text){
    try{
      const res = await api.post('/meals/analyze', { text })
      setResult(res.data.meal.analysis)
      setStreak(res.data.streak.count)
    } catch(err){
      console.error(err)
      alert('Error analyzing meal')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analyze Meal</h1>
      <MealForm onSubmit={analyze}/>
      {result && <div className="mt-4 p-4 bg-white rounded shadow">
        <p>Streak: {streak}</p>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>}
    </div>
  )
}



