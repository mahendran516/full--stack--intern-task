import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import TemplateCard from "../components/TemplateCard";

export default function Templates() {
  const { authAxios, token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // load templates
    authAxios
      .get("/api/templates")
      .then((r) => setTemplates(r.data))
      .catch(() => {});
    if (token)
      authAxios
        .get("/api/favorites")
        .then((r) => setFavorites(r.data.map((x) => x.template.id)))
        .catch(() => {});
  }, [token]);

  const onFavorite = async (templateId) => {
    if (!token) return alert("Please login to favorite");
    try {
      await authAxios.post(`/api/favorites/${templateId}`);
      // refresh favorites from server to ensure persisted state
      const r = await authAxios.get('/api/favorites')
      setFavorites(r.data.map((x) => x.template.id))
    } catch (err) {
      // if already favorited or other error, still refresh to keep UI consistent
      try {
        const r = await authAxios.get('/api/favorites')
        setFavorites(r.data.map((x) => x.template.id))
      } catch(_) {}
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          placeholder="Search or filter by category"
          className="border px-3 py-2 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onFavorite={onFavorite}
            isFavorited={favorites.includes(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
