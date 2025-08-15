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

import { createOrderAndRedirect } from './lib/createOrderAndRedirect';
import { supabase } from './lib/supabase';
import { askAI, type ChatTurn } from './lib/askAI';

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
  amountCents?: number; // pre objednávku (default 5000)
  actions?: {
    call?: string | null;
    email?: string | null;
    website?: string | null;
    ctaLabel?: string;
  };
};

type SortBy = 'relevance' | 'rating' | 'distance';

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
  const [sortBy, setSortBy] = useState<SortBy>('relevance'); // ✅ jediný stav pre triedenie

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ AUTH efekt – správne uzavretý
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setCurrentUser(user);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Načítaj preferovanú lokalitu pri štarte
  useEffect(() => {
    const existing = (localStorage.getItem(LS_PREF_LOC) || '').trim();
    if (existing && !userLocation) setUserLocation(existing);
  }, [userLocation]);

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

  const toggleAiFilter = (filterId: string) => {
    setAiActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
  };

  const makeAck = (intent: any, userLoc: string) => {
    const parts: string[] = [];
    if (intent?.service) parts.push(`Služba: ${intent.service}`);
    if (intent?.location || userLoc) parts.push(`Lokalita: ${intent?.location || userLoc}`);
    if (intent?.budget) parts.push(`Rozpočet: ${intent.budget}`);
    return parts.length > 0 ? `Rozumiem: ${parts.join(', ')}` : '';
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
    return arr; // relevance = pôvodné poradie
  };

  /* ---------- AI ---------- */
  const handleAsk = async () => {
    const msg = message.trim();
    if (!msg) return;

    setIsLoading(true);
    try {
      const nextHistory: ChatTurn[] = [...history, { role: 'user', content: msg }];

      // tolerujeme rôzne signatúry askAI – preto cast na any
      const { reply, cards: incoming, intent, meta } = (await (askAI as any)(msg, nextHistory, 0.7, {
        page: 0,
        limit,
        userLocation,
        coords,
        filters: aiActiveFilters,
      })) as any;

      const enriched = withDistances(incoming || []);
      const sorted = sortCards(enriched, sortBy);

      setLastQuery(msg);
      setPage(0);
      setAiResponse(String(reply || ''));
      setCards(sorted);
      setHasMore(Boolean(meta?.hasMore));
      setHistory([...nextHistory, { role: 'assistant', content: String(reply || '') }]);
      if (!userLocation && intent?.location) setUserLocation(intent.location);
      setAck(makeAck(intent, userLocation));
      setMessage('');
    } catch (error) {
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
      const { cards: incoming, meta } = (await (askAI as any)(lastQuery, history, 0.7, {
        page: nextPage,
        limit,
        userLocation,
        coords,
        filters: aiActiveFilters,
      })) as any;

      const enriched = withDistances(incoming || []);
      const merged = [...cards, ...enriched];
      setCards(sortCards(merged, sortBy));
      setPage(nextPage);
      setHasMore(Boolean(meta?.hasMore));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // prepočítaj vzdialenosť po zmene GPS
  useEffect(() => {
    if (!cards.length) return;
    const enriched = withDistances(cards);
    setCards(sortCards(enriched, sortBy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  // zmena triedenia
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

  /* ---------- UI ---------- */
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
                  Opýtajte sa nášho AI asistenta na čokoľvek o domácich službách. Pomôže vám nájsť správneho odborníka pre váš projekt.
                </p>

                {/* AI input */}
                <div className="max-w-3xl mx-auto flex gap-3">
                  <input
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Napíšte svoju otázku..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  />
                  <button
                    onClick={handleAsk}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    <MessageCircle size={18} />
                    Odošľať
                  </button>
                </div>

                {ack && <div className="mt-3 text-sm text-gray-600">{ack}</div>}

                {/* Odpoveď AI */}
                {aiResponse && (
                  <div className="max-w-3xl mx-auto mt-8 p-4 rounded-lg bg-white shadow">
                    <div className="prose prose-sm max-w-none">{aiResponse}</div>
                  </div>
                )}

                {/* Výsledky */}
                {!!cards.length && (
                  <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((c, idx) => (
                      <div key={c.id ?? idx} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{c.title}</h3>
                          {c.verified && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <CheckCircle size={14} /> overené
                            </span>
                          )}
                        </div>
                        {c.subtitle && <div className="text-sm text-gray-500">{c.subtitle}</div>}
                        {c.rating != null && (
                          <div className="flex items-center gap-2">
                            <StarRating value={c.rating} />
                            <span className="text-sm text-gray-600">{c.rating?.toFixed(1)}</span>
                          </div>
                        )}
                        {typeof c.distanceKm === 'number' && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={14} /> {c.distanceKm} km
                          </div>
                        )}
                        {c.description && <p className="text-sm text-gray-700">{c.description}</p>}

                        <button
                          onClick={() =>
                            createOrderAndRedirect(String(c.id ?? 'company'), c.amountCents ?? 5000, currentUser?.id)
                          }
                          className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                        >
                          <Euro size={16} /> Objednať {((c.amountCents ?? 5000) / 100).toFixed(2)} €
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load more */}
                {hasMore && (
                  <div className="mt-8">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-black disabled:opacity-60"
                    >
                      Načítať ďalšie
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentPage === 'companyList' && <CompanyListPage />}
        {currentPage === 'addCompany' && <AddCompanyPage />}
        {currentPage === 'companyDetail' && selectedCompanyId && (
          <CompanyDetailPage companyId={selectedCompanyId} />
        )}
        {currentPage === 'howItWorks' && <HowItWorksPage />}
        {currentPage === 'references' && <ReferencesPage />}
        {currentPage === 'news' && <NewsPage />}
        {currentPage === 'helpCenter' && <HelpCenterPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'myAccount' && <MyAccountPage />}
        {currentPage === 'myOrders' && <MyOrdersPage />}
        {currentPage === 'paymentSuccess' && <PaymentSuccessPage />}
        {currentPage === 'paymentCancel' && <PaymentCancelPage />}
      </div>

      <CookieConsentBanner />
    </div>
  );
}

export default App;
