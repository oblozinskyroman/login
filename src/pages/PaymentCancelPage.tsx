import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  ArrowLeft, 
  DollarSign, 
  RefreshCw,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { EscrowService, type Order } from '../lib/escrow';

interface PaymentCancelPageProps {
  onNavigateBack: () => void;
  onNavigateToMyOrders: () => void;
}

function PaymentCancelPage({ onNavigateBack, onNavigateToMyOrders }: PaymentCancelPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState(false);

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

  const handleRetryPayment = async () => {
    if (!order) return;

    try {
      setRetryingPayment(true);
      
      const { url } = await EscrowService.createCheckoutSession(order.id);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (err: any) {
      console.error('Retry payment error:', err);
      alert(`Chyba pri opakovaní platby: ${err.message}`);
      setRetryingPayment(false);
    }
  };

  const getOrderTitle = (order: Order) => {
    if (order.inquiry_id) {
      return `Objednávka pre dopyt ${order.inquiry_id.slice(0, 8)}...`;
    }
    return `Objednávka ${order.id.slice(0, 8)}...`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-24">
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
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <XCircle className="text-white" size={48} />
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight">
              Platba zrušená
            </h1>
            <p className="text-2xl md:text-3xl text-orange-100 max-w-4xl mx-auto leading-relaxed font-light">
              Vaša platba bola zrušená. Žiadne poplatky neboli účtované.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Message */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-10 shadow-xl mb-12 border border-orange-200">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl mr-6 shadow-lg">
                <XCircle className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-orange-800 mb-2">Platba bola zrušená</h2>
                <p className="text-orange-700 text-lg font-medium">Žiadne poplatky neboli z vašej karty strhnuté</p>
              </div>
            </div>

            <div className="bg-white/70 rounded-2xl p-6 mb-8 shadow-inner">
              <h3 className="font-bold text-orange-800 mb-4 text-lg">Čo sa stalo:</h3>
              <ul className="text-orange-700 space-y-2 text-base">
                <li>❌ Platba bola zrušená pred dokončením</li>
                <li>✅ Žiadne poplatky neboli účtované</li>
                <li>⏳ Objednávka zostáva v stave "Čaká na platbu"</li>
                <li>🔄 Môžete skúsiť platbu znovu kedykoľvek</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-inner">
              <div className="flex items-center gap-3 text-blue-800 mb-3">
                <CreditCard size={20} />
                <span className="font-bold text-lg">Chcete skúsiť znovu?</span>
              </div>
              <p className="text-blue-700 text-base">
                Vaša objednávka je stále aktívna. Môžete dokončiť platbu kedykoľvek 
                kliknutím na tlačidlo "Skúsiť platbu znovu" nižšie.
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-xl mb-12 border border-white/20">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-8">Detaily objednávky</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-lg">Objednávka:</span>
                <span className="font-bold text-gray-800 text-lg">{getOrderTitle(order)}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-lg">Suma:</span>
                <span className="font-extrabold text-gray-800 text-2xl text-orange-600">
                  {EscrowService.formatAmount(order.amount, order.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-lg">Stav:</span>
                <span className={`px-4 py-2 rounded-full text-base font-bold ${EscrowService.getStatusColor(order.status)}`}>
                  {EscrowService.getStatusLabel(order.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <span className="text-gray-600 text-lg">Dátum vytvorenia:</span>
                <span className="font-bold text-gray-800 text-lg">
                  {new Date(order.created_at).toLocaleDateString('sk-SK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Possible Reasons */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-xl mb-12 border border-white/20">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-8">Možné dôvody zrušenia</h3>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">Klikli ste na tlačidlo "Späť" alebo "Zrušiť" v platobnom rozhraní</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">Zatvorili ste okno prehliadača počas platby</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">Platobná session vypršala (po 24 hodinách)</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">Rozhodli ste sa neuskutočniť platbu</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6">
            {order.status === 'pending_payment' && (
              <button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-5 px-8 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {retryingPayment ? (
                  <>
                    <RefreshCw className="animate-spin" size={24} />
                    Spracováva sa...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    Skúsiť platbu znovu
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onNavigateToMyOrders}
              className="flex-1 bg-gray-600 text-white py-5 px-8 rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-xl flex items-center justify-center gap-3"
            >
              <DollarSign size={24} />
              Moje objednávky
            </button>
            
            <button
              onClick={onNavigateBack}
              className="flex-1 bg-gray-600 text-white py-5 px-8 rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-xl flex items-center justify-center gap-3"
            >
              <ArrowLeft size={24} />
              Späť na hlavnú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelPage;