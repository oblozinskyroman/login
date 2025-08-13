import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Globe,
  Calendar,
  Menu,
  X
} from 'lucide-react';

interface ContactPageProps {
  onNavigateBack: () => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactPage({ onNavigateBack }: ContactPageProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement actual form submission
      console.log('Odosielanie správy:', formData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Chyba pri odosielaní správy:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
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
            <MessageSquare className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Kontakt
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Máte otázky? Radi vám pomôžeme. Kontaktujte nás kedykoľvek.
          </p>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Kontaktné informácie
              </h2>
            </div>

            {/* Owner Information */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Majiteľ</h3>
                  <p className="text-gray-600">Zakladateľ a CEO</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-800">Roman Oblozinsky</p>
            </div>

            {/* Email */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">E-mail</h3>
                  <p className="text-gray-600">Napíšte nám kedykoľvek</p>
                </div>
              </div>
              <a 
                href="mailto:info@zrovnaj.sk"
                className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                info@zrovnaj.sk
              </a>
            </div>

            {/* Placeholder sections for future information */}
            <div className="space-y-6">
              {/* Phone - Placeholder */}
              <div className="bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl mr-4">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Telefón</h3>
                    <p className="text-gray-600">Bude doplnený</p>
                  </div>
                </div>
                <p className="text-gray-500 italic">Telefónne číslo bude doplnené</p>
              </div>

              {/* Address - Placeholder */}
              <div className="bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl mr-4">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Adresa</h3>
                    <p className="text-gray-600">Bude doplnená</p>
                  </div>
                </div>
                <p className="text-gray-500 italic">Adresa sídla bude doplnená</p>
              </div>

              {/* Business Hours - Placeholder */}
              <div className="bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 rounded-xl mr-4">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Pracovné hodiny</h3>
                    <p className="text-gray-600">Budú doplnené</p>
                  </div>
                </div>
                <p className="text-gray-500 italic">Pracovné hodiny budú doplnené</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Napíšte nám
            </h2>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3" size={20} />
                  <div>
                    <h4 className="font-semibold text-green-800">Správa odoslaná!</h4>
                    <p className="text-green-700 text-sm">Odpovieme vám čo najskôr.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-3" size={20} />
                  <div>
                    <h4 className="font-semibold text-red-800">Chyba pri odosielaní</h4>
                    <p className="text-red-700 text-sm">Skúste to prosím znovu alebo nás kontaktujte e-mailom.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meno *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Vaše meno"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vas@email.sk"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Predmet *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Predmet správy"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Správa *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Napíšte vašu správu..."
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Odosielam...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Odoslať správu
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                * Povinné polia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white/50 backdrop-blur-md py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ďalšie informácie
            </h2>
            <p className="text-lg text-gray-600">
              Tieto informácie budú doplnené v budúcnosti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info - Placeholder */}
            <div className="text-center bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
              <div className="bg-gradient-to-r from-slate-500 to-gray-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Firemné údaje
              </h3>
              <p className="text-gray-500 text-sm italic">
                IČO, DIČ a ďalšie údaje budú doplnené
              </p>
            </div>

            {/* Social Media - Placeholder */}
            <div className="text-center bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sociálne siete
              </h3>
              <p className="text-gray-500 text-sm italic">
                Odkazy na sociálne siete budú doplnené
              </p>
            </div>

            {/* Meeting - Placeholder */}
            <div className="text-center bg-gray-100/70 backdrop-blur-md rounded-2xl p-6 shadow-lg opacity-60">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Osobné stretnutie
              </h3>
              <p className="text-gray-500 text-sm italic">
                Možnosť dohodnutia stretnutia bude doplnená
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;