import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivweytenujgjamckuphe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2d2V5dGVudWpnamFtY2t1cGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDc1MzMsImV4cCI6MjA4OTQyMzUzM30.e4iDKug11ciGmZXmc82MduMwMsbIFU74I9Y1yiWgkQw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
