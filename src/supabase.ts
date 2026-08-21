import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdrcmohagobbtqetvway.supabase.co'
const supabaseAnonKey = 'sb_publishable_SKtNClyAGIwLRgy2DRsbrA_nJ0qdw09'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
