import { createClient } from '@supabase/supabase-js';
import config from './config';

const supabaseUrl = config.env.supabase.baseUrl;
const supabaseKey = config.env.supabase.apiKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
