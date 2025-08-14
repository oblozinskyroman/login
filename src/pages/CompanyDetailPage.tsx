import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  Calendar,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Building2,
  Award,
  Users,
  ThumbsUp,
  Eye,
  Share2,
  Bookmark,
  ExternalLink,
  FileText
} from 'lucide-react';
import { supabase, type Company } from '../lib/supabase';
import StarRating from '../components/StarRating';

interface CompanyDetailPageProps {
  companyId: string;
  onNavigateBack: () => void;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

function CompanyDetailPage({ companyId, onNavigateBack }: CompanyDetailPageProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'gallery'>('overview');

  useEffect(() => {
    loadCompanyDetail();
  }, [companyId]);

  const loadCompanyDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies_with_rating')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        throw companyError;
      }

      setCompany(companyData);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          rating,
          comment,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }

    } catch (error: any) {
      console.error('Error loading company detail:', error);
      setError(error.message || 'Chyba pri načítavaní detailov firmy');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={index < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chyba pri načítavaní
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Firma nebola nájdená'}
              </p>
              <button
                onClick={onNavigateBack}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Späť na zoznam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-2xl font-bold">Detail firmy</h1>
          </div>
        </div>
      </div>

      {/* Company Header */}
      <div className="bg-white/70 backdrop-blur-md shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                {/* Logo */}
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {company?.logo_url ? (
                    <img 
                      src={company?.logo_url} 
                      alt={`${company?.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-3xl">
                      {company?.name?.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-gray-800">{company?.name}</h2>
                    {company?.status === 'approved' && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Shield size={16} />
                        Overená
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    {company?.average_rating && company?.review_count && company?.review_count > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating value={company?.average_rating} />
                        <span className="text-lg font-semibold text-gray-700">
                          {company?.average_rating?.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({company?.review_count} {company?.review_count === 1 ? 'hodnotenie' : 'hodnotení'})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <Star className="text-gray-300 mr-2" size={20} />
                        <span>Bez hodnotenia</span>
                      </div>
                    )}
                  </div>

                  {/* Location and Date */}
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    {company?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {company?.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Registrovaná {formatDate(company?.created_at || '')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Služby</h3>
                <div className="flex flex-wrap gap-2">
                  {(company?.services ?? []).map((service, index) => (
                    <span
                      key={`${service}-${index}`}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Kontakt</h3>
                
                <div className="space-y-3 mb-6">
                  {company?.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={18} />
                      <span className="break-all">{company?.email}</span>
                    </div>
                  )}
                  {company?.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={18} />
                      <span>{company?.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2">
                    <MessageSquare size={18} />
                    Poslať správu
                  </button>
                  
                  {company?.phone && (
                    <a
                      href={`tel:${company?.phone}`}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <Phone size={18} />
                      Zavolať
                    </a>
                  )}
                  
                  {company?.email && (
                    <a
                      href={`mailto:${company?.email}`}
                      className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <Mail size={18} />
                      E-mail
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 size={18} />
              Prehľad
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star size={18} />
              Hodnotenia ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye size={18} />
              Galéria
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">O firme</h3>
            
            {company?.description ? (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {company?.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-500">Popis firmy nie je k dispozícii.</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-800">Registrovaná</h4>
                <p className="text-gray-600">{formatDate(company?.created_at || '')}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="text-green-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-800">Hodnotenie</h4>
                <p className="text-gray-600">
                  {company?.average_rating ? `${company?.average_rating?.toFixed(1)}/5` : 'Bez hodnotenia'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="text-purple-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-800">Recenzie</h4>
                <p className="text-gray-600">{reviews.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {review?.profiles?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {review?.profiles?.full_name || 'Anonymný používateľ'}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(review?.created_at || '')}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <StarRating value={review?.rating} />
                        <span className="font-semibold text-gray-700">{review?.rating}/5</span>
                      </div>
                      
                      {review?.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review?.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg text-center">
                <Star className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Zatiaľ žiadne hodnotenia
                </h3>
                <p className="text-gray-500">
                  Buďte prvý, kto ohodnotí túto firmu!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg text-center">
            <Eye className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Galéria nie je k dispozícii
            </h3>
            <p className="text-gray-500">
              Táto funkcia bude pridaná v budúcnosti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyDetailPage;