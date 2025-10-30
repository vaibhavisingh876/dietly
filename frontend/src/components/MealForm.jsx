import React, { useState } from 'react'

export default function MealForm({ onSubmit }){
  const [text, setText] = useState('')
  return (
    <form onSubmit={e=>{e.preventDefault(); onSubmit(text); setText('')}} className="bg-white p-4 rounded shadow">
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 mb-2" placeholder="Describe your meal: e.g. 2 chapatis, paneer curry, salad"></textarea>
      <button className="bg-green-600 text-white px-4 py-2 rounded">Analyze Meal</button>
    </form>
  )
}

