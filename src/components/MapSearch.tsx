import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MapSearchProps {
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        map.flyTo([newPos.lat, newPos.lng], 15);
        onLocationSelect(newPos);
        toast.success(`Found: ${data[0].display_name}`);
      } else {
        toast.error('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a location (e.g. Kathmandu Mall)"
          className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-full shadow-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={loading}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
