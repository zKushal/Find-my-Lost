import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ShieldCheck, Clock, Package, User, ArrowLeft, Info } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { Link } from 'react-router-dom';

interface Item {
  id: string;
  category: string;
  description: string;
  photoData?: string;
  videoData?: string;
  userId: string;
  type: string;
  status: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    // Use onSnapshot for real-time updates
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'active') // In this app, active items are what admins might review, or we can use a 'pending' status if implemented
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: Item[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      // For this demo, let's just show all active items that might need moderation
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'items');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleStatusUpdate = async (id: string, status: 'resolved' | 'active') => {
    try {
      const itemRef = doc(db, 'items', id);
      await updateDoc(itemRef, { status });
      toast.success(`Item status updated to ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `items/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading admin dashboard...</p>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500 max-w-md">You do not have the necessary permissions to access the admin dashboard.</p>
        </div>
        <Link to="/" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-brand-orange" /> Admin Dashboard
              </h1>
              <p className="text-slate-500 font-medium">Manage and moderate reported items</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Reports</p>
                <p className="text-2xl font-black text-brand-orange">{items.length}</p>
              </div>
              <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No items to moderate</h3>
              <p className="text-slate-500 max-w-xs mx-auto">All reported items are currently up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-brand-orange/30 transition-all">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-72 h-64 md:h-auto relative shrink-0">
                      {item.photoData ? (
                        <img src={item.photoData} alt={item.category} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2">
                          <Package className="w-12 h-12" />
                          <span className="text-xs font-bold uppercase tracking-wider">No Photo</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                          item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-brand-orange text-white'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-grow p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1 block">
                              {item.category}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                              {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
                            </h3>
                          </div>
                          <Link to={`/item/${item.id}`} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-orange transition-colors">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </Link>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            ID: {item.userId.substring(0, 8)}...
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-50">
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'resolved')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-bold text-sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Resolved
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'active')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all font-bold text-sm"
                        >
                          <Info className="w-4 h-4" /> Keep Active
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
