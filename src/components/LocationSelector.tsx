import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelect: (district: string, city: string) => void;
  initialDistrict?: string;
  initialCity?: string;
}

const NEPAL_DATA: Record<string, string[]> = {
  "Achham": ["Mangalsen", "Sanphebagar", "Kamalbazar", "Panchadewal Binayak", "Turmakhand", "Dhakari", "Bannigadhi Jayagadh", "Chaurpati", "Mellekh", "Ramaroshan"],
  "Arghakhanchi": ["Sandhikharka", "Sitganga", "Bhumikasthan", "Chhatradev", "Panini", "Malarani", "Thada", "Khanchikot", "Balkot"],
  "Baglung": ["Baglung", "Galkot", "Jaimini", "Dhorpatan", "Bareng", "Kanthekhola", "Nisikhola", "Badigad", "Taman Khola", "Tara Khola", "Burtibang"],
  "Baitadi": ["Dasharathchand", "Patan", "Melauli", "Purchaudi", "Dogadakedar", "Dilasaini", "Pancheshwar", "Shivanath", "Sigas", "Surnaya", "Gokuleshwor"],
  "Bajhang": ["Jayaprithvi", "Bungal", "Talkot", "Masta", "Khaptadchhanna", "Thalara", "Bitthadchir", "Surma", "Chhabispathibhera", "Durgathali", "Kedarsyu", "Kanda"],
  "Bajura": ["Badimalika", "Triveni", "Budhiganga", "Budhinanda", "Gaumul", "Jagannath", "Swami Kartik Khapar", "Khaptad Chhededaha", "Himali", "Martadi", "Kolti"],
  "Banke": ["Nepalgunj", "Kohalpur", "Narainapur", "Rapti Sonari", "Baijanath", "Khajura", "Duduwa", "Janaki", "Chisapani"],
  "Bara": ["Kalaiya", "Jeetpur Simara", "Nijgadh", "Kolhabi", "Simraungadh", "Mahagadhimai", "Pacharauta", "Adarsh Kotwal", "Karaiyamai", "Devtal", "Parwanipur", "Prasuni", "Pheta", "Baragadhi", "Suwarna"],
  "Bardiya": ["Gulariya", "Rajapur", "Madhuwan", "Thakurbaba", "Bansgadhi", "Barbardiya", "Badhaiyatal", "Geruwa", "Bhurigaon"],
  "Bhaktapur": ["Bhaktapur", "Madhyapur Thimi", "Changunarayan", "Suryabinayak", "Nagarkot", "Duwakot", "Balkot"],
  "Bhojpur": ["Bhojpur", "Shadananda", "Hatuwagadhi", "Ramprasad Rai", "Aamshoke", "Tyamke Maiyum", "Arun", "Pauwadunwa", "Salpasilichho"],
  "Chitwan": ["Bharatpur", "Ratnanagar", "Khairahani", "Rapti", "Kalika", "Madi", "Ichchhakamana", "Narayangarh", "Sauraha", "Mugling"],
  "Dadeldhura": ["Amargadhi", "Parshuram", "Alital", "Bhageshwar", "Navadurga", "Ajayameru", "Ganyapadhura", "Jogbudha"],
  "Dailekh": ["Narayan", "Dullu", "Chamunda Bindrasaini", "Aathbis", "Thantikandh", "Bhairabi", "Mahabu", "Naumule", "Dungeshwar", "Gurans", "Bhagawatimai"],
  "Dang": ["Ghorahi", "Tulsipur", "Lamahi", "Rapti", "Gadawa", "Rajpur", "Dangisharan", "Shantinagar", "Babai", "Banglachuli", "Bhalubang"],
  "Darchula": ["Mahakali", "Shailyasikhar", "Malikarjun", "Apihimal", "Duhun", "Naugad", "Marma", "Lekam", "Vyans", "Khalanga"],
  "Dhading": ["Nilkantha", "Dhadingbesi", "Gajuri", "Galchhi", "Benighat Rorang", "Jwalamukhi", "Siddhalek", "Tripurasundari", "Gangajamuna", "Gajuri", "Khaniyabas", "Thakre", "Netrawati Dabjong"],
  "Dhankuta": ["Dhankuta", "Pakhribas", "Mahalaxmi", "Sangurigadhi", "Chaubise", "Sahidbhumi", "Chhathar Jorpati", "Hile", "Bhedetar"],
  "Dhanusa": ["Janakpurdham", "Chhireswornath", "Ganeshman Charnath", "Dhanusadham", "Nagarain", "Videha", "Mithila", "Sahidnagar", "Sabaila", "Kamala", "Mithila Bihari", "Hansapur", "Mukhiyapatti Musharniya", "Baidehi", "Aurahi", "Janaknandani", "Bateshwar", "Laxminiya"],
  "Dolakha": ["Bhimeshwar", "Jiri", "Kalinchok", "Melung", "Shailung", "Baiteshwar", "Tamarkoshi", "Gaurishankar", "Bigu", "Charikot"],
  "Dolpa": ["Thuli Bheri", "Tripurasundari", "Dolpo Buddha", "Shey Phoksundo", "Jagadulla", "Mudkechula", "Kaike", "Chharka Tangsong", "Dunai"],
  "Doti": ["Dipayal Silgadhi", "Shikhar", "Purbichowki", "Badikedar", "Jorayal", "Sayal", "Adarsha", "K.I. Singh", "Bogatan-Phudsil"],
  "Gorkha": ["Gorkha", "Palungtar", "Barpak Sulikot", "Siranchok", "Ajirkot", "Arughat", "Gandaki", "Dharche", "Bhimsen Thapa", "Sahid Lakhan", "Chumanuwri"],
  "Gulmi": ["Resunga", "Musikot", "Isma", "Kaligandaki", "Gulmi Darbar", "Satyawati", "Chandrakot", "Ruru", "Chhatrakot", "Madane", "Malika", "Dhurkot", "Tamghas"],
  "Humla": ["Simkot", "Namkha", "Kharpunath", "Sarkegad", "Chankheli", "Adanchuli", "Tajakot"],
  "Ilam": ["Ilam", "Deumai", "Mai", "Suryodaya", "Fikkal", "Pashupatinagar", "Rong", "Mangsebung", "Chulachuli", "Mai Jogmai", "Sandakpur"],
  "Jajarkot": ["Bheri", "Chhedagad", "Nalgad", "Barekot", "Kushe", "Junichande", "Shivalaya", "Khalanga"],
  "Jhapa": ["Mechinagar", "Birtamod", "Damak", "Bhadrapur", "Arjundhara", "Kankai", "Shivasataksi", "Gauradaha", "Gauriganj", "Jhapa", "Baniyani", "Haldibari", "Kachankawal", "Kamal", "Buddhashanti"],
  "Jumla": ["Chandannath", "Kanakasundari", "Sinja", "Hima", "Tila", "Tatopani", "Guthichaur", "Patarasi"],
  "Kailali": ["Dhangadhi", "Tikapur", "Ghodaghodi", "Lamki Chuha", "Bhajani", "Godawari", "Gauriganga", "Janaki", "Bardagoriya", "Mohanyal", "Kailari", "Joshipur", "Chure", "Attariya"],
  "Kalikot": ["Khandachakra", "Raski", "Tilagufa", "Pachaljharana", "Sanni Triveni", "Narharinath", "Shubha Kalika", "Mahawai", "Palata", "Manma"],
  "Kanchanpur": ["Bhimdatta", "Bedkot", "Belauri", "Beldandi", "Dodhara Chandani", "Krishnapur", "Punarwas", "Shuklaphanta", "Laljhadi", "Mahendranagar"],
  "Kapilvastu": ["Kapilvastu", "Banganga", "Buddhabhumi", "Shivaraj", "Maharajgunj", "Krishnanagar", "Mayadevi", "Yashodhara", "Suddhodhan", "Bijaynagar", "Taulihawa"],
  "Kaski": ["Pokhara", "Annapurna", "Machhapuchhre", "Madi", "Rupa", "Lekhnath"],
  "Kathmandu": ["Kathmandu", "Kirtipur", "Budhanilkantha", "Tarakeshwar", "Gokarneshwar", "Shankharapur", "Tokha", "Chandragiri", "Nagarjun", "Kageshwari Manohara", "Dakshinkali"],
  "Kavrepalanchok": ["Dhulikhel", "Banepa", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur", "Roshi", "Temal", "Chauri Deurali", "Bhumlu", "Mahabharat", "Khanikhola", "Bethanchowk"],
  "Khotang": ["Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung", "Khotehang", "Diprung Chuichumma", "Aiselukharka", "Jante Dhunga", "Kepilasgadhi", "Barahapokhari", "Rawabesi", "Sakela"],
  "Lalitpur": ["Lalitpur", "Godawari", "Mahalakshmi", "Konjyosom", "Bagmati", "Mahankal"],
  "Lamjung": ["Besisahar", "Madhya Nepal", "Rainas", "Sundarbazar", "Marsyangdi", "Dordi", "Dudhpokhari", "Kwaholasothar"],
  "Mahottari": ["Jaleshwor", "Bardibas", "Gaushala", "Loharpatti", "Ramgopalpur", "Manra Siswa", "Matihani", "Bhangaha", "Balwa", "Aurahi", "Pipra", "Samsi", "Sonama", "Ekdara", "Mahottari"],
  "Makwanpur": ["Hetauda", "Thaha", "Bakaiya", "Manahari", "Bagmati", "Raksirang", "Makawanpurgadhi", "Kailash", "Bhimphedi", "Indrasarowar"],
  "Manang": ["Chame", "Manang Ngisyang", "Narpa Bhumi", "Nashpa"],
  "Morang": ["Biratnagar", "Belbari", "Letang", "Pathari Sanischare", "Rangeli", "Ratuwamai", "Sunawarshi", "Urlabari", "Sundar Haraicha", "Budhiganga", "Katahari", "Gramthan", "Jahada", "Kanepokhari", "Miklajung", "Kerabari"],
  "Mugu": ["Chhayanath Rara", "Mugum Karmarong", "Soru", "Khatyad", "Gamgadhi"],
  "Mustang": ["Gharpajhong", "Thasang", "Baragung Muktichhetra", "Lomanthang", "Lo-Ghekar Damodarkunda", "Jomsom"],
  "Myagdi": ["Beni", "Annapurna", "Dhaulagiri", "Mangala", "Malika", "Raghuganga"],
  "Nawalparasi East": ["Kawasoti", "Gaidakot", "Devchuli", "Madhyabindu", "Binayi Tribeni", "Bulingtar", "Baudikali", "Hupsekot"],
  "Nawalparasi West": ["Ramgram", "Sunwal", "Bardaghat", "Palhinandan", "Pratappur", "Sarawal", "Susta"],
  "Nuwakot": ["Bidur", "Belkotgadhi", "Kakani", "Panchakanya", "Likhu", "Dupcheshwar", "Shivapuri", "Tadi", "Suryagadhi", "Tarkeshwar", "Myagang", "Kispang"],
  "Okhaldhunga": ["Siddhicharan", "Khijidemba", "Champadevi", "Sunkoshi", "Molung", "Chisankhugadhi", "Manebhanjyang", "Likhu"],
  "Palpa": ["Tansen", "Rampur", "Rainadevi Chhahara", "Mathagadhi", "Nisdi", "Purkhachaur", "Rambha", "Purbakhola", "Bagnaskali", "Tinau", "Ribdikot"],
  "Panchthar": ["Phidim", "Hilihang", "Kummayak", "Miklajung", "Phalgunanda", "Phalelung", "Tumbewa", "Yangwarak"],
  "Parbat": ["Kushma", "Phalebas", "Jaljala", "Paiyun", "Mahashila", "Modi", "Bihadi"],
  "Parsa": ["Birgunj", "Bahudarmai", "Parsagadhi", "Pokhariya", "Jagarnathpur", "Dhobini", "Chhipaharmai", "Belwa", "Bindabaasini", "Pakamainpur", "Sakhuwa Prasauni", "Pattarwa Sugauli", "Thori", "Jira Bhawani"],
  "Pyuthan": ["Pyuthan", "Sworgadwari", "Gaumukhi", "Mandavi", "Sarumarani", "Mallarani", "Naubahini", "Jhimruk", "Airawati"],
  "Ramechhap": ["Manthali", "Ramechhap", "Umakunda", "Khandadevi", "Gokulganga", "Doramba", "Likhu Tamakoshi", "Sunapati"],
  "Rasuwa": ["Uttargaya", "Kalika", "Gosaikunda", "Naukunda", "Parbatikunda", "Dhunche"],
  "Rautahat": ["Gaur", "Chandrapur", "Garuda", "Ishanath", "Phatuwa Vijayapur", "Gadhimai", "Madhav Narayan", "Gajura", "Brindaban", "Rajpur", "Rajdevi", "Dewahi Gonahi", "Maulapur", "Baudhimai", "Paroha", "Yamunamai", "Durga Bhagwati"],
  "Rolpa": ["Rolpa", "Triveni", "Duikhol", "Lumbini", "Madi", "Runtigadhi", "Gangadev", "Sunchhahari", "Thabang", "Paribartan"],
  "Rukum East": ["Sisne", "Bhume", "Putha Uttarganga"],
  "Rukum West": ["Musikot", "Chaurjahari", "Aathbiskot", "Banphikot", "Triveni", "Sani Bheri"],
  "Rupandehi": ["Butwal", "Siddharthanagar", "Lumbini Sanskritik", "Devdaha", "Tilottama", "Sainamaina", "Gaidahawa", "Kanchan", "Suddhodhan", "Rohini", "Omshatiya", "Siyari", "Mayadevi", "Marchawari", "Kotahimai", "Sammarimai"],
  "Salyan": ["Shaarda", "Bagchaur", "Bangad Kupinde", "Kalimati", "Triveni", "Kapurkot", "Kumakh", "Dharma Devi", "Chatreshwari", "Dhorchaur"],
  "Sankhuwasabha": ["Khandbari", "Chainpur", "Madi", "Dharmadevi", "Panchkhapan", "Bhotkhola", "Makalu", "Chichila", "Silichong", "Sabhapokhari"],
  "Saptari": ["Rajbiraj", "Kanchanrup", "Saptakoshi", "Dakneshwori", "Hanumannagar Kankalini", "Shambhunath", "Surunga", "Bodebarsain", "Khadak", "Tirhut", "Tilathi Koiladi", "Chhinnamasta", "Mahadeva", "Agnisair Krishna Sabaran", "Rupani", "Balan-Bihul", "Vishnupur"],
  "Sarlahi": ["Malangawa", "Hariwan", "Lalbandi", "Ishworpur", "Barahathawa", "Godaita", "Balara", "Kabilasi", "Bagmati", "Haripur", "Haripurwa", "Chandranagar", "Chakraghatta", "Brahampuri", "Ramnagar", "Parsa", "Bishnu", "Kaudeena", "Dhankaul"],
  "Sindhuli": ["Kamalamai", "Dudhauli", "Golanjor", "Ghyanglekh", "Tinpatan", "Phikkal", "Hariharpurgadhi", "Marin", "Sunkoshi"],
  "Sindhupalchok": ["Chautara Sangachokgadhi", "Melamchi", "Barhabise", "Indrawati", "Jugal", "Panchpokhari Thangpal", "Helambu", "Bhotekoshi", "Sunkoshi", "Lisankhu Pakhar", "Tripurasundari", "Balephi"],
  "Siraha": ["Siraha", "Lahan", "Mirchaiya", "Golbazar", "Dhangadhimai", "Kalyanpur", "Sukhipur", "Karjanha", "Bariyarpatti", "Aurahi", "Naraha", "Arnama", "Bhagawanpur", "Navarajpur", "Sakhuwanankarkatti", "Vishnupur", "Laxmipur Patari"],
  "Solukhumbu": ["Solu Dudhkunda", "Mapya Dudhkoshi", "Khumbu Pasanglhamu", "Necha Salyan", "Thulung Dudhkoshi", "Sotang", "Mahakulung", "Likhupike"],
  "Sunsari": ["Itahari", "Dharan", "Inaruwa", "Duhabi", "Ramdhuni", "Barahachhetra", "Koshi", "Gadhi", "Barju", "Bhokraha Narsingh", "Dewanganj", "Duhabi"],
  "Surkhet": ["Birendranagar", "Gurbhakot", "Panchapuri", "Lekhbesi", "Bheri Ganga", "Chaukune", "Barahatal", "Chingad", "Simta"],
  "Syangja": ["Putalibazar", "Waling", "Chapakot", "Bhirkot", "Galyang", "Phedikhola", "Arjun Chaupari", "Aandhikhola", "Kaligandaki", "Biruwa", "Harinas"],
  "Tanahu": ["Byas", "Shuklagandaki", "Bhimad", "Bhanu", "Anbu Khaireni", "Devghat", "Bandipur", "Rishing", "Myagde", "Ghiring"],
  "Taplejung": ["Phungling", "Aathrai Triveni", "Sidingwa", "Faktanglung", "Mikwakhola", "Meringden", "Maiwakhola", "Pathibhara Yangwarak", "Sirijangha"],
  "Terhathum": ["Myanglung", "Laligurans", "Aathrai", "Chhathar", "Phedap", "Menchayayem"],
  "Udayapur": ["Triyuga", "Katari", "Chaudandigadhi", "Belaka", "Udayapurgadhi", "Rautamai", "Tapli", "Limchungbung"]
};


const DISTRICTS = Object.keys(NEPAL_DATA).sort();

export default function LocationSelector({ onLocationSelect, initialDistrict = '', initialCity = '' }: LocationSelectorProps) {
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(initialCity);
  const [districtSearch, setDistrictSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const districtRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDistrictSelect = (d: string) => {
    setDistrict(d);
    setCity('');
    setDistrictSearch('');
    setIsDistrictOpen(false);
    onLocationSelect(d, '');
    
    // Auto focus city dropdown
    setTimeout(() => {
      setIsCityOpen(true);
      cityInputRef.current?.focus();
    }, 100);
  };

  const handleCitySelect = (c: string) => {
    setCity(c);
    setCitySearch('');
    setIsCityOpen(false);
    onLocationSelect(district, c);
  };

  const handleClear = () => {
    setDistrict('');
    setCity('');
    setDistrictSearch('');
    setCitySearch('');
    onLocationSelect('', '');
  };

  const filteredDistricts = DISTRICTS.filter(d => 
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const cities = district ? NEPAL_DATA[district].sort() : [];
  const filteredCities = cities.filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* District Dropdown */}
      <div className="relative flex-1" ref={districtRef}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          District
        </label>
        <div 
          onClick={() => setIsDistrictOpen(!isDistrictOpen)}
          className={`group flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all ${
            isDistrictOpen ? 'border-brand-orange ring-4 ring-brand-orange/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <MapPin className={`w-5 h-5 ${district ? 'text-brand-orange' : 'text-slate-400'}`} />
            <span className={`font-medium ${district ? 'text-slate-900' : 'text-slate-400'}`}>
              {district || 'All Districts'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
        </div>

        {isDistrictOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search district..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div 
                onClick={() => handleDistrictSelect('')}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-brand-orange cursor-pointer transition-colors"
              >
                All Districts
              </div>
              {filteredDistricts.map(d => (
                <div 
                  key={d}
                  onClick={() => handleDistrictSelect(d)}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                    district === d ? 'bg-brand-orange text-white' : 'text-slate-700 hover:bg-orange-50 hover:text-brand-orange'
                  }`}
                >
                  {d}
                </div>
              ))}
              {filteredDistricts.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-400 text-sm italic">
                  No districts found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City Dropdown */}
      <div className="relative flex-1" ref={cityRef}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          City / Municipality
        </label>
        <div 
          onClick={() => district && setIsCityOpen(!isCityOpen)}
          className={`group flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl transition-all ${
            !district ? 'bg-slate-50 border-slate-100 cursor-not-allowed' : 
            isCityOpen ? 'border-brand-orange ring-4 ring-brand-orange/10 cursor-pointer' : 
            'border-slate-200 hover:border-slate-300 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <Search className={`w-5 h-5 ${city ? 'text-brand-orange' : 'text-slate-400'}`} />
            <span className={`font-medium ${city ? 'text-slate-900' : 'text-slate-400'}`}>
              {district ? (city || 'Select City') : 'Select a district first'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
        </div>

        {isCityOpen && district && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={cityInputRef}
                  type="text"
                  placeholder="Search city..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredCities.map(c => (
                <div 
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                    city === c ? 'bg-brand-orange text-white' : 'text-slate-700 hover:bg-orange-50 hover:text-brand-orange'
                  }`}
                >
                  {c}
                </div>
              ))}
              {filteredCities.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-400 text-sm italic">
                  No cities found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Clear Button */}
      {(district || city) && (
        <button
          onClick={handleClear}
          className="sm:mt-7 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all flex items-center justify-center gap-2 font-bold text-sm"
          title="Clear location"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  );
}
