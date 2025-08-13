import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  Info, 
  Calendar, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Users,
  Camera,
  FileCheck,
  MessageSquare,
  Menu,
  X,
  User
} from 'lucide-react';

interface ReferencesPageProps {
  onNavigateBack: () => void;
}

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
  date: string;
  type: 'verified' | 'sample';
  avatar?: string;
}

function ReferencesPage({ onNavigateBack }: ReferencesPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'sample'>('all');
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  // Mock data for reviews
  const reviews: Review[] = [
    {
      id: 1,
      name: 'Marek K.',
      location: 'Bratislava',
      rating: 5,
      text: 'Výborná skúsenosť s AI asistentom. Rýchlo mi našiel kvalitného vodára, ktorý vyriešil problém s potrubiami za rozumnú cenu. Escrow platba mi dala istotu.',
      service: 'Vodár',
      date: '2024-12-15',
      type: 'verified'
    },
    {
      id: 2,
      name: 'Jana S.',
      location: 'Košice',
      rating: 4,
      text: 'Potrebovala som murára na opravu balkóna. Cez platformu som dostala 3 ponuky do hodiny. Vybrala som si podľa hodnotení a ceny. Práca bola dokončená včas.',
      service: 'Murár',
      date: '2024-12-10',
      type: 'verified'
    },
    {
      id: 3,
      name: 'Peter M.',
      location: 'Žilina',
      rating: 5,
      text: 'Elektrikár prišiel už na druhý deň. Profesionálny prístup, čistá práca. Platba cez escrow bola bezpečná - peniaze sa uvoľnili až po mojom súhlase.',
      service: 'Elektrikár',
      date: '2024-12-08',
      type: 'verified'
    },
    {
      id: 4,
      name: 'Lucia T.',
      location: 'Nitra',
      rating: 4,
      text: 'AI asistent mi pomohol nájsť záhradníka pre strihanie stromov. Porovnanie ponúk bolo jednoduché. Oceňujem transparentnosť celého procesu.',
      service: 'Záhradník',
      date: '2024-12-05',
      type: 'verified'
    },
    {
      id: 5,
      name: 'Tomáš H.',
      location: 'Trnava',
      rating: 5,
      text: 'Obkladač dokončil kúpeľňu presne podľa dohody. Kvalita práce výborná, komunikácia cez platformu bezproblémová. Určite budem používať znovu.',
      service: 'Obkladač',
      date: '2024-12-01',
      type: 'verified'
    }
  ];

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    return review.type === activeTab;
  });

  const verifiedCount = reviews.length; // Všetky recenzie sú teraz overené

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-start mb-6">
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Čo hovoria používatelia
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Reálne skúsenosti našich spokojných zákazníkov
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={18} />
              Všetky ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'verified'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield size={18} />
              Overené ({verifiedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg">
              <CheckCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Zatiaľ žiadne overené referencie
              </h3>
              <p className="text-gray-500">
                Buďte medzi prvými, ktorí vyskúšajú našu službu!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-lg">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        {review.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Type Badge */}
                  <div className="relative">
                    <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      <Shield size={12} className="mr-1" />
                      Overená objednávka
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {renderStars(review.rating)}
                  </div>
                  <span className="font-semibold text-gray-700">{review.rating}/5</span>
                </div>

                {/* Review Text */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {review.service}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(review.date).toLocaleDateString('sk-SK')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Chcete reálnu skúsenosť?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Objednajte si službu s bezpečnou platbou cez escrow. Po dokončení dostanete výzvu na pridanie overenej recenzie.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={onNavigateBack}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Vyskúšať službu
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-800/30 rounded-xl max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm">
              💡 <strong>Bonus:</strong> Získajte 10% zľavu za pridanie overenej recenzie po dokončení práce.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="bg-white/50 backdrop-blur-md py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ako overujeme referencie
            </h2>
            <p className="text-lg text-gray-600">
              Transparentnosť a dôveryhodnosť sú pre nás prioritou
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Väzba na objednávku
              </h3>
              <p className="text-gray-600 text-sm">
                Recenziu môže pridať len zákazník s dokončenou a zaplatenou objednávkou
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Fotodôkazy
              </h3>
              <p className="text-gray-600 text-sm">
                Zákazníci môžu priložiť fotografie dokončenej práce ako dôkaz
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Moderácia
              </h3>
              <p className="text-gray-600 text-sm">
                Všetky recenzie prechádzajú kontrolou pred zverejnením
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferencesPage;