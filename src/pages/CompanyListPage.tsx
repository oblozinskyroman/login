import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Euro, 
  Calendar,
  ArrowLeft,
  Grid3X3,
  Map,
  ChevronDown,
  X,
  Verified,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { supabase, type Company } from '../lib/supabase';
import StarRating from '../components/StarRating';

interface CompanyListPageProps {
  selectedService?: string;
  onNavigateBack: () => void;
  onNavigateToCompanyDetail: (companyId: string) => void;
}

function CompanyListPage({ selectedService, onNavigateBack, onNavigateToCompanyDetail }: CompanyListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Supabase state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);

  // Load companies from Supabase
  useEffect(() => {
    loadCompanies();
  }, [selectedService]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setErrorCompanies(null);

      let query = supabase
        .from('companies_with_rating')
        .select('*')
        .eq('status', 'approved') // Only show approved companies
        .order('created_at', { ascending: false });

      // Filter by selected service if provided
      if (selectedService) {
        query = query.contains('services', [selectedService]);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setErrorCompanies(error.message || 'Chyba pri načítavaní firiem');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const quickFilters = [
    { id: 'verified', label: 'Overené', icon: Shield },
    { id: 'rating-4plus', label: '★ 4+', icon: Star },
    { id: 'today', label: 'Dnes', icon: Calendar },
    { id: 'escrow', label: 'Escrow', icon: Shield },
    { id: 'budget-50', label: 'Do 50 €', icon: Euro }
  ];

  const sortOptions = [
    { value: 'best-match', label: 'Najlepšie pre mňa (AI)' },
    { value: 'rating', label: 'Hodnotenie' },
    { value: 'price', label: 'Cena' },
    { value: 'response-time', label: 'Rýchlosť reakcie' },
    { value: 'distance', label: 'Vzdialenosť' }
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filterId));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {selectedService ? `${selectedService} - Zoznam firiem` : 'Všetky služby'}
          </h1>
          <p className="text-xl text-blue-100">
            Nájdite si overených odborníkov vo vašom okolí
          </p>
        </div>
      </div>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-16 bg-white/90 backdrop-blur-md border-b shadow-sm z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať firmy..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = activeFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent size={16} />
                    {filter.label}
                  </button>
                );
              })}
              
              {/* More Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              >
                <Filter size={16} />
                Viac filtrov
              </button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {!!activeFilters.length && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {activeFilters.map((filterId) => {
                const filter = quickFilters.find(f => f.id === filterId);
                return (
                  <div
                    key={filterId}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {filter?.label}
                    <button
                      onClick={() => removeFilter(filterId)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Vymazať všetko
              </button>
            </div>
          )}

          {/* Results Summary (upravené – bez zbytočného wrapperu) */}
          <p className="mt-3 pt-3 border-t text-gray-600 text-sm">
            {loadingCompanies ? (
              'Načítavam firmy...'
            ) : (
              <>
                Zodpovedá <span className="font-semibold">{companies.length} firmám</span> •{' '}
              </>
            )}
            priem. odpoveď <span className="font-semibold">23 min</span>
          </p>
        </div>
      </div>

      {/* Sort and View Controls */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
              Zoznam
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map size={16} />
              Mapa
            </button>
          </div>
        </div>
      </div>

      {/* Company List */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Loading State */}
        {loadingCompanies && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {errorCompanies && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chyba pri načítavaní
              </h3>
              <p className="text-gray-600 mb-4">
                {errorCompanies}
              </p>
              <button
                onClick={loadCompanies}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Skúsiť znovu
              </button>
            </div>
          </div>
        )}

        {/* No Companies State */}
        {!loadingCompanies && !errorCompanies && companies.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Shield className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Žiadne firmy
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedService 
                  ? `Zatiaľ nie sú registrované žiadne firmy pre službu "${selectedService}"`
                  : 'Zatiaľ nie sú registrované žiadne firmy'
                }
              </p>
            </div>
          </div>
        )}

        {!loadingCompanies && !errorCompanies && companies.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => onNavigateToCompanyDetail(company.id)}
                className="flex flex-col h-full rounded-2xl shadow p-5 bg-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Hlavička */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold break-words">{company.name}</h3>
                  </div>
                  {company.status === 'approved' && (
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Overená
                    </span>
                  )}
                </div>

                {/* Rating / Nová firma */}
                <div className="mt-2 flex items-center gap-2">
                  {company.average_rating && company.review_count && company.review_count > 0 ? (
                    <>
                      <StarRating value={company.average_rating} />
                      <span className="text-xs text-gray-500">{company.average_rating.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Nová firma
                    </span>
                  )}
                </div>

                {/* Location */}
                {company.location && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    <span>{company.location}</span>
                  </div>
                )}

                {/* Popis */}
                {company.description && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                    {company.description}
                  </p>
                )}

                {/* Tagy – konzistentná výška */}
                <div className="mt-3 min-h-8 flex flex-wrap gap-2">
                  {(company.services ?? []).map((service, index) => (
                    <span key={`${service}-${index}`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>

                {/* CTA naspodku */}
                <div className="mt-auto pt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <button className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                    Kontaktovať
                  </button>
                  
                  {company.phone && (
                    <a href={`tel:${company.phone}`} className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700">
                      Tel.
                    </a>
                  )}
                  {company.email && (
                    <a href={`mailto:${company.email}`} className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700">
                      Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pokročilé filtre</h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Advanced Filter Content - Placeholder */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cenový rozsah (€/hod)
                  </label>
                  <div className="bg-gray-100 h-12 rounded-lg flex items-center justify-center text-gray-500">
                    Slider placeholder
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesto/Okres
                  </label>
                  <input
                    type="text"
                    placeholder="Zadajte mesto alebo okres"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategórie služieb
                  </label>
                  <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-500">
                    Multi-select placeholder
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                {/* odstránené nefunkčné tlačidlo Vymazať */}
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Použiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyListPage;
