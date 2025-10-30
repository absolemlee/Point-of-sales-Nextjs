const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('query', { query_text: sql });
  if (error) {
    throw new Error(`SQL Error: ${error.message}`);
  }
  return data;
}

async function applySqlSchema() {
  try {
    console.log('📂 Reading enhanced schema file...');
    const schema = fs.readFileSync('./schema/enhanced-food-service-schema.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      console.log(`  [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
      
      try {
        // Use raw query for DDL statements
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ query_text: statement + ';' })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`  ⚠️  Statement ${i + 1} failed: ${errorText}`);
        } else {
          console.log(`  ✅ Statement ${i + 1} completed`);
        }
      } catch (error) {
        console.warn(`  ⚠️  Statement ${i + 1} error: ${error.message}`);
      }
    }
    
    console.log('🎉 Schema application completed!');
    
    // Verify tables were created
    console.log('🔍 Verifying new tables...');
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) {
      console.error('❌ Error checking tables:', error);
      return;
    }
    
    const newTables = tables.filter(t => 
      ['Location', 'LocationMenu', 'MenuItem', 'Staff', 'Shift', 'Customer'].includes(t.table_name)
    );
    
    console.log('📋 Enhanced tables available:', newTables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
  }
}

applySqlSchema();