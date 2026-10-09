import {createClient} from '@supabase/supabase-js';
import {supabaseUrl as url,supabasePublishableKey as key} from './supabase-config';
export const supabase=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
