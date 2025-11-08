import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import TemplateCard from '../components/TemplateCard'

export default function Favorites(){
  const { authAxios } = useAuth()
  const [favs, setFavs] = useState([])

  useEffect(()=>{
    authAxios.get('/api/favorites').then(r=>setFavs(r.data)).catch(()=>{})
  },[])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Favorites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favs.map(f => (
          <TemplateCard key={f.template.id} template={f.template} onFavorite={()=>{}} isFavorited={true} />
        ))}
      </div>
    </div>
  )
}
