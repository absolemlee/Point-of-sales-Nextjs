// Seed data for Kava/Kratom business products
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const kavalKratomProducts = [
  // Kava Root Powders
  {
    id: 'PRD-kava-noble-vanuatu',
    name: 'Noble Kava Root Powder - Vanuatu',
    stock: 5000, // 5kg
    price: 45.00, // per 100g
    cat: 'DRINK'
  },
  {
    id: 'PRD-kava-borogu-vanuatu',
    name: 'Borogu Kava Root Powder - Vanuatu',
    stock: 3000,
    price: 42.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-kava-melomelo-vanuatu',
    name: 'Melo Melo Kava Root Powder - Vanuatu',
    stock: 2500,
    price: 48.00,
    cat: 'DRINK'
  },
  
  // Kratom Powders
  {
    id: 'PRD-kratom-maeng-da-red',
    name: 'Red Maeng Da Kratom Powder',
    stock: 2000,
    price: 35.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-kratom-maeng-da-green',
    name: 'Green Maeng Da Kratom Powder',
    stock: 2000,
    price: 35.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-kratom-maeng-da-white',
    name: 'White Maeng Da Kratom Powder',
    stock: 1500,
    price: 38.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-kratom-bali-red',
    name: 'Red Bali Kratom Powder',
    stock: 1800,
    price: 32.00,
    cat: 'DRINK'
  },

  // Natural Mixers
  {
    id: 'PRD-mixer-coconut-water',
    name: 'Organic Coconut Water',
    stock: 48, // 48 cans
    price: 3.50,
    cat: 'DRINK'
  },
  {
    id: 'PRD-mixer-pineapple-concentrate',
    name: 'Pineapple Juice Concentrate',
    stock: 12, // 12 bottles
    price: 8.50,
    cat: 'DRINK'
  },
  {
    id: 'PRD-mixer-ginger-syrup',
    name: 'Fresh Ginger Syrup',
    stock: 8,
    price: 12.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-mixer-honey-blend',
    name: 'Raw Honey Blend',
    stock: 6,
    price: 15.00,
    cat: 'DRINK'
  },

  // Leilo Cans (Pre-made drinks)
  {
    id: 'PRD-leilo-original',
    name: 'Leilo Original Kava Drink',
    stock: 144, // 6 cases
    price: 4.50,
    cat: 'DRINK'
  },
  {
    id: 'PRD-leilo-pineapple',
    name: 'Leilo Pineapple Kava Drink',
    stock: 96, // 4 cases
    price: 4.50,
    cat: 'DRINK'
  },
  {
    id: 'PRD-leilo-mango',
    name: 'Leilo Mango Kava Drink',
    stock: 72, // 3 cases
    price: 4.50,
    cat: 'DRINK'
  },

  // Supplements & Extracts
  {
    id: 'PRD-extract-kava-liquid',
    name: 'Kava Liquid Extract (1:1)',
    stock: 24, // 24 bottles
    price: 25.00,
    cat: 'DRINK'
  },
  {
    id: 'PRD-supplement-ashwagandha',
    name: 'Ashwagandha Root Powder',
    stock: 500, // 500g
    price: 22.00,
    cat: 'FOOD'
  },
  {
    id: 'PRD-supplement-turmeric',
    name: 'Organic Turmeric Powder',
    stock: 1000,
    price: 18.00,
    cat: 'FOOD'
  },

  // Retail Products
  {
    id: 'PRD-retail-kava-capsules',
    name: 'Kava Root Capsules (60ct)',
    stock: 50,
    price: 28.00,
    cat: 'FOOD'
  },
  {
    id: 'PRD-retail-kratom-capsules',
    name: 'Kratom Capsules Mix (60ct)',
    stock: 40,
    price: 32.00,
    cat: 'FOOD'
  },
  {
    id: 'PRD-retail-kava-tea',
    name: 'Kava Tea Bags (20ct)',
    stock: 30,
    price: 15.00,
    cat: 'DRINK'
  }
];

async function seedKavalKratomProducts() {
  console.log('🌿 Seeding Kava/Kratom products...');
  
  // Clear existing products
  const { error: deleteError } = await supabase
    .from('ProductStock')
    .delete()
    .neq('id', '');
    
  if (deleteError) {
    console.log('Note: Could not clear existing products:', deleteError.message);
  }

  // Insert new products
  for (const product of kavalKratomProducts) {
    console.log(`  Adding: ${product.name}`);
    
    const { error } = await supabase
      .from('ProductStock')
      .insert([product]);
      
    if (error) {
      console.error(`  ❌ Failed to add ${product.name}:`, error.message);
    } else {
      console.log(`  ✅ Added: ${product.name}`);
    }
  }
  
  console.log('🎉 Kava/Kratom product seeding completed!');
  
  // Verify products were added
  const { data: products, error } = await supabase
    .from('ProductStock')
    .select('id, name, stock, price')
    .order('name');
    
  if (error) {
    console.error('❌ Failed to verify products:', error);
  } else {
    console.log(`📊 Total products in database: ${products?.length || 0}`);
    console.log('📋 Products added:');
    products?.forEach(product => {
      console.log(`  - ${product.name} (Stock: ${product.stock}, Price: $${product.price})`);
    });
  }
}

seedKavalKratomProducts();