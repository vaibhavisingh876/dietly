import React, { useState, useEffect } from 'react'
import api from '../api/api'

export default function Pantry(){
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ name:'', qty:'' })

  useEffect(()=>{ fetchPantry() },[])

  async function fetchPantry(){
    try{
      const res = await api.get('/pantry')
      setItems(res.data)
    } catch(err){ console.error(err) }
  }

  async function addItem(){
    if(!newItem.name || !newItem.qty) return alert('Fill both fields')
    try{
      const res = await api.post('/pantry', newItem)
      setItems(res.data)
      setNewItem({ name:'', qty:'' })
    } catch(err){ console.error(err) }
  }

  async function delItem(index){
    try{
      const res = await api.delete(`/pantry/${index}`)
      setItems(res.data)
    } catch(err){ console.error(err) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pantry</h1>
      <div className="mb-2 flex gap-2">
        <input placeholder="Name" className="p-2 border rounded" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/>
        <input placeholder="Qty" className="p-2 border rounded" value={newItem.qty} onChange={e=>setNewItem({...newItem,qty:e.target.value})}/>
        <button onClick={addItem} className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
      </div>
      {items.map((i,idx)=>(
        <div key={idx} className="flex justify-between p-2 bg-white mb-1 rounded shadow">
          <span>{i.name} - {i.qty}</span>
          <button onClick={()=>delItem(idx)} className="text-red-600">Delete</button>
        </div>
      ))}
    </div>
  )
}

