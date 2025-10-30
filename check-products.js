const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function checkProductStock() {
  try {
    console.log('🔍 Checking ProductStock table...');
    
    const { data: products, error } = await supabase
      .from('ProductStock')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error('❌ Error querying ProductStock:', error);
      return;
    }
    
    console.log('✅ ProductStock data:', products);
    console.log('📊 Total products found:', products?.length || 0);
    
    // Let's also check the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'ProductStock')
      .eq('table_schema', 'public');
      
    if (!tableError && tableInfo) {
      console.log('📋 ProductStock table structure:', tableInfo);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProductStock();