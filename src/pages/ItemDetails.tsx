import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MapPin, Calendar, Tag, Info, Phone, Award, User, MessageSquare, ArrowLeft, Share2, ShieldCheck, Package, Clock, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Item {
  id: string;
  userId: string;
  type: 'lost' | 'found';
  category: string;
  brand?: string;
  model?: string;
  color?: string;
  contactNumber?: string;
  description: string;
  lostLocationDescription?: string;
  foundLocationDescription?: string;
  timeFrom: string;
  timeTo?: string;
  locationFromLat: number;
  locationFromLng: number;
  locationToLat?: number;
  locationToLng?: number;
  photoData?: string;
  videoData?: string;
  status: 'active' | 'resolved';
  createdAt: any;
  // Dynamic fields
  name?: string;
  age?: string;
  gender?: string;
  breed?: string;
  size?: string;
  material?: string;
  documentType?: string;
  os?: string;
  storage?: string;
  height?: string;
  lastSeenWearing?: string;
  microchipId?: string;
  collarColor?: string;
  contents?: string;
  jewelryWeight?: string;
  itemCondition?: string;
  distinguishingFeatures?: string;
}

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'items', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() } as Item;
          setItem(itemData);
          
          // Fetch owner profile
          const userRef = doc(db, 'users', itemData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setOwnerProfile(userSnap.data());
          }
        } else {
          toast.error('Item not found');
          navigate('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `items/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleContact = async () => {
    if (!user) {
      toast.error('Please login to contact the owner');
      navigate('/login');
      return;
    }
    
    if (user.uid === item?.userId) {
      toast.error('This is your own report');
      return;
    }

    toast.info('Messaging feature coming soon! Please use the contact number for now.');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading item details...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-orange font-bold transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Browse
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {item.brand ? `${item.brand} ${item.model || ''}` : item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </h1>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-brand-orange text-white'
                }`}>
                  {item.type}
                </span>
              </div>
              <p className="text-slate-500 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4" /> Reported on {format(item.createdAt?.toDate() || new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-brand-orange transition-all shadow-sm">
                <Share2 className="w-5 h-5" />
              </button>
              {user?.uid === item.userId && (
                <Link to={`/edit-item/${item.id}`} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                  Edit Report
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Media Section */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {item.photoData ? (
                  <div className="aspect-video w-full relative group">
                    <img src={item.photoData} alt={item.description} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Package className="w-20 h-20" />
                    <p className="font-bold text-slate-400">No photo available</p>
                  </div>
                )}
                
                {item.videoData && (
                  <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Video Evidence</h3>
                    <video src={item.videoData} controls className="w-full rounded-2xl shadow-lg" />
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 text-brand-orange">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Description</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {item.description}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                  {item.brand && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand</p>
                      <p className="font-bold text-slate-900">{item.brand}</p>
                    </div>
                  )}
                  {item.model && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model</p>
                      <p className="font-bold text-slate-900">{item.model}</p>
                    </div>
                  )}
                  {item.color && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color</p>
                      <p className="font-bold text-slate-900">{item.color}</p>
                    </div>
                  )}
                  {item.name && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</p>
                      <p className="font-bold text-slate-900">{item.name}</p>
                    </div>
                  )}
                  {item.age && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</p>
                      <p className="font-bold text-slate-900">{item.age}</p>
                    </div>
                  )}
                  {item.gender && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</p>
                      <p className="font-bold text-slate-900 capitalize">{item.gender}</p>
                    </div>
                  )}
                  {item.breed && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Breed</p>
                      <p className="font-bold text-slate-900">{item.breed}</p>
                    </div>
                  )}
                  {item.size && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Size</p>
                      <p className="font-bold text-slate-900">{item.size}</p>
                    </div>
                  )}
                  {item.material && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Material</p>
                      <p className="font-bold text-slate-900">{item.material}</p>
                    </div>
                  )}
                  {item.documentType && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doc Type</p>
                      <p className="font-bold text-slate-900">{item.documentType}</p>
                    </div>
                  )}
                  {item.os && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">OS</p>
                      <p className="font-bold text-slate-900">{item.os}</p>
                    </div>
                  )}
                  {item.storage && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage</p>
                      <p className="font-bold text-slate-900">{item.storage}</p>
                    </div>
                  )}
                  {item.height && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Height</p>
                      <p className="font-bold text-slate-900">{item.height}</p>
                    </div>
                  )}
                  {item.lastSeenWearing && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wearing</p>
                      <p className="font-bold text-slate-900">{item.lastSeenWearing}</p>
                    </div>
                  )}
                  {item.microchipId && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Microchip ID</p>
                      <p className="font-bold text-slate-900">{item.microchipId}</p>
                    </div>
                  )}
                  {item.collarColor && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collar</p>
                      <p className="font-bold text-slate-900">{item.collarColor}</p>
                    </div>
                  )}
                  {item.jewelryWeight && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight</p>
                      <p className="font-bold text-slate-900">{item.jewelryWeight}</p>
                    </div>
                  )}
                  {item.itemCondition && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Condition</p>
                      <p className="font-bold text-slate-900 capitalize">{item.itemCondition}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</p>
                    <p className="font-bold text-slate-900 capitalize">{item.category}</p>
                  </div>
                </div>

                {item.contents && (
                  <div className="pt-6 border-t border-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contents</p>
                    <p className="text-slate-600 font-medium">{item.contents}</p>
                  </div>
                )}

                {item.distinguishingFeatures && (
                  <div className="pt-6 border-t border-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distinguishing Features</p>
                    <p className="text-slate-600 font-medium">{item.distinguishingFeatures}</p>
                  </div>
                )}
              </div>

              {/* Map Section */}
              <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 text-brand-orange">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Location Details</h3>
                </div>
                
                <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                  <MapContainer center={[item.locationFromLat, item.locationFromLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[item.locationFromLat, item.locationFromLng]}>
                      <Popup>
                        <div className="font-bold">
                          {item.type === 'lost' ? 'Last Seen Here' : 'Found Here'}
                        </div>
                      </Popup>
                    </Marker>
                    {item.locationToLat && item.locationToLng && (
                      <Marker position={[item.locationToLat, item.locationToLng]}>
                        <Popup>
                          <div className="font-bold">Possible End Location</div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time {item.type === 'lost' ? 'Lost' : 'Found'}</p>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Calendar className="w-4 h-4 text-brand-orange" />
                      {format(new Date(item.timeFrom), 'MMM d, yyyy - h:mm a')}
                    </div>
                  </div>
                  {item.timeTo && (
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Until</p>
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Calendar className="w-4 h-4 text-brand-orange" />
                        {format(new Date(item.timeTo), 'MMM d, yyyy - h:mm a')}
                      </div>
                    </div>
                  )}
                </div>

                {item.foundLocationDescription && (
                  <div className="pt-6 border-t border-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Found Location Description</p>
                    <p className="text-slate-600 font-medium">{item.foundLocationDescription}</p>
                  </div>
                )}

                {item.lostLocationDescription && (
                  <div className="pt-6 border-t border-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lost Location Description</p>
                    <p className="text-slate-600 font-medium">{item.lostLocationDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Owner Info Card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported By</p>
                    <h4 className="text-xl font-bold text-slate-900">{ownerProfile?.name || 'Anonymous User'}</h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Reporter
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleContact}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-orange/90 transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" /> Send Message
                  </button>
                  
                  {item.contactNumber && (
                    <a 
                      href={`tel:${item.contactNumber}`}
                      className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5 text-brand-orange" /> Call Now
                    </a>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <p className="text-xs text-slate-400 font-medium text-center">
                    Please be careful when meeting strangers. Always meet in public places.
                  </p>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-orange" /> Safety Tips
                </h3>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0"></div>
                    Meet in a well-lit, public place like a police station or mall.
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0"></div>
                    Do not go alone to meet someone you don't know.
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0"></div>
                    Verify the item details before handing over.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
