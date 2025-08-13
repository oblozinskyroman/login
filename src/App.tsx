import React, { useEffect, useState } from 'react';
import CompanyListPage from './pages/CompanyListPage';
import AddCompanyPage from './pages/AddCompanyPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ReferencesPage from './pages/ReferencesPage';
import NewsPage from './pages/NewsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import MyAccountPage from './pages/MyAccountPage';

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
} from 'lucide-react';

type UICard = {
  id?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  verified?: boolean;
  rating?: number | null;
  tags?: string[];
  actions?: {
    call?: string | null;
    email?: string | null;
    website?: string | null;
    ctaLabel?: string;
  };
};

/* ---------- ⭐ hviezdičky ---------- */
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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    'home' | 'companyList' | 'addCompany' | 'howItWorks' | 'references' | 'news' | 'helpCenter' | 'contact' | 'myAccount'
  >('home');
  const [selectedService, setSelectedService] = useState<string>('');

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

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

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

  const menuItems = [
    { label: 'Ako fungujeme?', action: 'howItWorks' },
    { label: 'Referencie', action: 'references' },
    { label: 'Novinky', action: 'news' },
    { label: 'Centrum pomoci', action: 'helpCenter' },
    { label: 'Kontakt', action: 'contact' },
  ];
  const mainMenuItems = [...menuItems];

  const relyOrEmpty = (s?: string) => (typeof s === 'string' ? s : '');

  /* ---------- Geolokácia: Firmy v mojom okolí ---------- */
  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Prehliadač nepodporuje geolokáciu.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (!userLocation) setUserLocation('Moje okolie');
      },
      (err) => {
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

  /* ---------- AI volanie ---------- */
  const handleAsk = async () => {
    const msg = message.trim();
    if (!msg) return;

    setIsLoading(true);
    try {
      const nextHistory: ChatTurn[] = [...history, { role: 'user', content: msg }];
      const { reply, cards: incoming, intent, meta } = await askAI(
        msg,
        nextHistory,
        0.7,
        { page: 0, limit, userLocation, coords }
      );

      setLastQuery(msg);
      setPage(0);
      setAiResponse(relyOrEmpty(reply));
      setCards(incoming || []);
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
      const { cards: incoming, meta } = await askAI(
        lastQuery,
        history,
        0.7,
        { page: nextPage, limit, userLocation, coords }
      );
      setCards((prev) => [...prev, ...(incoming || [])]);
      setPage(nextPage);
      setHasMore(!!meta?.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Navigácia ---------- */
  const navigateToCompanyList = (serviceName: string) => {
    setSelectedService(serviceName);
    setCurrentPage('companyList');
  };
  const navigateToHome = () => { setCurrentPage('home'); setSelectedService(''); };
  const navigateToAddCompany = () => setCurrentPage('addCompany');
  const navigateToHowItWorks = () => setCurrentPage('howItWorks');
  const navigateToReferences = () => setCurrentPage('references');
  const navigateToNews = () => setCurrentPage('news');
  const navigateToHelpCenter = () => setCurrentPage('helpCenter');
  const navigateToContact = () => setCurrentPage('contact');
  const navigateToMyAccount = () => setCurrentPage('myAccount');

  const handleMenuClick = (action: string | null) => {
    if (action === 'howItWorks') navigateToHowItWorks();
    else if (action === 'references') navigateToReferences();
    else if (action === 'news') navigateToNews();
    else if (action === 'helpCenter') navigateToHelpCenter();
    else if (action === 'contact') navigateToContact();
    else if (action === 'myAccount') navigateToMyAccount();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <button
                onClick={navigateToHome}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                ServisAI
              </button>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {mainMenuItems.map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleMenuClick(item.action); }}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50 rounded-lg"
                  >
                    {item.label}
                  </a>
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

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateToAddCompany(); }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ml-4"
                >
                  Pridať firmu
                </a>
              </div>
            </div>

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

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {mainMenuItems.map((item, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleMenuClick(item.action); setMobileMenuOpen(false); }}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}

              <button
                onClick={() => { navigateToMyAccount(); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg transition-all ${
                  isLoggedIn
                    ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                }`}
              >
                <User size={20} />
                {isLoggedIn ? 'Prihlásený' : 'Odhlásený'}
              </button>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigateToAddCompany(); }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white block px-3 py-2 text-base font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all mt-4"
              >
                Pridať firmu
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1">
        {currentPage === 'home' && (
          <>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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

                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="Uprednostniť lokalitu"
                      className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    <button
                      type="button"
                      onClick={useMyLocation}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} />
                      Firmy v mojom okolí
                    </button>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                      {cards.map((c) => (
                        <div key={String(c.id ?? c.title)} className="flex flex-col h-full rounded-2xl shadow p-5 bg-white">
                          {/* Hlavička */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold break-words">{c.title}</h3>
                              {c.subtitle && <p className="text-sm text-gray-500 truncate">{c.subtitle}</p>}
                            </div>
                            {c.verified && (
                              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Overená
                              </span>
                            )}
                          </div>

                          {/* Rating / Nová firma */}
                          <div className="mt-2 flex items-center gap-2">
                            {typeof c.rating === 'number' ? (
                              <>
                                <StarRating value={c.rating} />
                                <span className="text-xs text-gray-500">{c.rating.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                Nová firma
                              </span>
                            )}
                          </div>

                          {/* Popis */}
                          {c.description && (
                            <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                              {c.description}
                            </p>
                          )}

                          {/* Tagy – konzistentná výška */}
                          <div className="mt-3 min-h-8 flex flex-wrap gap-2">
                            {Array.isArray(c.tags) && c.tags.map((t: string) => (
                              <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* CTA naspodku */}
                          <div className="mt-auto pt-4 flex flex-wrap gap-2">
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
                              <a
                                href={`tel:${c.actions.call}`}
                                className="px-3 py-2 rounded-xl bg-blue-600 text-white"
                              >
                                Zavolať
                              </a>
                            ) : c.actions?.email ? (
                              <a
                                href={`mailto:${c.actions.email}`}
                                className="px-3 py-2 rounded-xl bg-blue-600 text-white"
                              >
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
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
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
          <CompanyListPage selectedService={selectedService} onNavigateBack={navigateToHome} />
        )}
        {currentPage === 'addCompany' && <AddCompanyPage onNavigateBack={navigateToHome} />}
        {currentPage === 'howItWorks' && (
          <HowItWorksPage onNavigateBack={navigateToHome} onNavigateToAddCompany={navigateToAddCompany} />
        )}
        {currentPage === 'references' && <ReferencesPage onNavigateBack={navigateToHome} />}
        {currentPage === 'news' && <NewsPage onNavigateBack={navigateToHome} />}
        {currentPage === 'helpCenter' && <HelpCenterPage onNavigateBack={navigateToHome} />}
        {currentPage === 'contact' && <ContactPage onNavigateBack={navigateToHome} />}
        {currentPage === 'myAccount' && (
          <MyAccountPage onNavigateBack={navigateToHome} onNavigateToAddCompany={navigateToAddCompany} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              ServisAI
            </h2>
            <p className="text-gray-600 mb-6">Váš AI asistent pre domáce služby</p>
            <div className="flex justify-center space-x-6">
              {menuItems.map((item, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleMenuClick(item.action); }}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
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
