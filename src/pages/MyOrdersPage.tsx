import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  RefreshCw,
  ExternalLink,
  Shield,
  XCircle,
  FileText
} from 'lucide-react';
import { EscrowService, type Order, type OrderStatus } from '../lib/escrow';
import { supabase } from '../lib/supabase';

interface MyOrdersPageProps {
  onNavigateBack: () => void;
}

function MyOrdersPage({ onNavigateBack }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Musíte byť prihlásený pre zobrazenie objednávok');
      }

      setCurrentUser(user);

      // Load user's orders
      const userOrders = await EscrowService.getUserOrders(user.id);
      setOrders(userOrders);

    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Chyba pri načítavaní objednávok');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId: string) => {
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      
      const { url } = await EscrowService.createCheckoutSession(orderId);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(`Chyba pri platbe: ${err.message}`);
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!confirm('Ste si istý, že chcete potvrdiť dokončenie práce? Táto akcia je nevratná.')) {
      return;
    }

    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      
      await EscrowService.releaseEscrowFunds(orderId);
      
      // Refresh orders to show updated status
      await loadUserAndOrders();
      
      alert('Práca bola úspešne potvrdená ako dokončená!');
      
    } catch (err: any) {
      console.error('Complete order error:', err);
      alert(`Chyba pri potvrdení dokončenia: ${err.message}`);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getOrderTitle = (order: Order) => {
    if (order.inquiry_id) {
      return `Objednávka pre dopyt ${order.inquiry_id.slice(0, 8)}...`;
    }
    return `Objednávka ${order.id.slice(0, 8)}...`;
  };

  const isCustomer = (order: Order) => {
    return currentUser && order.customer_id === currentUser.id;
  };

  const isProvider = (order: Order) => {
    return currentUser && order.provider_id === currentUser.id;
  };

  const getOrderActions = (order: Order) => {
    const isProcessing = processingOrders.has(order.id);
    
    if (order.status === 'pending_payment' && isCustomer(order)) {
      return (
        <button
          onClick={() => handlePayment(order.id)}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Spracováva sa...
            </>
          ) : (
            <>
              <CreditCard size={16} />
              Zaplatit
            </>
          )}
        </button>
      );
    }

    if (order.status === 'funds_held' && isCustomer(order)) {
      return (
        <button
          onClick={() => handleCompleteOrder(order.id)}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Spracováva sa...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Potvrdiť dokončenie
            </>
          )}
        </button>
      );
    }

    return null;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="text-yellow-600" size={20} />;
      case 'funds_held':
        return <Shield className="text-blue-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
      case 'disputed':
        return <XCircle className="text-red-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-gray-600" size={20} />;
      case 'refunded':
        return <RefreshCw className="text-purple-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Načítavam objednávky...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-16">
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
              <DollarSign className="text-white" size={32} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Moje objednávky
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Spravujte svoje platby a objednávky s bezpečným Escrow systémom
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Chyba</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={loadUserAndOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Skúsiť znovu
            </button>
          </div>
        )}

        {/* Orders List */}
        {!error && (
          <>
            {/* Summary */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{orders.length}</h3>
                <p className="text-gray-600">Celkom objednávok</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === 'pending_payment').length}
                </h3>
                <p className="text-gray-600">Čaká na platbu</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === 'funds_held').length}
                </h3>
                <p className="text-gray-600">V úschove</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-center">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === 'completed').length}
                </h3>
                <p className="text-gray-600">Dokončené</p>
              </div>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                  <DollarSign className="text-gray-400 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Žiadne objednávky
                  </h3>
                  <p className="text-gray-500">
                    Zatiaľ nemáte žiadne objednávky v systéme.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {getOrderTitle(order)}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <DollarSign size={14} />
                                <span className="font-semibold">
                                  {EscrowService.formatAmount(order.amount, order.currency)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(order.created_at).toLocaleDateString('sk-SK')}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {isCustomer(order) ? (
                                  <>
                                    <Building2 size={14} />
                                    <span>Ste zákazník</span>
                                  </>
                                ) : (
                                  <>
                                    <User size={14} />
                                    <span>Ste poskytovateľ</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${EscrowService.getStatusColor(order.status)}`}>
                                {EscrowService.getStatusLabel(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {getOrderActions(order)}
                      </div>
                    </div>

                    {/* Additional Info for specific statuses */}
                    {order.status === 'funds_held' && isProvider(order) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Shield size={16} />
                          <span className="font-medium">Prostriedky sú v úschove</span>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                          Zákazník musí potvrdiť dokončenie práce pred uvoľnením platby.
                        </p>
                      </div>
                    )}

                    {order.status === 'pending_payment' && isProvider(order) && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Clock size={16} />
                          <span className="font-medium">Čaká sa na platbu zákazníka</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Zákazník ešte nezaplatil za túto objednávku.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;