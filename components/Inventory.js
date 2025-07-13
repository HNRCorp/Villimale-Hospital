import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // 📦 FETCH ITEMS
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('inventory').select('*')
      if (error) {
        console.error('Error fetching inventory:', error)
      } else {
        setItems(data)
      }
      setLoading(false)
    }
    fetchItems()
  }, [])

  // ➕ ADD NEW ITEM
  const addItem = async () => {
    const newItem = {
      name: 'New Item',
      quantity: 10,
      category: 'General',
    }
    const { data, error } = await supabase.from('inventory').insert([newItem])
    if (error) {
      console.error('Error adding item:', error)
    } else {
      setItems([...items, data[0]]) // Update UI with new item
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Inventory</h1>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - Qty: {item.quantity} ({item.category})
          </li>
        ))}
      </ul>
    </div>
  )
}
