import { supabase } from './supabase';

export type ProviderForm = {
  name: string;
  description: string;
  services?: string;
  location: string;
  email: string;
  phone?: string;
  logoFile?: File;
  website?: string; // honeypot
};

export async function submitProvider(f: ProviderForm) {
  // Basic validation
  if (!f.name?.trim() || !f.description?.trim() || !f.location?.trim() || !f.email?.trim()) {
    throw new Error('Vyplňte povinné polia.');
  }
  
  if (!/\S+@\S+\.\S+/.test(f.email)) {
    throw new Error('E-mail nemá správny tvar.');
  }
  
  // Honeypot check
  if (f.website && f.website.trim().length) {
    return { ok: true }; // Silent success for bots
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Musíte byť prihlásený pre pridanie firmy.');
  }

  // Handle logo upload if file is provided
  let logoUrl: string | null = null;
  if (f.logoFile) {
    try {
      // Generate unique filename
      const fileExt = f.logoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(fileName, f.logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Chyba pri nahrávaní loga: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company_logos')
        .getPublicUrl(fileName);
      
      logoUrl = urlData.publicUrl;
    } catch (error: any) {
      throw new Error(`Chyba pri spracovaní loga: ${error.message}`);
    }
  }

  // Convert services string to array
  const servicesArray = f.services 
    ? f.services.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const payload = {
    user_id: user.id,
    name: f.name.trim(),
    description: f.description.trim(),
    services: servicesArray,
    location: f.location.trim(),
    email: f.email.trim(),
    phone: f.phone?.trim() || null,
    logo_url: logoUrl,
    status: 'pending'
  };

  const { error } = await supabase.from('companies').insert([payload]);
  
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Chyba pri ukladaní: ${error.message}`);
  }
  
  return { ok: true };
}