import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { GoogleGenAI } from '@google/genai';
import MapSearch from '../components/MapSearch';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

import { MapPin, Clock, Tag, Search, Loader2 } from 'lucide-react';

export default function ReportFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState('electronics');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  const [foundLocationDescription, setFoundLocationDescription] = useState('');

  // Dynamic fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');
  const [documentType, setDocumentType] = useState('');

  // Extended fields
  const [os, setOs] = useState('');
  const [storage, setStorage] = useState('');
  const [height, setHeight] = useState('');
  const [lastSeenWearing, setLastSeenWearing] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [collarColor, setCollarColor] = useState('');
  const [contents, setContents] = useState('');
  const [jewelryWeight, setJewelryWeight] = useState('');
  const [itemCondition, setItemCondition] = useState('good');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');

  const [timeFrom, setTimeFrom] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [locationFrom, setLocationFrom] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (!locationFrom) {
      toast.error('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);
    try {
      let photoData = null;
      if (photo) {
        if (photo.size > 500000) {
          toast.error('Photo must be less than 500KB');
          setIsSubmitting(false);
          return;
        }
        photoData = await fileToBase64(photo);
      }

      let videoData = null;
      if (video) {
        if (video.size > 500000) {
          toast.error('Video must be less than 500KB');
          setIsSubmitting(false);
          return;
        }
        videoData = await fileToBase64(video);
      }

      const itemData: any = {
        userId: user.uid,
        type: 'found',
        category,
        description,
        foundLocationDescription,
        timeFrom,
        locationFromLat: locationFrom.lat,
        locationFromLng: locationFrom.lng,
        status: 'approved',
        createdAt: serverTimestamp(),
        itemCondition,
        distinguishingFeatures
      };

      if (brand) itemData.brand = brand;
      if (model) itemData.model = model;
      if (color) itemData.color = color;
      if (contactNumber) itemData.contactNumber = contactNumber;
      if (name) itemData.name = name;
      if (age) itemData.age = age;
      if (gender) itemData.gender = gender;
      if (breed) itemData.breed = breed;
      if (size) itemData.size = size;
      if (material) itemData.material = material;
      if (documentType) itemData.documentType = documentType;
      
      if (os) itemData.os = os;
      if (storage) itemData.storage = storage;
      if (height) itemData.height = height;
      if (lastSeenWearing) itemData.lastSeenWearing = lastSeenWearing;
      if (microchipId) itemData.microchipId = microchipId;
      if (collarColor) itemData.collarColor = collarColor;
      if (contents) itemData.contents = contents;
      if (jewelryWeight) itemData.jewelryWeight = jewelryWeight;

      if (photoData) itemData.photoData = photoData;
      if (videoData) itemData.videoData = videoData;

      const docRef = await addDoc(collection(db, 'items'), itemData);
      const foundItemId = docRef.id;

      toast.success('Found item reported successfully. Matching engine started.');
      navigate('/');

      matchItem(foundItemId, itemData).catch(console.error);

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDynamicFields = () => {
    switch (category) {
      case 'electronics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Brand</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Apple" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Model</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. iPhone 15" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Space Gray" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">OS (if applicable)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. iOS 17" value={os} onChange={(e) => setOs(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Storage (if applicable)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 256GB" value={storage} onChange={(e) => setStorage(e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'bags':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Brand</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. American Tourister" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Blue" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Size</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Medium" value={size} onChange={(e) => setSize(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Contents (if any)</label>
              <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50 resize-none" placeholder="e.g. Contains a laptop and some books" value={contents} onChange={(e) => setContents(e.target.value)} />
            </div>
          </div>
        );
      case 'person':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Age</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 25" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Gender</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Height (Approx)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 5'8&quot;" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Last Seen Wearing</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Blue shirt and jeans" value={lastSeenWearing} onChange={(e) => setLastSeenWearing(e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'pets':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pet Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Buddy" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Breed</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Golden Retriever" value={breed} onChange={(e) => setBreed(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Golden" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Microchip ID (If any)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 985112345678" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Collar Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Red" value={collarColor} onChange={(e) => setCollarColor(e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'clothing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Type / Brand</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Nike Jacket" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Size</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. XL" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Color</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Black" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Document Type</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Citizenship, License" value={documentType} onChange={(e) => setDocumentType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Name on Document</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Brown" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Contents (Cards, Cash, etc.)</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 2 Credit Cards, 5000 NPR, Pan Card" value={contents} onChange={(e) => setContents(e.target.value)} />
            </div>
          </div>
        );
      case 'jewelry':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Type</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Ring, Necklace" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Material</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Gold, Silver" value={material} onChange={(e) => setMaterial(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Golden" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Weight / Carat (Optional)</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. 24K, 10 Grams" value={jewelryWeight} onChange={(e) => setJewelryWeight(e.target.value)} />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Brand / Type</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Samsung" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Color</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" placeholder="e.g. Black" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        );
    }
  };

  const matchItem = async (foundItemId: string, foundItem: any) => {
    try {
      const q = query(
        collection(db, 'items'),
        where('type', '==', 'lost'),
        where('status', '==', 'approved'),
        where('category', '==', foundItem.category)
      );

      const querySnapshot = await getDocs(q);
      const lostItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      if (lostItems.length === 0) return;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      for (const lostItem of lostItems) {
        const prompt = `
          You are an AI matching engine for a lost and found platform.
          Compare the following lost item description with the found item description and return a match percentage (0-100).
          Consider details like color, serial number, brand, location, and time.
          Also analyze any provided photos or videos for visual similarity.
          
          Lost Item:
          Category: ${lostItem.category}
          Brand: ${lostItem.brand || 'N/A'}
          Model: ${lostItem.model || 'N/A'}
          Color: ${lostItem.color || 'N/A'}
          Name: ${lostItem.name || 'N/A'}
          Age: ${lostItem.age || 'N/A'}
          Gender: ${lostItem.gender || 'N/A'}
          Breed: ${lostItem.breed || 'N/A'}
          Size: ${lostItem.size || 'N/A'}
          Material: ${lostItem.material || 'N/A'}
          Document Type: ${lostItem.documentType || 'N/A'}
          OS: ${lostItem.os || 'N/A'}
          Storage: ${lostItem.storage || 'N/A'}
          Height: ${lostItem.height || 'N/A'}
          Wearing: ${lostItem.lastSeenWearing || 'N/A'}
          Microchip ID: ${lostItem.microchipId || 'N/A'}
          Collar Color: ${lostItem.collarColor || 'N/A'}
          Contents: ${lostItem.contents || 'N/A'}
          Jewelry Weight: ${lostItem.jewelryWeight || 'N/A'}
          Condition: ${lostItem.itemCondition || 'N/A'}
          Distinguishing Features: ${lostItem.distinguishingFeatures || 'N/A'}
          Description: ${lostItem.description}
          Location From (Lat, Lng): ${lostItem.locationFromLat}, ${lostItem.locationFromLng}
          Location To (Lat, Lng): ${lostItem.locationToLat || 'N/A'}, ${lostItem.locationToLng || 'N/A'}
          Time Range: ${lostItem.timeFrom} to ${lostItem.timeTo || 'N/A'}
          
          Found Item:
          Category: ${foundItem.category}
          Brand: ${foundItem.brand || 'N/A'}
          Model: ${foundItem.model || 'N/A'}
          Color: ${foundItem.color || 'N/A'}
          Name: ${foundItem.name || 'N/A'}
          Age: ${foundItem.age || 'N/A'}
          Gender: ${foundItem.gender || 'N/A'}
          Breed: ${foundItem.breed || 'N/A'}
          Size: ${foundItem.size || 'N/A'}
          Material: ${foundItem.material || 'N/A'}
          Document Type: ${foundItem.documentType || 'N/A'}
          OS: ${foundItem.os || 'N/A'}
          Storage: ${foundItem.storage || 'N/A'}
          Height: ${foundItem.height || 'N/A'}
          Wearing: ${foundItem.lastSeenWearing || 'N/A'}
          Microchip ID: ${foundItem.microchipId || 'N/A'}
          Collar Color: ${foundItem.collarColor || 'N/A'}
          Contents: ${foundItem.contents || 'N/A'}
          Jewelry Weight: ${foundItem.jewelryWeight || 'N/A'}
          Condition: ${foundItem.itemCondition || 'N/A'}
          Distinguishing Features: ${foundItem.distinguishingFeatures || 'N/A'}
          Description: ${foundItem.description}
          Location Found (Lat, Lng): ${foundItem.locationFromLat}, ${foundItem.locationFromLng}
          Location Description: ${foundItem.foundLocationDescription || 'N/A'}
          Time Found: ${foundItem.timeFrom}
          
          Return ONLY a JSON object with a "score" property (number between 0 and 100).
        `;

        const parts: any[] = [{ text: prompt }];

        if (lostItem.photoData) {
          try {
            const mimeType = lostItem.photoData.split(';')[0].split(':')[1];
            const data = lostItem.photoData.split(',')[1];
            parts.push({ inlineData: { mimeType, data } });
          } catch (e) {
            console.error('Failed to parse lostItem photoData', e);
          }
        }
        if (lostItem.videoData) {
          try {
            const mimeType = lostItem.videoData.split(';')[0].split(':')[1];
            const data = lostItem.videoData.split(',')[1];
            parts.push({ inlineData: { mimeType, data } });
          } catch (e) {
            console.error('Failed to parse lostItem videoData', e);
          }
        }
        if (foundItem.photoData) {
          try {
            const mimeType = foundItem.photoData.split(';')[0].split(':')[1];
            const data = foundItem.photoData.split(',')[1];
            parts.push({ inlineData: { mimeType, data } });
          } catch (e) {
            console.error('Failed to parse foundItem photoData', e);
          }
        }
        if (foundItem.videoData) {
          try {
            const mimeType = foundItem.videoData.split(';')[0].split(':')[1];
            const data = foundItem.videoData.split(',')[1];
            parts.push({ inlineData: { mimeType, data } });
          } catch (e) {
            console.error('Failed to parse foundItem videoData', e);
          }
        }

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: parts,
            config: {
              responseMimeType: 'application/json',
            }
          });

          const resultText = response.text;
          if (resultText) {
            const result = JSON.parse(resultText);
            const score = result.score;

            if (score >= 95) {
              // Record match
              const matchDocRef = await addDoc(collection(db, 'matches'), {
                lostItemId: lostItem.id,
                foundItemId: foundItemId,
                matchScore: score,
                status: 'pending',
                createdAt: serverTimestamp()
              });
              
              // Create notification for the user who lost the item
              await addDoc(collection(db, 'notifications'), {
                userId: lostItem.userId,
                message: `Good news! We found a potential match for your lost ${lostItem.category}.`,
                read: false,
                type: 'match_found',
                matchId: matchDocRef.id,
                createdAt: serverTimestamp()
              });
              
              console.log(`Match found! Lost ID: ${lostItem.id}, Found ID: ${foundItemId}, Score: ${score}`);
            }
          }
        } catch (aiError) {
          console.error('AI matching error:', aiError);
        }
      }
    } catch (error) {
      console.error('Matching service error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Report Found Item</h2>
          <p className="text-slate-500 text-lg">Help someone find their lost belonging by providing details about what you've found.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 lg:p-12 space-y-10">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="electronics">Electronics (Phone, Laptop, etc.)</option>
                    <option value="wallet">Wallet / Documents</option>
                    <option value="person">Person</option>
                    <option value="keys">Keys</option>
                    <option value="clothing">Clothing</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="pets">Pets</option>
                    <option value="bags">Bags / Backpacks</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Photo (Mandatory, max 500KB)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Item Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Item Details</h3>
              </div>

              {renderDynamicFields()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Item Condition</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50" value={itemCondition} onChange={(e) => setItemCondition(e.target.value)}>
                    <option value="new">New / Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor / Damaged</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Distinguishing Features</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50"
                    placeholder="e.g. Scratches on back, stickers"
                    value={distinguishingFeatures}
                    onChange={(e) => setDistinguishingFeatures(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Alt Contact Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50"
                    placeholder="e.g. 9800000000"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50 resize-none"
                  placeholder="E.g. Found a black iPhone 17 Pro Max with a silver cover near Birtamode bus stand..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Time & Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Time & Location</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Time Found</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location Description</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all bg-slate-50"
                    placeholder="e.g. Near the main gate of the park"
                    value={foundLocationDescription}
                    onChange={(e) => setFoundLocationDescription(e.target.value)}
                  />
                </div>

                <label className="text-sm font-bold text-slate-700">Location Found (Click on map to pin)</label>
                
                <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200 relative z-0 shadow-inner">
                  <MapContainer center={[27.7172, 85.3240]} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapSearch onLocationSelect={setLocationFrom} />
                    <LocationMarker 
                      position={locationFrom} 
                      setPosition={setLocationFrom} 
                    />
                  </MapContainer>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border inline-block text-xs font-medium ${locationFrom ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  Pinned at: {locationFrom ? `${locationFrom.lat.toFixed(4)}, ${locationFrom.lng.toFixed(4)}` : 'Not pinned'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 bg-slate-50 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-orange/90 transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Found Item Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
