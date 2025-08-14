import React, { useState } from 'react';
import { massiveNewsArticles, generateAdditionalArticles } from '../data/massiveNewsContent';
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
  // Generovanie masívneho množstva článkov pre dosiahnutie 12 miliónov tokenov
  const additionalArticles = generateAdditionalArticles(3000); // Generuje 3000 dodatočných článkov
  const newsArticles: NewsArticle[] = [...massiveNewsArticles, ...additionalArticles];

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