import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  PlayCircle, 
  User, 
  CreditCard, 
  Building2, 
  MessageCircle, 
  Star, 
  Lock, 
  Wrench,
  TrendingUp,
  MessageSquare,
  FileText,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Clock,
  Eye,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface HelpCenterPageProps {
  onNavigateBack: () => void;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  articleCount: number;
}

interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  readTime: number;
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
}

function HelpCenterPage({ onNavigateBack }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articleFeedback, setArticleFeedback] = useState<{[key: number]: 'helpful' | 'not-helpful' | null}>({});

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Začíname',
      description: 'Prvé kroky s platformou ServisAI',
      icon: PlayCircle,
      color: 'from-green-500 to-emerald-600',
      articleCount: 8
    },
    {
      id: 'account',
      title: 'Účet',
      description: 'Správa profilu a nastavení',
      icon: User,
      color: 'from-blue-500 to-cyan-600',
      articleCount: 12
    },
    {
      id: 'payments-escrow',
      title: 'Platby & Escrow',
      description: 'Bezpečné platby a escrow systém',
      icon: CreditCard,
      color: 'from-purple-500 to-indigo-600',
      articleCount: 15
    },
    {
      id: 'companies',
      title: 'Firmy',
      description: 'Registrácia a správa firiem',
      icon: Building2,
      color: 'from-orange-500 to-red-600',
      articleCount: 10
    },
    {
      id: 'requests',
      title: 'Dopyty',
      description: 'Zadávanie a správa dopytov',
      icon: MessageCircle,
      color: 'from-teal-500 to-cyan-600',
      articleCount: 9
    },
    {
      id: 'reviews',
      title: 'Hodnotenia',
      description: 'Recenzie a hodnotenia služieb',
      icon: Star,
      color: 'from-yellow-500 to-amber-600',
      articleCount: 6
    },
    {
      id: 'security',
      title: 'Bezpečnosť',
      description: 'Ochrana údajov a bezpečnosť',
      icon: Lock,
      color: 'from-red-500 to-pink-600',
      articleCount: 7
    },
    {
      id: 'technical',
      title: 'Technické',
      description: 'Riešenie technických problémov',
      icon: Wrench,
      color: 'from-gray-500 to-slate-600',
      articleCount: 11
    }
  ];

  const topArticles: Article[] = [
    {
      id: 1,
      title: 'Ako funguje escrow platba?',
      description: 'Kompletný sprievodca bezpečnými platbami cez escrow systém',
      category: 'payments-escrow',
      readTime: 4,
      views: 2847,
      helpful: 156,
      notHelpful: 8,
      lastUpdated: '2025-01-10'
    },
    {
      id: 2,
      title: 'Prvé kroky po registrácii',
      description: 'Čo robiť po vytvorení účtu - nastavenie profilu a prvý dopyt',
      category: 'getting-started',
      readTime: 3,
      views: 1923,
      helpful: 134,
      notHelpful: 12,
      lastUpdated: '2025-01-08'
    },
    {
      id: 3,
      title: 'Ako vybrať správnu firmu?',
      description: 'Tipy na výber kvalitného odborníka na základe hodnotení a referencií',
      category: 'requests',
      readTime: 5,
      views: 1654,
      helpful: 98,
      notHelpful: 5,
      lastUpdated: '2025-01-05'
    },
    {
      id: 4,
      title: 'Registrácia firmy krok za krokom',
      description: 'Podrobný návod na pridanie vašej firmy do zoznamu',
      category: 'companies',
      readTime: 6,
      views: 1432,
      helpful: 87,
      notHelpful: 9,
      lastUpdated: '2025-01-03'
    },
    {
      id: 5,
      title: 'Čo robiť, ak sa firma neozýva?',
      description: 'Riešenie situácií, keď firma nereaguje na váš dopyt',
      category: 'requests',
      readTime: 3,
      views: 1289,
      helpful: 76,
      notHelpful: 14,
      lastUpdated: '2024-12-28'
    },
    {
      id: 6,
      title: 'Ako napísať dobrú recenziu?',
      description: 'Sprievodca písaním užitočných hodnotení pre ostatných používateľov',
      category: 'reviews',
      readTime: 4,
      views: 1156,
      helpful: 65,
      notHelpful: 7,
      lastUpdated: '2024-12-25'
    }
  ];

  const handleArticleFeedback = (articleId: number, feedback: 'helpful' | 'not-helpful') => {
    setArticleFeedback(prev => ({
      ...prev,
      [articleId]: prev[articleId] === feedback ? null : feedback
    }));
    
    // TODO: Send feedback to backend
    console.log(`Article ${articleId} marked as ${feedback}`);
  };

  const getCategoryByTitle = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const filteredArticles = topArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section with Search */}
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
            <HelpCircle className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Centrum pomoci
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-12">
            Nájdite odpovede na vaše otázky rýchlo a jednoducho
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Napíš, s čím potrebuješ pomôcť..."
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Kategórie pomoci</h2>
          <p className="text-lg text-gray-600">Vyberte si kategóriu, ktorá vás zaujíma</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/70' : ''
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-center text-sm mb-3">
                  {category.description}
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {category.articleCount} článkov
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Category Filter */}
        {selectedCategory && (
          <div className="text-center mt-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700"
            >
              Zobraziť všetky kategórie
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Top Articles Section */}
      <div className="bg-white/50 backdrop-blur-md py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="text-orange-600" size={28} />
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedCategory ? `Články - ${getCategoryByTitle(selectedCategory)?.title}` : 'Najčítanejšie články'}
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              {selectedCategory 
                ? `Najužitočnejšie články z kategórie ${getCategoryByTitle(selectedCategory)?.title}`
                : 'Najužitočnejšie články podľa našich používateľov'
              }
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => {
              const category = getCategoryByTitle(article.category);
              const userFeedback = articleFeedback[article.id];
              
              return (
                <div
                  key={article.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Article Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category ? `bg-gradient-to-r ${category.color} text-white` : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category?.title || 'Všeobecné'}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {article.readTime} min
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {article.views.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp size={14} className="mr-1" />
                        {article.helpful}
                      </div>
                    </div>
                    <span className="text-xs">
                      {new Date(article.lastUpdated).toLocaleDateString('sk-SK')}
                    </span>
                  </div>

                  {/* Feedback Buttons */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Bol tento článok užitočný?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleArticleFeedback(article.id, 'helpful')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          userFeedback === 'helpful'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        <ThumbsUp size={16} />
                        Áno
                      </button>
                      <button
                        onClick={() => handleArticleFeedback(article.id, 'not-helpful')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          userFeedback === 'not-helpful'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <ThumbsDown size={16} />
                        Nie
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
                <Search className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Žiadne výsledky
                </h3>
                <p className="text-gray-500 mb-4">
                  Skúste zmeniť vyhľadávací výraz alebo kategóriu
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Vymazať filtre
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section - Still Need Help */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stále potrebuješ pomoc?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Ak si nenašiel odpoveď na svoju otázku, kontaktuj nás priamo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <MessageSquare size={20} />
              Spustiť chat
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <FileText size={20} />
              Vytvoriť ticket
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-800/30 rounded-xl max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm">
              💡 <strong>Tip:</strong> Pred vytvorením ticketu skús vyhľadať podobnú otázku vyššie - možno už máme odpoveď!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenterPage;