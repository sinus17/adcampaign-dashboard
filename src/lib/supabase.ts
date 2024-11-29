import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://uydhsjvwrgupgfjevqsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZGhzanZ3cmd1cGdmamV2cXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDAzNjcsImV4cCI6MjA0ODExNjM2N30.xfCQFURkzjvBrVnF5ap5OAytCmo3cWqM7PmIcBTVZLk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});