const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function executeDirectSQL() {
  try {
    console.log('📂 Reading location schema file...');
    const schema = fs.readFileSync('./setup-location-schema.sql', 'utf8');
    
    // Split by statements and execute individually
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} statements individually...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`  [${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);
      
      try {
        // Try using a raw HTTP request to Supabase's PostgREST admin endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sql',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Accept': 'application/json'
          },
          body: statement
        });
        
        if (response.ok) {
          console.log(`    ✅ Success`);
        } else {
          const errorText = await response.text();
          console.log(`    ⚠️  Response: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        console.log(`    ⚠️  Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Schema setup completed!');
    
    // Test by querying the location table
    console.log('🔍 Testing Location table...');
    const { data, error } = await supabase
      .from('Location')
      .select('id, name, type, status')
      .limit(5);
      
    if (error) {
      console.log('❌ Location table test failed:', error.message);
    } else {
      console.log('✅ Location table accessible:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

executeDirectSQL();