import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Heart, 
  User, 
  Calendar,
  TrendingUp,
  Bookmark,
  Share2,
  ChevronRight
} from 'lucide-react';

interface NewsPageProps {
  onNavigateBack: () => void;
}

interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  date: string;
  coverImage: string;
  readTime: number;
  views: number;
  likes: number;
  author: string;
  tags: string[];
}

function NewsPage({ onNavigateBack }: NewsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // 18 článkov s rôznorodým obsahom
  const articles: Article[] = [
    {
      id: 1,
      title: 'Revolučné AI vylepšenia pre presnejšie párovanie zákazníkov a poskytovateľov',
      description: 'Predstavujeme najnovšie algoritmy umelej inteligencie, ktoré analyzujú tisíce parametrov pre optimálne párovanie.',
      content: 'Detailný obsah článku o AI vylepšeniach...',
      category: 'vylepsene',
      date: '2025-01-15',
      coverImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
      readTime: 12,
      views: 3247,
      likes: 189,
      author: 'Vývojový tím ServisAI',
      tags: ['AI', 'Algoritmus', 'Párovanie', 'Technológie', 'Inovácie']
    },
    {
      id: 2,
      title: 'Komplexné bezpečnostné vylepšenia Escrow systému pre rok 2025',
      description: 'Detailný prehľad všetkých bezpečnostných opatrení implementovaných v našom Escrow systéme.',
      content: 'Detailný obsah článku o bezpečnostných vylepšeniach...',
      category: 'aktualizacie',
      date: '2025-01-12',
      coverImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
      readTime: 15,
      views: 2892,
      likes: 167,
      author: 'Bezpečnostný tím ServisAI',
      tags: ['Bezpečnosť', 'Escrow', 'Platby', 'Aktualizácia', 'Kryptografia']
    },
    {
      id: 3,
      title: 'Rozšírenie služieb: Nové kategórie pre komplexné domáce riešenia',
      description: 'Predstavujeme 15 nových kategórií služieb, ktoré pokrývajú všetky aspekty moderného domova.',
      content: 'Detailný obsah článku o rozšírení služieb...',
      category: 'vylepsene',
      date: '2025-01-10',
      coverImage: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg',
      readTime: 18,
      views: 4156,
      likes: 234,
      author: 'Produktový tím ServisAI',
      tags: ['Nové služby', 'Smart Home', 'Udržateľnosť', 'Inovácie', 'Rozšírenie']
    },
    {
      id: 4,
      title: 'Smart Home integrácia: Pripojte svoje zariadenia k ServisAI',
      description: 'Nová funkcia umožňuje priame prepojenie s populárnymi smart home systémami.',
      content: 'Detailný obsah článku o Smart Home integrácii...',
      category: 'technologie',
      date: '2025-01-08',
      coverImage: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg',
      readTime: 10,
      views: 2156,
      likes: 145,
      author: 'Tech tím ServisAI',
      tags: ['Smart Home', 'IoT', 'Integrácia', 'Automatizácia']
    },
    {
      id: 5,
      title: 'Mobilná aplikácia 3.0: Kompletne prepracované používateľské rozhranie',
      description: 'Nová verzia mobilnej aplikácie s moderným dizajnom a vylepšenou funkcionalitou.',
      content: 'Detailný obsah článku o mobilnej aplikácii...',
      category: 'vylepsene',
      date: '2025-01-05',
      coverImage: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      readTime: 8,
      views: 3421,
      likes: 298,
      author: 'UX/UI tím ServisAI',
      tags: ['Mobilná aplikácia', 'UX/UI', 'Dizajn', 'Používateľnosť']
    },
    {
      id: 6,
      title: 'Ekologické služby: Nový trend v domácich riešeniach',
      description: 'Rastúci záujem o udržateľné a environmentálne šetrné služby pre domácnosť.',
      content: 'Detailný obsah článku o ekologických službách...',
      category: 'trendy',
      date: '2025-01-03',
      coverImage: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      readTime: 12,
      views: 1876,
      likes: 156,
      author: 'Sustainability tím ServisAI',
      tags: ['Ekológia', 'Udržateľnosť', 'Zelené technológie', 'Životné prostredie']
    },
    {
      id: 7,
      title: 'Partnerstvo s najväčšími dodávateľmi stavebných materiálov',
      description: 'Nové partnerstvá umožňujú lepšie ceny a rýchlejšie dodávky materiálov.',
      content: 'Detailný obsah článku o partnerstvách...',
      category: 'partnerstva',
      date: '2025-01-01',
      coverImage: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg',
      readTime: 6,
      views: 2341,
      likes: 187,
      author: 'Business Development tím',
      tags: ['Partnerstvá', 'Materiály', 'Dodávatelia', 'Ceny']
    },
    {
      id: 8,
      title: 'Zimné služby 2025: Príprava domácnosti na chladné mesiace',
      description: 'Komplexný sprievodca zimnou údržbou a prípravou domácnosti.',
      content: 'Detailný obsah článku o zimných službách...',
      category: 'sezonne',
      date: '2024-12-28',
      coverImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      readTime: 14,
      views: 2987,
      likes: 203,
      author: 'Sezónny tím ServisAI',
      tags: ['Zima', 'Údržba', 'Príprava', 'Vykurovanie']
    },
    {
      id: 9,
      title: 'Kybernetická bezpečnosť: Ochrana vašich smart zariadení',
      description: 'Dôležité bezpečnostné opatrenia pre ochranu inteligentných domácich zariadení.',
      content: 'Detailný obsah článku o kybernetickej bezpečnosti...',
      category: 'bezpecnost',
      date: '2024-12-25',
      coverImage: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
      readTime: 11,
      views: 1654,
      likes: 134,
      author: 'Cybersecurity tím',
      tags: ['Bezpečnosť', 'Kybernetika', 'Smart zariadenia', 'Ochrana']
    },
    {
      id: 10,
      title: 'Komunitné projekty: Spájame susedov pre lepšie bývanie',
      description: 'Nová iniciatíva podporuje spoluprácu medzi susedmi pri domácich projektoch.',
      content: 'Detailný obsah článku o komunitných projektoch...',
      category: 'komunita',
      date: '2024-12-22',
      coverImage: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      readTime: 9,
      views: 2123,
      likes: 178,
      author: 'Community tím ServisAI',
      tags: ['Komunita', 'Susedia', 'Spolupráca', 'Projekty']
    },
    {
      id: 11,
      title: 'Vzdelávacie webináre: Naučte sa základy domácej údržby',
      description: 'Bezplatné online kurzy pre všetkých, ktorí sa chcú naučiť základy údržby.',
      content: 'Detailný obsah článku o vzdelávacích webinároch...',
      category: 'vzdelavanie',
      date: '2024-12-20',
      coverImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
      readTime: 7,
      views: 1789,
      likes: 145,
      author: 'Vzdelávací tím ServisAI',
      tags: ['Vzdelávanie', 'Webináre', 'Údržba', 'Kurzy']
    },
    {
      id: 12,
      title: 'Novoročné akcie: Zľavy až do 50% na vybrané služby',
      description: 'Špeciálne cenové ponuky na začiatok roku 2025 pre všetky kategórie služieb.',
      content: 'Detailný obsah článku o novoročných akciách...',
      category: 'akcie',
      date: '2024-12-18',
      coverImage: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg',
      readTime: 5,
      views: 4567,
      likes: 389,
      author: 'Marketing tím ServisAI',
      tags: ['Akcie', 'Zľavy', 'Novoročné', 'Ponuky']
    },
    {
      id: 13,
      title: 'Regionálne rozšírenie: ServisAI prichádza do nových miest',
      description: 'Rozširujeme naše služby do ďalších 15 miest po celom Slovensku.',
      content: 'Detailný obsah článku o regionálnom rozšírení...',
      category: 'regionalne',
      date: '2024-12-15',
      coverImage: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
      readTime: 8,
      views: 2876,
      likes: 234,
      author: 'Expansion tím ServisAI',
      tags: ['Rozšírenie', 'Regióny', 'Nové mestá', 'Dostupnosť']
    },
    {
      id: 14,
      title: 'Špecializované služby pre seniorov: Bezbariérové riešenia',
      description: 'Nové služby zamerané na potreby starších občanov a bezbariérové úpravy.',
      content: 'Detailný obsah článku o službách pre seniorov...',
      category: 'specializovane',
      date: '2024-12-12',
      coverImage: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg',
      readTime: 13,
      views: 1543,
      likes: 167,
      author: 'Senior Care tím',
      tags: ['Seniori', 'Bezbariérové', 'Špecializované', 'Starostlivosť']
    },
    {
      id: 15,
      title: 'Oprava kritickej chyby v platobnom systéme',
      description: 'Úspešne sme vyriešili problém s platbami, ktorý ovplyvňoval niektorých používateľov.',
      content: 'Detailný obsah článku o oprave chyby...',
      category: 'opravene',
      date: '2024-12-10',
      coverImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      readTime: 4,
      views: 987,
      likes: 89,
      author: 'DevOps tím ServisAI',
      tags: ['Oprava', 'Platby', 'Bug fix', 'Systém']
    },
    {
      id: 16,
      title: 'Nové API pre vývojárov: Integrácia tretích strán',
      description: 'Spúšťame verejné API, ktoré umožní vývojárom integrovať naše služby.',
      content: 'Detailný obsah článku o novom API...',
      category: 'technologie',
      date: '2024-12-08',
      coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
      readTime: 16,
      views: 1234,
      likes: 156,
      author: 'API tím ServisAI',
      tags: ['API', 'Vývojári', 'Integrácia', 'Technológie']
    },
    {
      id: 17,
      title: 'Zákaznícke príbehy: Úspešné transformácie domovov',
      description: 'Inšpiratívne príbehy našich zákazníkov a ich úspešných domácich projektov.',
      content: 'Detailný obsah článku o zákazníckych príbehoch...',
      category: 'blog',
      date: '2024-12-05',
      coverImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      readTime: 11,
      views: 2345,
      likes: 198,
      author: 'Content tím ServisAI',
      tags: ['Zákazníci', 'Príbehy', 'Transformácie', 'Inšpirácia']
    },
    {
      id: 18,
      title: 'Budúcnosť domácich služieb: Trendy na rok 2025',
      description: 'Analýza najdôležitejších trendov, ktoré budú formovať trh domácich služieb.',
      content: 'Detailný obsah článku o budúcnosti služieb...',
      category: 'trendy',
      date: '2024-12-03',
      coverImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      readTime: 20,
      views: 3456,
      likes: 267,
      author: 'Research tím ServisAI',
      tags: ['Budúcnosť', 'Trendy', '2025', 'Analýza']
    }
  ];

  // Získanie všetkých kategórií
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(articles.map(article => article.category))];
    return cats;
  }, []);

  // Filtrovanie článkov
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'all': 'Všetky',
      'aktualizacie': 'Aktualizácie',
      'vylepsene': 'Vylepšené',
      'opravene': 'Opravené',
      'blog': 'Blog',
      'novinky': 'Novinky',
      'trendy': 'Trendy',
      'technologie': 'Technológie',
      'bezpecnost': 'Bezpečnosť',
      'sluzby': 'Služby',
      'regionalne': 'Regionálne',
      'sezonne': 'Sezónne',
      'specializovane': 'Špecializované',
      'udrzatelnost': 'Udržateľnosť',
      'partnerstva': 'Partnerstvá',
      'komunita': 'Komunita',
      'akcie': 'Akcie',
      'vzdelavanie': 'Vzdelávanie'
    };
    return categoryNames[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'aktualizacie': 'bg-blue-100 text-blue-800',
      'vylepsene': 'bg-green-100 text-green-800',
      'opravene': 'bg-red-100 text-red-800',
      'blog': 'bg-purple-100 text-purple-800',
      'novinky': 'bg-yellow-100 text-yellow-800',
      'trendy': 'bg-pink-100 text-pink-800',
      'technologie': 'bg-indigo-100 text-indigo-800',
      'bezpecnost': 'bg-orange-100 text-orange-800',
      'sluzby': 'bg-teal-100 text-teal-800',
      'regionalne': 'bg-cyan-100 text-cyan-800',
      'sezonne': 'bg-lime-100 text-lime-800',
      'specializovane': 'bg-violet-100 text-violet-800',
      'udrzatelnost': 'bg-emerald-100 text-emerald-800',
      'partnerstva': 'bg-rose-100 text-rose-800',
      'komunita': 'bg-amber-100 text-amber-800',
      'akcie': 'bg-fuchsia-100 text-fuchsia-800',
      'vzdelavanie': 'bg-sky-100 text-sky-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        {/* Article Header */}
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedArticle.category)}`}>
                {getCategoryDisplayName(selectedArticle.category)}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1>
            <div className="flex items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(selectedArticle.date).toLocaleDateString('sk-SK')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{selectedArticle.readTime} min čítania</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">
            <img
              src={selectedArticle.coverImage}
              alt={selectedArticle.title}
              className="w-full h-64 object-cover rounded-xl mb-8"
            />
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                {selectedArticle.description}
              </p>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {selectedArticle.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-start mb-6">
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Novinky a Aktualizácie
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Sledujte najnovšie vylepšenia, novinky a dôležité informácie o ServisAI platforme
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Vyhľadajte v novinkách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/80 backdrop-blur-sm shadow-lg"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center justify-center">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2 shadow-lg">
              <div className="flex flex-wrap gap-2 max-w-4xl">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                        : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {getCategoryDisplayName(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            Zobrazuje sa <span className="font-bold text-blue-600">{filteredArticles.length}</span> článkov
            {selectedCategory !== 'all' && ` v kategórii "${getCategoryDisplayName(selectedCategory)}"`}
            {searchTerm && ` pre "${searchTerm}"`}
          </p>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
              >
                {/* Image */}
                <div className="aspect-video bg-gray-200 overflow-hidden relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getCategoryColor(article.category)}`}>
                      {getCategoryDisplayName(article.category)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Bookmark size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Share2 size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.date).toLocaleDateString('sk-SK')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{article.likes}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="truncate max-w-24">{article.author}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Read More Button */}
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:gap-3">
                      Čítať článok
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 max-w-md mx-auto shadow-lg">
              <Search className="text-gray-400 mx-auto mb-6" size={64} />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Žiadne články neboli nájdené
              </h3>
              <p className="text-gray-500 mb-6">
                Skúste zmeniť vyhľadávacie kritériá alebo kategóriu
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold"
              >
                Vymazať filtre
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsPage;