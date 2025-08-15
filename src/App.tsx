import React, { useEffect, useMemo, useState } from 'react';
import CompanyListPage from './pages/CompanyListPage';
import AddCompanyPage from './pages/AddCompanyPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ReferencesPage from './pages/ReferencesPage';
import NewsPage from './pages/NewsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import MyAccountPage from './pages/MyAccountPage';
import MyOrdersPage from './pages/MyOrdersPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import CookieConsentBanner from './components/CookieConsentBanner';

import { supabase } from './lib/supabase';
import { askAI, type ChatTurn } from './lib/askAI';
import { createOrderAndRedirect } from './lib/createOrderAndRedirect';

import {
  MessageCircle,
  Hammer,
  Droplets,
  Zap,
  Puzzle,
  Palette,
  Trees,
  Wrench,
  Flame,
  HelpCircle,
  Menu,
  X,
  User,
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  Shield,
  Euro,
} from 'lucide-react';

/** Lokálny storage kľúč pre preferovanú lokalitu */
const LS_PREF_LOC = 'sa_pref_loc';

type UICard = {
  id?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  verified?: boolean;
  rating?: number | null;
  tags?: string[];
  geo?: { lat: number; lng: number } | null;
  distanceKm?: number | null;
  actions?: {
    call?: string | null;
    email?: string | null;
    website?: string | null;
    ctaLabel?: string;
  };
};

/* ---------- malé pomocné komponenty ---------- */
function StarRating({ value = 0 }: { value?: number | null }) {
  const v = Math.max(0, Math.min(Number(value ?? 0), 5));
  const pct = (v / 5) * 100;
  return (
    <div className="relative inline-block leading-none" aria-label={`Hodnotenie ${v} z 5`}>
      <div className="text-gray-300 select-none">★★★★★</div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div className="text-yellow-400 select-none">★★★★★</div>
      </div>
    </div>
  );
}

function NavCta({
  onClick,
  children,
  className = '',
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl border-2 ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------- vzdialenosť (km) ---------- */
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

type SortBy = 'relevance' | 'rating' | 'distance';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    | 'home'
    | 'companyList'
    | 'addCompany'
    | 'companyDetail'
    | 'howItWorks'
    | 'references'
    | 'news'
    | 'helpCenter'
    | 'contact'
    | 'myAccount'
    | 'myOrders'
    | 'paymentSuccess'
    | 'paymentCancel'
  >('home');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // AI
  const [message, setMessage] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [cards, setCards] = useState<UICard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [page, setPage] = useState(0);
  const [limit] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ack, setAck] = useState('');
  const [aiActiveFilters, setAiActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Načítaj preferovanú lokalitu z localStorage pri štarte
  useEffect(() => {
    const existing = (localStorage.getItem(LS_PREF_LOC) || '').trim();
    if (existing && !userLocation) setUserLocation(existing);
  }, []);

  // Ukladaj preferovanú lokalitu
  useEffect(() => {
    const t = setTimeout(() => {
      const v = (userLocation || '').trim();
      localStorage.setItem(LS_PREF_LOC, v);
    }, 250);
    return () => clearTimeout(t);
  }, [userLocation]);

  const services = [
    { name: 'Murár', icon: Hammer, color: 'from-amber-500 to-orange-600' },
    { name: 'Vodár', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
    { name: 'Elektrikár', icon: Zap, color: 'from-yellow-500 to-amber-600' },
    { name: 'Obkladač', icon: Puzzle, color: 'from-purple-500 to-indigo-600' },
    { name: 'Maliar', icon: Palette, color: 'from-pink-500 to-rose-600' },
    { name: 'Záhradník', icon: Trees, color: 'from-green-500 to-emerald-600' },
    { name: 'Tesár', icon: Wrench, color: 'from-stone-500 to-gray-600' },
    { name: 'Kúrenár', icon: Flame, color: 'from-red-500 to-orange-600' },
    { name: 'Iné služby', icon: HelpCircle, color: 'from-slate-500 to-gray-600' },
  ];

  const aiQuickFilters = [
    { id: 'verified', label: 'Overené', icon: Shield },
    { id: 'rating-4plus', label: '★ 4+', icon: Star },
    { id: 'today', label: 'Dnes', icon: Calendar },
    { id: 'escrow', label: 'Escrow', icon: Shield },
    { id: 'budget-50', label: 'Do 50 €', icon: Euro },
  ];

  const menuItems = [
    { label: 'Ako fungujeme?', action: 'howItWorks' },
    { label: 'Referencie', action: 'references' },
    { label: 'Novinky', action: 'news' },
    { label: 'Centrum pomoci', action: 'helpCenter' },
    { label: 'Kontakt', action: 'contact' },
    { label: 'Moje objednávky', action: 'myOrders' },
  ];
  const mainMenuItems = [...menuItems];

  const relyOrEmpty = (s?: string) => (typeof s === 'string' ? s : '');

  /* ---------- Geolokácia ---------- */
  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Prehliadač nepodporuje geolokáciu.');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      alert('Nepodarilo sa získať polohu v časovom limite.');
    }, 9000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (!userLocation) setUserLocation('Moje okolie');
      },
      (err) => {
        clearTimeout(timer);
        console.error(err);
        alert('Nepodarilo sa získať polohu.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  const makeAck = (intent?: any, fallbackLocation?: string) => {
    const s = (intent?.service ?? '').toString().trim();
    const loc = (intent?.location ?? fallbackLocation ?? '').toString().trim();
    const parts: string[] = [];
    if (s) parts.push(`službu ${s.toLowerCase()}`);
    if (loc) parts.push(`lokalita ${loc}`);
    return parts.length ? `Rozumiem — ${parts.join(', ')}.` : '';
  };

  const toggleAiFilter = (filterId: string) => {
    setAiActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
  };

  const withDistances = (arr: UICard[]): UICard[] => {
    if (!coords) return arr.map((c) => ({ ...c, distanceKm: null }));
    return arr.map((c) => {
      if (c.geo && Number.isFinite(c.geo.lat) && Number.isFinite(c.geo.lng)) {
        const d = haversineKm(coords, c.geo);
        return { ...c, distanceKm: Math.round(d * 10) / 10 };
      }
      return { ...c, distanceKm: null };
    });
  };

  const sortCards = (arr: UICard[], by: SortBy): UICard[] => {
    if (by === 'rating') return [...arr].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    if (by === 'distance') {
      return [...arr].sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }
    return arr;
  };

  /* ---------- AI ---------- */
  const handleAsk = async () => {
    const msg = message.trim();
    if (!msg) return;

    setIsLoading(true);
    try {
      const nextHistory: ChatTurn[] = [...history, { role: 'user', content: msg }];
      const { reply, cards: incoming, intent, meta } = await askAI(msg, nextHistory, 0.7, {
        page: 0,
        limit,
        userLocation,
        coords,
        filters: aiActiveFilters,
      });

      const enriched = withDistances(incoming || []);
      const sorted = sortCards(enriched, sortBy);

      setLastQuery(msg);
      setPage(0);
      setAiResponse(relyOrEmpty(reply));
      setCards(sorted);
      setHasMore(!!meta?.hasMore);
      setHistory([...nextHistory, { role: 'assistant', content: reply }]);
      if (!userLocation && intent?.location) setUserLocation(intent.location);
      setAck(makeAck(intent, userLocation));
      setMessage('');
    } catch (error: any) {
      console.error('Chyba pri volaní AI asistenta:', error);
      setAiResponse('Prepáčte, nastala chyba pri komunikácii s AI asistentom. Skúste to prosím znovu.');
      setCards([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastQuery) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { cards: incoming, meta } = await askAI(lastQuery, history, 0.7, {
        page: nextPage,
        limit,
        userLocation,
        coords,
        filters: aiActiveFilters,
      });
      const enriched = withDistances(incoming || []);
      const merged = [...cards, ...enriched];
      setCards(sortCards(merged, sortBy));
      setPage(nextPage);
      setHasMore(!!meta?.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!cards.length) return;
    const enriched = withDistances(cards);
    setCards(sortCards(enriched, sortBy));
  }, [coords]); // eslint-disable-line

  useEffect(() => {
    setCards((prev) => sortCards(prev, sortBy));
  }, [sortBy]);

  /* ---------- Navigácia ---------- */
  const navigateToCompanyList = (serviceName: string) => {
    setSelectedService(serviceName);
    setCurrentPage('companyList');
  };
  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedService('');
  };
  const navigateToAddCompany = () => setCurrentPage('addCompany');
  const navigateToHowItWorks = () => setCurrentPage('howItWorks');
  const navigateToReferences = () => setCurrentPage('references');
  const navigateToNews = () => setCurrentPage('news');
  const navigateToHelpCenter = () => setCurrentPage('helpCenter');
  const navigateToContact = () => setCurrentPage('contact');
  const navigateToMyAccount = () => setCurrentPage('myAccount');
  const navigateToMyOrders = () => setCurrentPage('myOrders');
  const navigateToPaymentSuccess = () => setCurrentPage('paymentSuccess');
  const navigateToPaymentCancel = () => setCurrentPage('paymentCancel');
  const navigateToCompanyDetail = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentPage('companyDetail');
  };

  const handleMenuClick = (action: string | null) => {
    if (action === 'howItWorks') navigateToHowItWorks();
    else if (action === 'references') navigateToReferences();
    else if (action === 'news') navigateToNews();
    else if (action === 'helpCenter') navigateToHelpCenter();
    else if (action === 'contact') navigateToContact();
    else if (action === 'myAccount') navigateToMyAccount();
    else if (action === 'myOrders') navigateToMyOrders();
  };

  const gpsBadge = useMemo(
    () =>
      coords ? (
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
          GPS aktívne
        </span>
      ) : null,
    [coords]
  );

  const ORDER_AMOUNT_CENTS = 5000; // 50 €

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <button
                onClick={navigateToHome}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                ServisAI
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                {mainMenuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleMenuClick(item.action)}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50 rounded-lg"
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={navigateToMyAccount}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                    isLoggedIn
                      ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                  }`}
                >
                  <User size={16} />
                  {isLoggedIn ? 'Prihlásený' : 'Odhlásený'}
                </button>

                {isLoggedIn && (
                  <NavCta
                    onClick={navigateToMyOrders}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-green-400"
                  >
                    <Euro size={18} />
                    Moje objednávky
                  </NavCta>
                )}

                <NavCta
                  onClick={navigateToAddCompany}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-blue-400"
                >
                  Pridať firmu
                </NavCta>
              </div>
            </div>

            {/* Mobile burger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
            <div className="px-2 pt-2 pb-3 space-y-2">
              {mainMenuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleMenuClick(item.action);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => {
                  navigateToMyAccount();
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-3 text-base font-medium rounded-lg transition-all ${
                  isLoggedIn
                    ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                }`}
              >
                <User size={20} />
                {isLoggedIn ? 'Prihlásený' : 'Odhlásený'}
              </button>

              {isLoggedIn && (
                <button
                  onClick={() => {
                    navigateToMyOrders();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-base font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-2 border-green-400"
                >
                  <Euro size={22} />
                  Moje objednávky
                </button>
              )}

              <button
                onClick={() => {
                  navigateToAddCompany();
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-base font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-400"
              >
                Pridať firmu
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1">
        {currentPage === 'home' && (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                  Nájdite svojho
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Asistenta
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                  Opýtajte sa nášho AI asistenta na čokoľvek o domácich službách. Pomôže vám nájsť správneho odborníka
                  pre váš projekt.
                </p>
              </div>

              {/* AI chat */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-20">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">AI Asistent</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Napíšte svoju otázku... napr. 'Potrebujem opraviť vodovodné potrubie'"
                      className="flex-1 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/80 backdrop-blur-sm"
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
                    />
                    <button
                      onClick={handleAsk}
                      disabled={isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isLoading ? 'Načítavam...' : 'Odoslať'}
                    </button>
                  </div>

                  {ack && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-start gap-2">
                      <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <span>{ack}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="Uprednostniť lokalitu"
                      className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 w-full sm:w-auto flex-1"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={useMyLocation}
                        className="px-6 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <MapPin size={18} />
                        Firmy v mojom okolí
                      </button>
                      {gpsBadge}
                    </div>
                  </div>

                  {/* Quick Filters + Sort */}
                  <div className="flex flex-wrap gap-2 mt-4 items-center">
                    {aiQuickFilters.map((filter) => {
                      const IconComponent = filter.icon;
                      const isActive = aiActiveFilters.includes(filter.id);
                      return (
                        <button
                          key={filter.id}
                          onClick={() => toggleAiFilter(filter.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <IconComponent size={16} />
                          {filter.label}
                        </button>
                      );
                    })}

                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-600">Zoradiť podľa:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white"
                      >
                        <option value="relevance">Relevancia</option>
                        <option value="rating">Hodnotenie</option>
                        <option value="distance">Vzdialenosť</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isLoading && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-blue-700 font-medium">AI asistent premýšľa...</p>
                    </div>
                  </div>
                )}

                {aiResponse && !isLoading && cards.length === 0 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-4 flex-shrink-0">
                        <MessageCircle className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">AI Asistent odpovedá:</h4>
                        <p className="text-green-700 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------ KARTY ------ */}
                {cards.length > 0 && (
                  <>
                    <div className="flex flex-col space-y-6 mt-6">
                      {cards.map((c) => (
                        <div
                          key={String(c.id ?? c.title)}
                          className="flex flex-col h-full rounded-2xl shadow p-5 bg-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          onClick={() => c.id && navigateToCompanyDetail(String(c.id))}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold break-words">{c.title}</h3>
                              {c.subtitle && <p className="text-sm text-gray-500 truncate">{c.subtitle}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {coords && (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Moje okolie
                                </span>
                              )}
                              {c.verified && (
                                <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  Overená
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {typeof c.rating === 'number' ? (
                              <>
                                <StarRating value={c.rating} />
                                <span className="text-xs text-gray-500">{c.rating.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Nová firma</span>
                            )}

                            {c.location && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-2">
                                <MapPin size={12} />
                                {c.location}
                                {typeof c.distanceKm === 'number' && (
                                  <span className="text-gray-400">&nbsp;•&nbsp;{c.distanceKm} km</span>
                                )}
                              </span>
                            )}
                            {!c.location && typeof c.distanceKm === 'number' && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-2">
                                <MapPin size={12} />
                                {c.distanceKm} km
                              </span>
                            )}
                          </div>

                          {c.description && <p className="mt-3 text-sm text-gray-700 line-clamp-3">{c.description}</p>}

                          <div className="mt-3 min-h-8 flex flex-wrap gap-2">
                            {Array.isArray(c.tags) &&
                              c.tags.map((t: string) => (
                                <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {t}
                                </span>
                              ))}
                          </div>

                          {/* CTA + ESCROW */}
                          <div className="mt-auto pt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Escrow platba */}
                            {c.id && (
                              <button
                                onClick={async () => {
                                  if (!isLoggedIn) {
                                    alert('Pre platbu sa prosím najprv prihláste.');
                                    return;
                                  }
                                  try {
                                    await createOrderAndRedirect(String(c.id), ORDER_AMOUNT_CENTS);
                                  } catch (err) {
                                    console.error(err);
                                    alert('Nepodarilo sa vytvoriť escrow objednávku.');
                                  }
                                }}
                                className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              >
                                Escrow 50 €
                              </button>
                            )}

                            {/* Pôvodné CTA */}
                            {c.actions?.website ? (
                              <a
                                href={c.actions.website}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-xl bg-blue-600 text-white"
                              >
                                Kontaktovať
                              </a>
                            ) : c.actions?.call ? (
                              <a href={`tel:${c.actions.call}`} className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                                Zavolať
                              </a>
                            ) : c.actions?.email ? (
                              <a href={`mailto:${c.actions.email}`} className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                                Napísať e-mail
                              </a>
                            ) : null}

                            {c.actions?.call && (
                              <a href={`tel:${c.actions.call}`} className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700">
                                Tel.
                              </a>
                            )}
                            {c.actions?.email && (
                              <a href={`mailto:${c.actions.email}`} className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700">
                                Email
                              </a>
                            )}
                            {c.actions?.website && (
                              <a
                                href={c.actions.website}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-xl bg-gray-100"
                              >
                                Web
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={loadMore}
                          disabled={isLoading}
                          className="px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition disabled:opacity-60"
                        >
                          {isLoading ? 'Načítavam…' : 'Zobraziť viac'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Služby */}
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Naše služby</h3>
                <p className="text-lg text-gray-600">Vyberte si kategóriu služby, ktorú potrebujete</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => navigateToCompanyList(service.name)}
                      className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer group"
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="text-white" size={28} />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {currentPage === 'companyList' && (
          <CompanyListPage
            selectedService={selectedService}
            onNavigateBack={navigateToHome}
            onNavigateToCompanyDetail={navigateToCompanyDetail}
          />
        )}
        {currentPage === 'companyDetail' && selectedCompanyId && (
          <CompanyDetailPage companyId={selectedCompanyId} onNavigateBack={() => setCurrentPage('companyList')} />
        )}
        {currentPage === 'addCompany' && <AddCompanyPage onNavigateBack={navigateToHome} />}
        {currentPage === 'howItWorks' && (
          <HowItWorksPage onNavigateBack={navigateToHome} onNavigateToAddCompany={navigateToAddCompany} />
        )}
        {currentPage === 'references' && <ReferencesPage onNavigateBack={navigateToHome} />}
        {currentPage === 'news' && <NewsPage onNavigateBack={navigateToHome} />}
        {currentPage === 'helpCenter' && <HelpCenterPage onNavigateBack={navigateToHome} />}
        {currentPage === 'contact' && <ContactPage onNavigateBack={navigateToHome} />}
        {currentPage === 'myAccount' && <MyAccountPage onNavigateBack={navigateToHome} onNavigateToAddCompany={navigateToAddCompany} />}
        {currentPage === 'myOrders' && <MyOrdersPage onNavigateBack={navigateToHome} />}
        {currentPage === 'paymentSuccess' && (
          <PaymentSuccessPage onNavigateBack={navigateToHome} onNavigateToMyOrders={navigateToMyOrders} />
        )}
        {currentPage === 'paymentCancel' && (
          <PaymentCancelPage onNavigateBack={navigateToHome} onNavigateToMyOrders={navigateToMyOrders} />
        )}
      </div>

      <CookieConsentBanner />

      <footer className="bg-white/50 backdrop-blur-md mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              ServisAI
            </h2>
            <p className="text-gray-600 mb-6">Váš AI asistent pre domáce služby</p>
            <div className="flex justify-center space-x-6">
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => handleMenuClick(item.action)} className="text-gray-500 hover:text-blue-600 transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">© 2025 ServisAI. Všetky práva vyhradené.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
