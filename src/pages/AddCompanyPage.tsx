import React, { useState } from 'react';
import { submitProvider, type ProviderForm } from '../lib/submitProvider';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload,
  Tag,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  User
} from 'lucide-react';

interface AddCompanyPageProps {
  onNavigateBack: () => void;
}

function AddCompanyPage({ onNavigateBack }: AddCompanyPageProps) {
  const [formData, setFormData] = useState<ProviderForm>({
    name: '',
    description: '',
    services: '',
    location: '',
    email: '',
    phone: '',
    logoFile: undefined,
    website: '' // honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<ProviderForm>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProviderForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Názov firmy je povinný';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Popis firmy je povinný';
    }

    if (!formData.services.trim()) {
      newErrors.services = 'Služby sú povinné';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Lokalita je povinná';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefónne číslo je povinné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProviderForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Prosím vyberte obrázok (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Súbor je príliš veľký. Maximálna veľkosť je 5MB.');
        return;
      }
      
      setFormData(prev => ({ ...prev, logoFile: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoFile: undefined }));
    setLogoPreview(null);
    
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await submitProvider(formData);
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          services: '',
          location: '',
          email: '',
          phone: '',
          logoFile: undefined,
          website: ''
        });
        setLogoPreview(null);
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Chyba pri registrácii firmy:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-start mb-6">
              <button
                onClick={onNavigateBack}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Registrácia firmy
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Pridajte svoju firmu do nášho zoznamu a získajte nových zákazníkov
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Úspešne registrované!</h3>
                  <p className="text-green-700">Vaša firma bola úspešne pridaná do nášho zoznamu.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Chyba pri registrácii</h3>
                  <p className="text-red-700">Nastala chyba. Skúste to prosím znovu.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Company Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Building2 className="mr-2" size={16} />
                Názov firmy *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Zadajte názov vašej firmy"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="mr-2" size={16} />
                Popis firmy *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Opíšte vašu firmu a služby, ktoré poskytujete"
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Services */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="mr-2" size={16} />
                Služby *
              </label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
                placeholder="Murár, Obkladač, Vodár (oddeľte čiarkami)"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.services ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                }`}
              />
              {errors.services && (
                <p className="mt-1 text-sm text-red-600">{errors.services}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Zadajte služby oddelené čiarkami
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="mr-2" size={16} />
                Lokalita *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Bratislava, Košice, Žilina..."
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="mr-2" size={16} />
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="firma@example.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="mr-2" size={16} />
                  Telefón *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+421 900 123 456"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Upload className="mr-2" size={16} />
                Logo firmy (voliteľné)
              </label>
              
              {/* File Input */}
              <div className="space-y-4">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* Logo Preview */}
                {logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="mt-1 text-sm text-gray-500">
                Nahrajte logo vašej firmy (JPG, PNG, GIF). Maximálna veľkosť: 5MB
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Registrujem firmu...
                  </div>
                ) : (
                  'Registrovať firmu'
                )}
              </button>
            </div>

            {/* Required Fields Note */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                * Povinné polia
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCompanyPage;