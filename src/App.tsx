// src/App.tsx
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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    'home' | 'companyList' | 'addCompany' | 'howItWorks' | 'references' | 'news' | 'helpCenter' | 'contact' | 'myAccount'
  >('home');
  const [selectedService, setSelectedService] = useState<string>('');

  // AI chat state
  const [message, setMessage] = useState('');
  const [lastQuery, setLastQuery] = useState('');          // pre "Zobraziť viac"
  const [aiResponse, setAiResponse] = useState('');
  const [cards, setCards] = useState<UICard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);

  // Listovanie + lokalita
  const [page, setPage] = useState(0);
  const [limit] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [userLocation, setUserLocation] = useState('');    // priorita okolia

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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

  // ---- AI volanie cez Supabase Edge Function (askAI) ----
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
        { page: 0, limit, userLocation }
      );

      setLastQuery(msg);
      setPage(0);
      setAiResponse(relyOrEmpty(reply));   // text ako doplnok
      setCards(incoming || []);
      setHasMore(!!meta?.hasMore);
      setHistory([...nextHistory, { role: 'assistant', content: reply }]);

      // predvyplň lokalitu z intentu, ak je prázdna
      if (!userLocation && intent?.location) setUserLocation(intent.location);
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
        { page: nextPage, limit, userLocation }
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
      {/* Navigation */}
      {/* ... (nezmenené menu; nechávam tvoju doterajšiu verziu) ... */}

      {/* Main Content */}
      <div className="flex-1">
        {currentPage === 'home' && (
          <>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              {/* Hero */}
              {/* ... nadpisy ponechané ... */}

              {/* AI Chat */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-20">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">AI Asistent</h3>
                </div>

                {/* dotaz + lokalita */}
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
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? 'Načítavam...' : 'Odoslať'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="Uprednostniť lokalitu (napr. 'Bratislava')"
                      className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    {/* (miesto ďalších filtrov zatiaľ len lokalita) */}
                  </div>
                </div>

                {/* Loading */}
                {isLoading && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-blue-700 font-medium">AI asistent premýšľa...</p>
                    </div>
                  </div>
                )}

                {/* Fallback text iba ak niet kariet */}
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

                {/* KARTY */}
                {cards.length > 0 && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                      {cards.map((c) => (
                        <div key={String(c.id ?? c.title)} className="rounded-2xl shadow p-5 bg-white">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{c.title}</h3>
                              {c.subtitle && <p className="text-sm text-gray-500">{c.subtitle}</p>}
                            </div>
                            {c.verified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Overená</span>
                            )}
                          </div>

                          {c.description && (
                            <p className="mt-3 text-sm text-gray-700 line-clamp-3">{c.description}</p>
                          )}

                          {Array.isArray(c.tags) && c.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {c.tags.map((t) => (
                                <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {/* Primárne CTA – vyber najlepší dostupný kontakt */}
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
                              <a
                                href={`mailto:${c.actions.email}`}
                                className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700"
                              >
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

              {/* Services Grid (nezmenené) */}
              {/* ... */}
            </div>
          </>
        )}

        {/* ostatné stránky – nezmenené */}
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

      {/* Footer – bez zmeny */}
    </div>
  );
}

export default App;
