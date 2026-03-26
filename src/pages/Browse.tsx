import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Search, MapPin, Calendar, Tag, Filter, ArrowRight, Package, AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface Item {
  id: string;
  type: 'lost' | 'found';
  category: string;
  brand?: string;
  model?: string;
  color?: string;
  description: string;
  timeFrom: string;
  locationFromLat: number;
  locationFromLng: number;
  photoData?: string;
  status: 'active' | 'resolved';
  createdAt: any;
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>(searchParams.get('type') || 'all');
  const [filterCategory, setFilterCategory] = useState<string>(searchParams.get('category') || 'all');
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '');
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    const itemDate = new Date(item.timeFrom);
    const matchesStartDate = !startDate || itemDate >= new Date(startDate);
    const matchesEndDate = !endDate || itemDate <= new Date(endDate);
    
    return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const categories = [
    { id: 'electronics', name: 'Electronics', icon: Package },
    { id: 'wallet', name: 'Wallet/Docs', icon: Tag },
    { id: 'person', name: 'Person', icon: AlertCircle },
    { id: 'keys', name: 'Keys', icon: Tag },
    { id: 'clothing', name: 'Clothing', icon: Tag },
    { id: 'jewelry', name: 'Jewelry', icon: Tag },
    { id: 'pets', name: 'Pets', icon: AlertCircle },
    { id: 'bags', name: 'Bags', icon: Package },
    { id: 'other', name: 'Other', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-slate-500 font-bold mb-4">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">Browse Reports</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Browse <span className="text-brand-orange">Reports</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Search and filter through all lost and found reports in Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Filter className="w-5 h-5 text-brand-orange" />
                <span>Filters</span>
              </div>

              {/* Type Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Report Type</h4>
                <div className="flex flex-col gap-2">
                  {['all', 'lost', 'found'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setSearchParams(prev => {
                          if (type === 'all') prev.delete('type');
                          else prev.set('type', type);
                          return prev;
                        });
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                        filterType === type 
                          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)} Items
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Category</h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setFilterCategory('all');
                      setSearchParams(prev => {
                        prev.delete('category');
                        return prev;
                      });
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                      filterCategory === 'all' 
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFilterCategory(cat.id);
                        setSearchParams(prev => {
                          prev.set('category', cat.id);
                          return prev;
                        });
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all flex items-center gap-2 ${
                        filterCategory === cat.id 
                          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Date Range</h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStartDate(val);
                        setSearchParams(prev => {
                          if (val) prev.set('startDate', val);
                          else prev.delete('startDate');
                          return prev;
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEndDate(val);
                        setSearchParams(prev => {
                          if (val) prev.set('endDate', val);
                          else prev.delete('endDate');
                          return prev;
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {searchQuery && (
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <p className="text-slate-600 font-medium">
                  Showing results for "<span className="text-brand-orange font-bold">{searchQuery}</span>"
                </p>
                <button 
                  onClick={() => setSearchParams(prev => { prev.delete('q'); return prev; })}
                  className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-100"></div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="group bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-brand-orange/10 transition-all duration-300 flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {item.photoData ? (
                        <img src={item.photoData} alt={item.description} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
                        item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-brand-orange text-white'
                      }`}>
                        {item.type}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-brand-orange transition-colors">
                        {item.brand ? `${item.brand} ${item.model || ''}` : item.description}
                      </h3>
                      
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">
                        {item.description}
                      </p>
                      
                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <MapPin className="w-4 h-4 text-brand-orange" />
                          <span className="truncate">Nepal</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <Clock className="w-4 h-4 text-brand-orange" />
                          <span>{format(new Date(item.timeFrom), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      
                      <Link to={`/item/${item.id}`} className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-brand-orange transition-all">
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No reports found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  We couldn't find any reports matching your current filters. Try adjusting your search or category.
                </p>
                <button 
                  onClick={() => {
                    setFilterType('all');
                    setFilterCategory('all');
                    setStartDate('');
                    setEndDate('');
                    setSearchParams({});
                  }}
                  className="mt-8 text-brand-orange font-bold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
