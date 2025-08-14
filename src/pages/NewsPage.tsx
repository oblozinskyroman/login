import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, Eye, Heart, User, Calendar } from 'lucide-react';
import { massiveNewsArticles } from '../data/massiveNewsContent';

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Získanie všetkých kategórií
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(massiveNewsArticles.map(article => article.category))];
    return cats;
  }, []);

  // Filtrovanie článkov
  const filteredArticles = useMemo(() => {
    return massiveNewsArticles.filter(article => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Novinky a Aktualizácie
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sledujte najnovšie vylepšenia, novinky a dôležité informácie o ServisAI platforme
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vyhľadávanie a filtre */}
        <div className="mb-8 space-y-4">
          {/* Vyhľadávanie */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Vyhľadajte v novinkách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Kategórie */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="text-gray-400 w-5 h-5 flex-shrink-0" />
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Počet výsledkov */}
        <div className="mb-6">
          <p className="text-gray-600">
            Zobrazuje sa {filteredArticles.length} článkov
            {selectedCategory !== 'all' && ` v kategórii "${getCategoryDisplayName(selectedCategory)}"`}
            {searchTerm && ` pre "${searchTerm}"`}
          </p>
        </div>

        {/* Zoznam článkov */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map(article => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Obrázok */}
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Obsah */}
              <div className="p-6">
                {/* Kategória */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {getCategoryDisplayName(article.category)}
                  </span>
                </div>

                {/* Nadpis */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                  {article.title}
                </h2>

                {/* Popis */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.description}
                </p>

                {/* Meta informácie */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString('sk-SK')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                </div>

                {/* Štatistiky */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{article.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                </div>

                {/* Tagy */}
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

                {/* Tlačidlo na čítanie */}
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Čítať článok
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Žiadne výsledky */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Žiadne články neboli nájdené
            </h3>
            <p className="text-gray-600">
              Skúste zmeniť vyhľadávacie kritériá alebo kategóriu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;