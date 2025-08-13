import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Bell,
  Rss,
  Mail,
  Eye,
  MessageCircle,
  Heart,
  Bookmark,
  X,
  Menu,
  User
} from 'lucide-react';

interface NewsPageProps {
  onNavigateBack: () => void;
}

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  category: 'aktualizacie' | 'vylepsene' | 'opravene' | 'blog';
  date: string;
  coverImage: string;
  readTime: number;
  views: number;
  likes: number;
  author: string;
  tags: string[];
}

function NewsPage({ onNavigateBack }: NewsPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Mock data for news articles
  const newsArticles: NewsArticle[] = [
    {
      id: 1,
      title: 'Nová AI funkcia pre lepšie párovanie zákazníkov a firiem',
      description: 'Predstavujeme pokročilý algoritmus, ktorý analyzuje vaše požiadavky a automaticky nájde najvhodnejších odborníkov.',
      content: `# Nová AI funkcia pre lepšie párovanie

Sme hrdí na to, že môžeme predstaviť našu najnovšiu AI funkciu, ktorá revolučne zmení spôsob, akým spájame zákazníkov s odbornými firmami.

## Ako to funguje

Náš pokročilý algoritmus analyzuje:
- **Typ práce** a jej zložitosť
- **Lokalitu** a dostupnosť firiem
- **Rozpočet** a cenové preferencie
- **Časové požiadavky** a urgentnosť
- **Hodnotenia** a skúsenosti firiem

## Výhody pre zákazníkov

- ⚡ **Rýchlejšie párovanie** - výsledky do 30 sekúnd
- 🎯 **Presnejšie výsledky** - 95% spokojnosť s odporúčaniami
- 💰 **Lepšie ceny** - automatické porovnanie ponúk
- ⭐ **Kvalitnejšie služby** - priorita overených firiem

## Technické detaily

Používame najnovšie technológie strojového učenia a spracovanie prirodzeného jazyka pre analýzu vašich požiadaviek.`,
      category: 'vylepsene',
      date: '2025-01-15',
      coverImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
      readTime: 3,
      views: 1247,
      likes: 89,
      author: 'Tím ServisAI',
      tags: ['AI', 'Algoritmus', 'Párovanie', 'Technológie']
    },
    {
      id: 2,
      title: 'Bezpečnostné vylepšenia Escrow systému',
      description: 'Implementovali sme dodatočné bezpečnostné opatrenia pre ešte bezpečnejšie platby medzi zákazníkmi a firmami.',
      content: `# Bezpečnostné vylepšenia Escrow systému

Bezpečnosť vašich platieb je pre nás prioritou číslo jeden. Preto sme implementovali nové bezpečnostné opatrenia.

## Nové funkcie

### 🔐 Dvojfaktorová autentifikácia
- SMS overenie pre všetky platby nad 100€
- E-mailové potvrdenie pre uvoľnenie platieb

### 🛡️ Pokročilá detekcia podvodov
- Automatické skenovanie podozrivých transakcií
- AI analýza vzorcov správania

### 📱 Mobilné notifikácie
- Okamžité upozornenia na všetky platobné operácie
- Push notifikácie pre zmeny stavu objednávky

## Štatistiky bezpečnosti

- **99.9%** úspešnosť zabezpečených transakcií
- **0** prípadov straty finančných prostriedkov
- **24/7** monitoring všetkých platieb`,
      category: 'aktualizacie',
      date: '2025-01-12',
      coverImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
      readTime: 4,
      views: 892,
      likes: 67,
      author: 'Bezpečnostný tím',
      tags: ['Bezpečnosť', 'Escrow', 'Platby', 'Aktualizácia']
    },
    {
      id: 3,
      title: 'Oprava problému s notifikáciami na iOS',
      description: 'Vyriešili sme problém, ktorý spôsoboval, že používatelia iOS nedostávali push notifikácie o nových ponukách.',
      content: `# Oprava problému s notifikáciami na iOS

Identifikovali a vyriešili sme kritický problém s push notifikáciami na iOS zariadeniach.

## Čo bolo opravené

- ✅ Push notifikácie pre nové ponuky
- ✅ Upozornenia na zmeny stavu objednávky  
- ✅ Správy od firiem
- ✅ Pripomienky termínov

## Technické detaily

Problém bol spôsobený nekompatibilitou s najnovšou verziou iOS 18. Naš tím implementoval nové API pre push notifikácie.

## Ako aktualizovať

1. Otvorte App Store
2. Vyhľadajte "ServisAI"
3. Kliknite na "Aktualizovať"
4. Reštartujte aplikáciu

Ďakujeme za trpezlivosť a ospravedlňujeme sa za spôsobené nepríjemnosti.`,
      category: 'opravene',
      date: '2025-01-10',
      coverImage: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg',
      readTime: 2,
      views: 654,
      likes: 34,
      author: 'Vývojový tím',
      tags: ['iOS', 'Notifikácie', 'Oprava', 'Mobilná aplikácia']
    },
    {
      id: 4,
      title: 'Ako vybrať správneho elektrikára: Kompletný sprievodca',
      description: 'Praktické tipy a rady, na čo si dať pozor pri výbere elektrikára. Od overenia kvalifikácie až po hodnotenie ponúk.',
      content: `# Ako vybrať správneho elektrikára

Výber kvalitného elektrikára je kľúčový pre bezpečnosť vášho domova. Tu je kompletný sprievodca.

## 1. Overenie kvalifikácie

### Povinné dokumenty
- ✅ **Živnostenský list** - elektrotechnické práce
- ✅ **Osvedčenie o odbornej spôsobilosti**
- ✅ **Poistenie zodpovednosti** za škodu

### Certifikácie
- 📜 Vyhlášky a normy (STN, EN)
- 🔧 Špecializácie (fotovoltika, smart home)

## 2. Na čo sa opýtať

- Máte skúsenosti s podobnými prácami?
- Poskytujete záruku na prácu?
- Aké materiály používate?
- Kedy môžete začať?

## 3. Hodnotenie ponúk

### Porovnajte
- 💰 **Cenu** - nie vždy najlacnejšie = najlepšie
- ⏰ **Termíny** - realistické vs. nereálne sľuby  
- 📋 **Rozsah prác** - detailný rozpis
- ⭐ **Referencie** - overené hodnotenia

## 4. Červené vlajky

🚩 **Vyhnite sa elektrikárom, ktorí:**
- Chodia od domu k domu
- Požadujú plnú platbu vopred
- Nemajú poistenie
- Ponúkajú podozrivo nízke ceny
- Nemajú živnostenský list

## Záver

Správny elektrikár vám ušetrí peniaze aj starosti. Investujte čas do výberu a vaša elektroinštalácia bude bezpečná a spoľahlivá.`,
      category: 'blog',
      date: '2025-01-08',
      coverImage: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
      readTime: 6,
      views: 2156,
      likes: 143,
      author: 'Ing. Peter Novák',
      tags: ['Elektrikár', 'Sprievodca', 'Tipy', 'Bezpečnosť']
    },
    {
      id: 5,
      title: 'Nové kategórie služieb: Čistenie a údržba',
      description: 'Rozšírili sme našu ponuku o nové kategórie služieb zamerané na čistenie a údržbu domácností.',
      content: `# Nové kategórie služieb

Reagujeme na vaše požiadavky a pridávame nové kategórie služieb.

## Nové služby

### 🧹 Čistenie
- Upratovanie domácností
- Čistenie okien
- Čistenie kobercov a čalúnenia
- Upratovanie po rekonštrukcii

### 🔧 Údržba
- Pravidelná údržba domov
- Kontroly a servis
- Preventívne prehliadky
- Sezónne práce

## Ako to funguje

1. **Vyberte službu** z novej kategórie
2. **Opíšte požiadavky** - čo potrebujete
3. **Dostanete ponuky** od overených firiem
4. **Objednajte** s bezpečnou platbou

## Špeciálna ponuka

🎉 **Prvých 50 objednávok** v nových kategóriách získa **15% zľavu**!

Platí do 31. januára 2025.`,
      category: 'vylepsene',
      date: '2025-01-05',
      coverImage: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg',
      readTime: 3,
      views: 987,
      likes: 76,
      author: 'Produktový tím',
      tags: ['Nové služby', 'Čistenie', 'Údržba', 'Rozšírenie']
    },
    {
      id: 6,
      title: 'Zimné údržbárske práce: Na čo nezabudnúť',
      description: 'Praktický zoznam zimných údržbárskych prác, ktoré by ste mali stihnúť pred príchodom mrazu.',
      content: `# Zimné údržbárske práce

Zima je tu a je čas pripraviť váš dom na chladné mesiace.

## Vonkajšie práce

### 🏠 Strecha a žľaby
- Vyčistenie žľabov od lístia
- Kontrola škridiel a krytiny
- Odstránenie námrazy z okrajov

### 🌡️ Vykurovanie
- Kontrola kotla a radiátorov
- Odvzdušnenie systému
- Kontrola komína

## Vnútorné práce

### 🪟 Okná a dvere
- Kontrola tesnení
- Výmena poškodených tesnení
- Nastavenie kľučiek a zámkov

### 💡 Elektroinštalácia
- Kontrola vonkajšieho osvetlenia
- Testovanie záložných zdrojov
- Kontrola predlžovačiek

## Kedy volať odborníka

⚠️ **Okamžite kontaktujte odborníka pri:**
- Úniku plynu
- Výpadku vykurovania
- Zatekaniu strechy
- Probléme s elektrinou

## Preventívne kontroly

Pravidelné kontroly vám ušetria peniaze za drahé opravy v zime.`,
      category: 'blog',
      date: '2025-01-03',
      coverImage: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg',
      readTime: 4,
      views: 1543,
      likes: 98,
      author: 'Údržbársky expert',
      tags: ['Zima', 'Údržba', 'Prevencia', 'Dom']
    },
    {
      id: 7,
      title: 'Oprava chyby pri nahrávaní fotografií',
      description: 'Vyriešili sme problém, ktorý bránil používateľom nahrávať fotografie k svojim objednávkam na Android zariadeniach.',
      content: `# Oprava chyby pri nahrávaní fotografií

Identifikovali sme a opravili problém s nahrávaním fotografií na Android zariadeniach.

## Čo bolo opravené

- ✅ Nahrávanie z galérie
- ✅ Fotografovanie cez aplikáciu
- ✅ Kompresiu veľkých súborov
- ✅ Rotáciu obrázkov

## Ovplyvnené verzie

Problém sa týkal Android verzií 11-14 pri nahrávaní súborov väčších ako 5MB.

## Riešenie

Implementovali sme nový systém spracovania obrázkov s automatickou kompresiou a optimalizáciou.

Aktualizácia je dostupná v Google Play Store.`,
      category: 'opravene',
      date: '2025-01-01',
      coverImage: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg',
      readTime: 2,
      views: 432,
      likes: 23,
      author: 'Mobilný tím',
      tags: ['Android', 'Fotografie', 'Oprava', 'Nahrávanie']
    },
    {
      id: 8,
      title: 'Rozšírenie podpory pre platobné karty',
      description: 'Pridali sme podporu pre American Express, Diners Club a ďalšie medzinárodné platobné karty.',
      content: `# Rozšírenie podpory pre platobné karty

Rozšírili sme podporu platobných metód pre lepšiu dostupnosť našich služieb.

## Nové podporované karty

### 💳 Kreditné karty
- American Express
- Diners Club  
- JCB
- UnionPay

### 🏦 Lokálne riešenia
- ČSOB Pay
- Tatra Pay
- VÚB eKonto

## Bezpečnosť

Všetky platby sú zabezpečené:
- 🔒 3D Secure protokol
- 🛡️ PCI DSS certifikácia
- 🔐 End-to-end šifrovanie

## Ako pridať novú kartu

1. Prejdite do nastavení
2. Kliknite na "Platobné metódy"
3. Vyberte "Pridať kartu"
4. Zadajte údaje karty

Vaše údaje sú v bezpečí a nie sú ukladané na našich serveroch.`,
      category: 'aktualizacie',
      date: '2024-12-28',
      coverImage: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
      readTime: 3,
      views: 756,
      likes: 45,
      author: 'Platobný tím',
      tags: ['Platby', 'Karty', 'Rozšírenie', 'Bezpečnosť']
    }
  ];

  const filterCategories = [
    { id: 'all', label: 'Všetko', count: newsArticles.length },
    { id: 'aktualizacie', label: 'Aktualizácie', count: newsArticles.filter(a => a.category === 'aktualizacie').length },
    { id: 'vylepsene', label: 'Vylepšené', count: newsArticles.filter(a => a.category === 'vylepsene').length },
    { id: 'opravene', label: 'Opravené', count: newsArticles.filter(a => a.category === 'opravene').length },
    { id: 'blog', label: 'Blog', count: newsArticles.filter(a => a.category === 'blog').length }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'aktualizacie': return 'bg-blue-100 text-blue-800';
      case 'vylepsene': return 'bg-green-100 text-green-800';
      case 'opravene': return 'bg-orange-100 text-orange-800';
      case 'blog': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'aktualizacie': return '🔄';
      case 'vylepsene': return '✨';
      case 'opravene': return '🔧';
      case 'blog': return '📝';
      default: return '📰';
    }
  };

  const filteredArticles = newsArticles.filter(article => {
    const matchesFilter = activeFilter === 'all' || article.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const displayedArticles = filteredArticles.slice(0, displayedCount);
  const hasMoreArticles = displayedCount < filteredArticles.length;

  const loadMoreArticles = () => {
    setDisplayedCount(prev => Math.min(prev + 6, filteredArticles.length));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelatedArticles = (currentArticle: NewsArticle) => {
    return newsArticles
      .filter(article => 
        article.id !== currentArticle.id && 
        (article.category === currentArticle.category || 
         article.tags.some(tag => currentArticle.tags.includes(tag)))
      )
      .slice(0, 3);
  };

  // Article Detail View
  if (selectedArticle) {
    const relatedArticles = getRelatedArticles(selectedArticle);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        {/* Article Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-lg hover:bg-white/90 transition-colors duration-200"
            >
              <ArrowLeft className="text-blue-600" size={20} />
              <span className="text-gray-700">Späť na zoznam</span>
            </button>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedArticle.category)}`}>
                {getCategoryIcon(selectedArticle.category)} {filterCategories.find(c => c.id === selectedArticle.category)?.label}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar size={16} className="mr-2" />
                {formatDate(selectedArticle.date)}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock size={16} className="mr-2" />
                {selectedArticle.readTime} min čítania
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {selectedArticle.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {selectedArticle.description}
            </p>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">
                    {selectedArticle.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedArticle.author}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye size={14} className="mr-1" />
                    {selectedArticle.views.toLocaleString()} zobrazení
                    <Heart size={14} className="ml-3 mr-1" />
                    {selectedArticle.likes} páči sa mi
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <Share2 size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <Bookmark size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="mb-8">
            <img
              src={selectedArticle.coverImage}
              alt={selectedArticle.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg mb-12">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: selectedArticle.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, match => {
                  const level = match.trim().length;
                  return `<h${level} class="text-${4-level}xl font-bold text-gray-800 mb-4 mt-8">`;
                }).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
            
            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Súvisiace články</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  >
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main News List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-start mb-6">
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Novinky
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Sledujte najnovšie aktualizácie, vylepšenia a užitočné články o domácich službách
          </p>
          <div className="mt-8">
            <button
              onClick={() => setShowSubscribeModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
            >
              <Bell size={16} />
              Odoberať novinky
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hľadať v novinkách..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveFilter(category.id);
                setDisplayedCount(6); // Reset pagination when filter changes
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                activeFilter === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-md text-gray-700 hover:bg-white/90 shadow-md'
              }`}
            >
              <span>{getCategoryIcon(category.id === 'all' ? 'all' : category.id)}</span>
              {category.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeFilter === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results Summary */}
        {searchQuery && (
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Nájdených <span className="font-semibold">{filteredArticles.length}</span> výsledkov pre "{searchQuery}"
            </p>
          </div>
        )}

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {displayedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              {/* Cover Image */}
              <div className="relative overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                    {getCategoryIcon(article.category)} {filterCategories.find(c => c.id === article.category)?.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date and Read Time */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(article.date)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {article.readTime} min
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye size={14} className="mr-1" />
                    {article.views.toLocaleString()}
                    <Heart size={14} className="ml-3 mr-1" />
                    {article.likes}
                  </div>
                  <ChevronRight className="text-blue-600 group-hover:translate-x-1 transition-transform duration-200" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreArticles && (
          <div className="text-center">
            <button
              onClick={loadMoreArticles}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Načítať ďalšie ({filteredArticles.length - displayedCount} zostáva)
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <Search className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Žiadne výsledky
              </h3>
              <p className="text-gray-500 mb-4">
                Skúste zmeniť filter alebo vyhľadávací výraz
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Vymazať filtre
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Odoberať novinky</h2>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Dostávajte najnovšie aktualizácie a užitočné články priamo do e-mailu.
            </p>
            
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Váš e-mail"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex items-center gap-3">
                <input type="checkbox" id="rss" className="rounded" />
                <label htmlFor="rss" className="text-sm text-gray-600 flex items-center gap-2">
                  <Rss size={16} />
                  Chcem aj RSS feed
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Zrušiť
              </button>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Odoberať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsPage;