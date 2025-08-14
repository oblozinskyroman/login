import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Shield,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { EscrowService, type Order } from '../lib/escrow';

interface PaymentSuccessPageProps {
  onNavigateBack: () => void;
  onNavigateToMyOrders: () => void;
}

function PaymentSuccessPage({ onNavigateBack, onNavigateToMyOrders }: PaymentSuccessPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderFromUrl();
  }, []);

  const loadOrderFromUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get order ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order');

      if (!orderId) {
        throw new Error('ID objednávky nebolo nájdené v URL');
      }

      // Load order details
      const orderData = await EscrowService.getOrder(orderId);
      
      if (!orderData) {
        throw new Error('Objednávka nebola nájdená');
      }

      setOrder(orderData);

    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.message || 'Chyba pri načítavaní objednávky');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Načítavam detaily objednávky...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chyba pri načítavaní
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Objednávka nebola nájdená'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onNavigateBack}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Späť
                </button>
                <button
                  onClick={loadOrderFromUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Skúsiť znovu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getOrderTitle = (order: Order) => {
    if (order.inquiry_id) {
      return `Objednávka pre dopyt ${order.inquiry_id.slice(0, 8)}...`;
    }
    return `Objednávka ${order.id.slice(0, 8)}...`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Platba úspešná!
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Vaša platba bola úspešne spracovaná a prostriedky sú teraz v bezpečnej úschove
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg mb-8 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Platba bola úspešná</h2>
                <p className="text-green-700">Prostriedky sú teraz v bezpečnej úschove</p>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Čo sa stalo:</h3>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>✅ Vaša platba bola úspešne spracovaná</li>
                <li>✅ Prostriedky sú držané v bezpečnej úschove (Escrow)</li>
                <li>✅ Poskytovateľ služby bol informovaný o platbe</li>
                <li>✅ Môžete sledovať stav objednávky v sekcii "Moje objednávky"</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Shield size={16} />
                <span className="font-medium">Ako funguje Escrow systém?</span>
              </div>
              <p className="text-blue-700 text-sm">
                Vaše peniaze sú v bezpečí. Poskytovateľ služby ich dostane až po tom, 
                ako potvrdíte, že práca bola dokončená k vašej spokojnosti.
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Detaily objednávky</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Objednávka:</span>
                <span className="font-semibold text-gray-800">{getOrderTitle(order)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Suma:</span>
                <span className="font-semibold text-gray-800 text-lg">
                  {EscrowService.formatAmount(order.amount, order.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Stav:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${EscrowService.getStatusColor(order.status)}`}>
                  {EscrowService.getStatusLabel(order.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Dátum vytvorenia:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(order.created_at).toLocaleDateString('sk-SK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {order.payment_intent_id && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">ID platby:</span>
                  <span className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                    {order.payment_intent_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Ďalšie kroky</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                  <span className="font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Poskytovateľ začne prácu</h4>
                  <p className="text-gray-600 text-sm">
                    Poskytovateľ služby bol informovaný o platbe a môže začať s prácou.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                  <span className="font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Sledujte pokrok</h4>
                  <p className="text-gray-600 text-sm">
                    Komunikujte s poskytovateľom a sledujte pokrok práce.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 rounded-full p-2 flex-shrink-0">
                  <span className="font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Potvrďte dokončenie</h4>
                  <p className="text-gray-600 text-sm">
                    Po dokončení práce potvrďte v sekcii "Moje objednávky", že ste spokojný.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onNavigateToMyOrders}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <DollarSign size={20} />
              Moje objednávky
            </button>
            
            <button
              onClick={onNavigateBack}
              className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Späť na hlavnú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;