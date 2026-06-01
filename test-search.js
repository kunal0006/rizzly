require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabase.from('users').select('*').ilike('email', '%test%').limit(1);
  console.log(error ? "Error: " + error.message : "Success");
}
test();
