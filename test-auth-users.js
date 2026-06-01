require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false }, realtime: { disabled: true } }
  );
  
  // try to fetch auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Auth Error:", authError.message);
  } else {
    console.log("Auth Users:", authData?.users?.length);
    if (authData?.users?.length > 0) {
      console.log("First user email:", authData.users[0].email);
    }
  }
}
test();
