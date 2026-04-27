import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdlemqkoluzhoksnuguc.supabase.co';
const supabaseAnonKey = 'sb_publishable_cop2lFE0iMbApxK1BVe1Gw_mksISz1y';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
