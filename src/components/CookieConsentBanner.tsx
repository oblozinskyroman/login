import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Eye, Settings } from 'lucide-react';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Skontroluj, či už používateľ súhlasil s cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Zobraz banner po krátkom oneskorení pre lepší UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Cookie className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Súhlas s cookies</h3>
                    <p className="text-blue-100 text-sm">Rešpektujeme vaše súkromie</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  Používame cookies na zlepšenie vašej používateľskej skúsenosti, analýzu návštevnosti 
                  a personalizáciu obsahu. Vaše údaje sú v bezpečí a nikdy ich nezdieľame s tretími stranami 
                  bez vášho súhlasu.
                </p>

                {/* Cookie Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="text-green-600" size={18} />
                      <span className="font-semibold text-green-800">Nevyhnutné</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Potrebné pre základné fungovanie stránky
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-800">Analytické</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Pomáhajú nám pochopiť, ako používate stránku
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="text-purple-600" size={18} />
                      <span className="font-semibold text-purple-800">Funkčné</span>
                    </div>
                    <p className="text-purple-700 text-sm">
                      Zapamätávajú si vaše preferencie
                    </p>
                  </div>
                </div>

                {/* Detailed Information */}
                {showDetails && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Detailné informácie o cookies:</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <strong>Nevyhnutné cookies:</strong> Zabezpečujú základné funkcie ako prihlásenie, 
                        bezpečnosť a navigáciu. Tieto cookies nemožno vypnúť.
                      </div>
                      <div>
                        <strong>Analytické cookies:</strong> Google Analytics nám pomáha pochopiť, 
                        ako návštevníci používajú našu stránku. Údaje sú anonymizované.
                      </div>
                      <div>
                        <strong>Funkčné cookies:</strong> Zapamätávajú si vaše preferencie ako jazyk, 
                        región a nastavenia rozhrania.
                      </div>
                      <div>
                        <strong>Doba uchovávania:</strong> Väčšina cookies sa automaticky vymaže po 1 roku. 
                        Môžete ich kedykoľvek vymazať v nastaveniach prehliadača.
                      </div>
                    </div>
                  </div>
                )}

                {/* Toggle Details */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline mb-4"
                >
                  {showDetails ? 'Skryť detaily' : 'Zobraziť detaily'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptCookies}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-base flex items-center justify-center gap-2"
                >
                  <Shield size={18} />
                  Prijať všetky cookies
                </button>
                
                <button
                  onClick={rejectCookies}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-base flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Odmietnuť voliteľné
                </button>
              </div>

              {/* Legal Links */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 justify-center">
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Zásady ochrany súkromia
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Podmienky používania
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Nastavenia cookies
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsentBanner;