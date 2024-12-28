const supabaseUrl = "https://ehdrnfjnmzwjvteecbkj.supabase.co";//Deno.env.get("SUPABASE_URL");
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZHJuZmpubXp3anZ0ZWVjYmtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDUyMDk4MSwiZXhwIjoyMDQ2MDk2OTgxfQ.xmhdhENpDEI-FgGbSo5h2tjw2a1cpJMTJse0B_DWvVI"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = await createClient(supabaseUrl, supabaseKey);