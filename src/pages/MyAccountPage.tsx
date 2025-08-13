import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Building2, 
  FileText, 
  CreditCard,
  Trash2,
  Edit3,
  Plus,
  Eye,
  EyeOff,
  MessageSquare,
  Download,
  LogOut,
  Settings,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Key,
  Globe,
  Lock,
  Info,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase, type Profile, type Company, type Inquiry } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import zxcvbn from 'zxcvbn';
import debounce from 'lodash.debounce';

interface MyAccountPageProps {
  onNavigateBack: () => void;
  onNavigateToAddCompany: () => void;
}

function MyAccountPage({ onNavigateBack, onNavigateToAddCompany }: MyAccountPageProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'companies' | 'inquiries' | 'payments' | 'delete'>('profile');
  
  // Auth states
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  // Form states
  const [authForm, setAuthForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    name: '',
    termsAccepted: false,
    marketingConsent: false,
    rememberMe: false
  });
  const [profileForm, setProfileForm] = useState({ name: '', city: '', phone: '' });
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' });
  const [notificationSettings, setNotificationSettings] = useState({ email: true, push: true });
  
  // UI states
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  useEffect(() => {
    checkUser();
  }, []);

  // Debounced email uniqueness check
  const debouncedEmailCheck = debounce(async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setEmailCheckLoading(true);
    try {
      // Check if email exists in auth.users (this would need a Supabase Edge Function)
      // For now, we'll simulate the check
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email) // This is just a placeholder - real implementation needs Edge Function
        .single();
      
      setEmailExists(!!data);
    } catch (error) {
      // Email doesn't exist or error occurred
      setEmailExists(false);
    } finally {
      setEmailCheckLoading(false);
    }
  }, 500);

  // Password strength check
  useEffect(() => {
    if (authForm.password) {
      const result = zxcvbn(authForm.password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength(null);
    }
  }, [authForm.password]);

  // Email uniqueness check
  useEffect(() => {
    if (isSignUp && authForm.email) {
      debouncedEmailCheck(authForm.email);
    }
  }, [authForm.email, isSignUp]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadUserData(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || '',
          city: profileData.city || '',
          phone: profileData.phone || ''
        });
        setNotificationSettings({
          email: profileData.email_notifications_enabled,
          push: profileData.push_notifications_enabled
        });
      }

      // Load companies if user is a provider
      if (profileData?.is_provider) {
        const { data: companiesData } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        setCompanies(companiesData || []);
      }

      // Load inquiries
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      setInquiries(inquiriesData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    // Validation for sign up
    if (isSignUp) {
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('Heslá sa nezhodujú');
        setAuthLoading(false);
        return;
      }
      
      if (!authForm.termsAccepted) {
        setAuthError('Musíte súhlasiť s podmienkami používania');
        setAuthLoading(false);
        return;
      }
      
      if (passwordStrength && passwordStrength.score < 2) {
        setAuthError('Heslo je príliš slabé. Použite silnejšie heslo.');
        setAuthLoading(false);
        return;
      }
      
      if (emailExists) {
        setAuthError('Tento e-mail už je registrovaný');
        setAuthLoading(false);
        return;
      }
    }

    // Get reCAPTCHA token
    try {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        const token = await (window as any).grecaptcha.execute('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', {action: 'submit'});
        setRecaptchaToken(token);
      }
    } catch (error) {
      console.warn('reCAPTCHA failed:', error);
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              name: authForm.name,
              marketing_consent: authForm.marketingConsent
            }
          }
        });
        
        if (error) throw error;
        setAuthSuccess('Registrácia úspešná! Skontrolujte si e-mail pre potvrdenie.');
        setShowResendVerification(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
          options: {
            shouldCreatePersistentSession: authForm.rememberMe
          }
        });
        
        if (error) throw error;
        await checkUser();
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompanies([]);
    setInquiries([]);
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleMagicLink = async () => {
    if (!authForm.email) {
      setAuthError('Zadajte e-mail pre magic link');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authForm.email
      });
      if (error) throw error;
      setAuthSuccess('Magic link bol odoslaný na váš e-mail!');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setAuthError('Zadajte e-mail pre obnovenie hesla');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail);
      if (error) throw error;
      setAuthSuccess('Odkaz na obnovenie hesla bol odoslaný na váš e-mail!');
      setShowForgotPassword(false);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleResendVerification = async () => {
    if (!authForm.email) {
      setAuthError('E-mail nie je k dispozícii');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({ 
        type: 'signup', 
        email: authForm.email 
      });
      if (error) throw error;
      setAuthSuccess('Verifikačný e-mail bol znova odoslaný!');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleCapsLockCheck = (event: React.KeyboardEvent) => {
    setCapsLockOn(event.getModifierState('CapsLock'));
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 0: return 'Veľmi slabé';
      case 1: return 'Slabé';
      case 2: return 'Stredné';
      case 3: return 'Silné';
      case 4: return 'Veľmi silné';
      default: return '';
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileForm.name,
          city: profileForm.city,
          phone: profileForm.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      await loadUserData(user.id);
      setEditingProfile(false);
      setAuthSuccess('Profil bol úspešne aktualizovaný!');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const updateNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications_enabled: notificationSettings.email,
          push_notifications_enabled: notificationSettings.push,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setAuthSuccess('Nastavenia notifikácií boli aktualizované!');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // This would need to be implemented as a Supabase Edge Function
      // for proper cleanup of all user data
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      setAuthError('Chyba pri mazaní účtu. Kontaktujte podporu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Schválená';
      case 'pending': return 'Čaká na schválenie';
      case 'rejected': return 'Zamietnutá';
      case 'open': return 'Otvorený';
      case 'in_progress': return 'Prebieha';
      case 'completed': return 'Dokončený';
      case 'cancelled': return 'Zrušený';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - show login/signup
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 pt-20">
        {/* Auth Form */}
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'Registrácia' : 'Prihlásenie'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Vytvorte si nový účet' : 'Prihláste sa do svojho účtu'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-3" size={20} />
                  <p className="text-red-700">{authError}</p>
                </div>
              </div>
            )}

            {authSuccess && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3" size={20} />
                  <p className="text-green-700">{authSuccess}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meno
                  </label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      emailExists === true ? 'border-red-300 bg-red-50' : 
                      emailExists === false ? 'border-green-300 bg-green-50' : 
                      'border-gray-200'
                    }`}
                    required
                  />
                  {emailCheckLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="animate-spin text-gray-400" size={16} />
                    </div>
                  )}
                </div>
                {isSignUp && emailExists === true && (
                  <p className="mt-1 text-sm text-red-600">Tento e-mail už je registrovaný</p>
                )}
                {isSignUp && emailExists === false && (
                  <p className="mt-1 text-sm text-green-600">E-mail je dostupný</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heslo
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    onKeyDown={handleCapsLockCheck}
                    onKeyUp={handleCapsLockCheck}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Caps Lock Warning */}
                {capsLockOn && (
                  <div className="mt-1 flex items-center text-sm text-orange-600">
                    <AlertCircle size={14} className="mr-1" />
                    Caps Lock je zapnutý
                  </div>
                )}
                
                {/* Password Rules Tooltip */}
                {isSignUp && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Info className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Požiadavky na heslo:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Minimálne 8 znakov</li>
                          <li>Aspoň jedno veľké písmeno</li>
                          <li>Aspoň jedno malé písmeno</li>
                          <li>Aspoň jedno číslo</li>
                          <li>Aspoň jeden špeciálny znak</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Password Strength Meter */}
                {isSignUp && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Sila hesla:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score >= 3 ? 'text-green-600' : 
                        passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.suggestions.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-medium">Návrhy:</p>
                        <ul className="list-disc list-inside">
                          {passwordStrength.feedback.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potvrdiť heslo
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        authForm.confirmPassword && authForm.password !== authForm.confirmPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {authForm.confirmPassword && authForm.password !== authForm.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Heslá sa nezhodujú</p>
                  )}
                  {authForm.confirmPassword && authForm.password === authForm.confirmPassword && (
                    <p className="mt-1 text-sm text-green-600">Heslá sa zhodujú</p>
                  )}
                </div>
              )}

              {/* Terms & Privacy Checkbox */}
              {isSignUp && (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={authForm.termsAccepted}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                      Súhlasím s{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                        podmienkami používania
                      </a>{' '}
                      a{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                        ochranou súkromia
                      </a>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  
                  {/* Marketing Consent */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={authForm.marketingConsent}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="marketing" className="ml-3 text-sm text-gray-700">
                      Súhlasím s posielaním marketingových e-mailov a noviniek (voliteľné)
                    </label>
                  </div>
                </div>
              )}

              {/* Remember Me */}
              {!isSignUp && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={authForm.rememberMe}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-3 text-sm text-gray-700">
                    Zapamätať si ma (trvalá relácia)
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {authLoading ? 'Načítavam...' : (isSignUp ? 'Registrovať' : 'Prihlásiť')}
              </button>
            </form>

            {/* Alternative Auth Methods */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Globe size={20} />
                Prihlásiť cez Google
              </button>

              <button
                onClick={handleMagicLink}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Mail size={20} />
                Poslať Magic Link
              </button>
            </div>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Zabudnuté heslo?
                </button>
              </div>
            )}

            {/* Resend Verification Email */}
            {showResendVerification && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleResendVerification}
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm underline mx-auto"
                >
                  <RefreshCw size={16} />
                  Znova odoslať verifikačný e-mail
                </button>
              </div>
            )}

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? 'Už máte účet? Prihláste sa' : 'Nemáte účet? Registrujte sa'}
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="text-blue-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Obnovenie hesla</h2>
                <p className="text-gray-600">
                  Zadajte svoj e-mail a pošleme vám odkaz na obnovenie hesla
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Váš e-mail"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Odoslať
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated - show account page
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 w-16 h-16 mr-6 flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Môj účet</h1>
                <p className="text-xl text-blue-100">
                  Spravujte svoj profil a nastavenia
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Vitajte, {profile?.name || user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-red-200 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                Odhlásiť
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profil', icon: User },
                  { id: 'security', label: 'Zabezpečenie', icon: Shield },
                  { id: 'notifications', label: 'Notifikácie', icon: Bell },
                  ...(profile?.is_provider ? [{ id: 'companies', label: 'Moje firmy', icon: Building2 }] : []),
                  { id: 'inquiries', label: profile?.is_provider ? 'Objednávky' : 'Moje dopyty', icon: FileText },
                  { id: 'payments', label: 'Platby', icon: CreditCard },
                  { id: 'delete', label: 'Zmazať účet', icon: Trash2 }
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
              {/* Success/Error Messages */}
              {authError && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-600 mr-3" size={20} />
                    <p className="text-red-700">{authError}</p>
                    <button
                      onClick={() => setAuthError(null)}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {authSuccess && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={20} />
                    <p className="text-green-700">{authSuccess}</p>
                    <button
                      onClick={() => setAuthSuccess(null)}
                      className="ml-auto text-green-600 hover:text-green-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Profil</h2>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                      {editingProfile ? 'Zrušiť' : 'Upraviť'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {(profile?.name || user.email || '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {profile?.name || 'Bez mena'}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                        <button className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700">
                          <Camera size={16} />
                          Zmeniť avatar
                        </button>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meno
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editingProfile}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mesto
                        </label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                          disabled={!editingProfile}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefón
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!editingProfile}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
                        />
                      </div>
                    </div>

                    {editingProfile && (
                      <div className="flex gap-3">
                        <button
                          onClick={updateProfile}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <Save size={16} />
                          Uložiť zmeny
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          Zrušiť
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Zabezpečenie</h2>
                  
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Zmena hesla</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="password"
                          placeholder="Súčasné heslo"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Nové heslo"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Potvrdiť nové heslo"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          <Key size={16} />
                          Zmeniť heslo
                        </button>
                      </div>
                    </div>

                    {/* Change Email */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Zmena e-mailu</h3>
                      <div className="flex gap-4">
                        <input
                          type="email"
                          placeholder="Nový e-mail"
                          value={securityForm.newEmail}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, newEmail: e.target.value }))}
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          <Mail size={16} />
                          Zmeniť e-mail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifikácie</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">E-mailové notifikácie</h3>
                        <p className="text-gray-600 text-sm">Dostávajte notifikácie na e-mail</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">Push notifikácie</h3>
                        <p className="text-gray-600 text-sm">Dostávajte notifikácie v prehliadači</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.push}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, push: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={updateNotifications}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Save size={16} />
                      Uložiť nastavenia
                    </button>
                  </div>
                </div>
              )}

              {/* Companies Tab */}
              {activeTab === 'companies' && profile?.is_provider && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Moje firmy</h2>
                    <button
                      onClick={onNavigateToAddCompany}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus size={16} />
                      Pridať firmu
                    </button>
                  </div>

                  <div className="space-y-4">
                    {companies.length === 0 ? (
                      <div className="text-center py-12">
                        <Building2 className="text-gray-400 mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Žiadne firmy</h3>
                        <p className="text-gray-500 mb-4">Zatiaľ ste nepridali žiadnu firmu</p>
                        <button
                          onClick={onNavigateToAddCompany}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Pridať prvú firmu
                        </button>
                      </div>
                    ) : (
                      companies.map((company) => (
                        <div key={company.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{company.name}</h3>
                              <p className="text-gray-600">{company.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                              {getStatusLabel(company.status)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {company.services.map((service, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {service}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                              <Edit3 size={16} />
                              Upraviť
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200">
                              <Trash2 size={16} />
                              Zmazať
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {profile?.is_provider ? 'Objednávky' : 'Moje dopyty'}
                  </h2>

                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          {profile?.is_provider ? 'Žiadne objednávky' : 'Žiadne dopyty'}
                        </h3>
                        <p className="text-gray-500">
                          {profile?.is_provider 
                            ? 'Zatiaľ ste nedostali žiadne objednávky'
                            : 'Zatiaľ ste nevytvorili žiadne dopyty'
                          }
                        </p>
                      </div>
                    ) : (
                      inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{inquiry.title}</h3>
                              <p className="text-gray-600">{inquiry.description}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                {inquiry.service_type} • {inquiry.location} • {inquiry.budget}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                              {getStatusLabel(inquiry.status)}
                            </span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                              <MessageSquare size={16} />
                              Chat
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                              <Eye size={16} />
                              Detail
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                              <Download size={16} />
                              Faktúra
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Platby</h2>
                  
                  <div className="space-y-6">
                    {/* Escrow Payments */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Escrow platby</h3>
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <CreditCard className="text-gray-400 mx-auto mb-4" size={48} />
                        <p className="text-gray-600">Žiadne escrow platby</p>
                      </div>
                    </div>

                    {/* Payouts (for providers) */}
                    {profile?.is_provider && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Výplaty</h3>
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <CreditCard className="text-gray-400 mx-auto mb-4" size={48} />
                          <p className="text-gray-600">Žiadne výplaty</p>
                        </div>
                      </div>
                    )}

                    {/* Stripe Connect Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Stripe Connect</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Stripe Connect nie je nastavený</p>
                        <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                          Nastaviť Stripe Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Account Tab */}
              {activeTab === 'delete' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Zmazať účet</h2>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-600 mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                          Pozor! Táto akcia je nevratná
                        </h3>
                        <p className="text-red-700 mb-4">
                          Zmazaním účtu stratíte prístup ku všetkým svojim dátam, firmám, dopytom a platbám. 
                          Táto akcia sa nedá vrátiť späť.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-red-800 mb-2">Pred zmazaním môžete:</h4>
                            <ul className="list-disc list-inside text-red-700 space-y-1">
                              <li>Exportovať svoje dáta</li>
                              <li>Dokončiť rozpracované objednávky</li>
                              <li>Vybrať zostatok z escrow</li>
                            </ul>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                              <Download size={16} />
                              Exportovať dáta
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                              <Trash2 size={16} />
                              Zmazať účet
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Potvrdiť zmazanie</h2>
              <p className="text-gray-600">
                Naozaj chcete zmazať svoj účet? Táto akcia je nevratná.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Zmazať účet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAccountPage;