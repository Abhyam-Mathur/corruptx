import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tbwprbcsjpmszzveltrc.supabase.co";
const supabaseAnonKey = "sb_publishable_squZ3DGydffMG6Oqsl3nhw_pi0n3bEL";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
