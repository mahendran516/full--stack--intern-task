import React from 'react'

export default function TemplateCard({ template, onFavorite, isFavorited }){
  const img = template.thumbnail_url && template.thumbnail_url.trim() !== ''
    ? template.thumbnail_url
    : 'https://via.placeholder.com/600x400?text=No+Image'

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col">
      <div className="h-40 w-full overflow-hidden rounded mb-3 bg-gray-100">
        <img src={img} alt={template.name} className="w-full h-full object-cover"/>
      </div>
      <h3 className="font-semibold">{template.name}</h3>
      <p className="text-sm text-gray-600 flex-1">{template.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{template.category}</span>
        <button onClick={() => onFavorite(template.id)} className={`px-3 py-1 rounded ${isFavorited ? 'bg-yellow-400' : 'bg-blue-500 text-white'}`}>
          {isFavorited ? 'Favorited' : 'Favorite'}
        </button>
      </div>
    </div>
  )
}
