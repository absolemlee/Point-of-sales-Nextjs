const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function seedProducts() {
  try {
    console.log('🌱 Seeding sample products...');
    
    const sampleProducts = [
      {
        id: 'espresso-001',
        name: 'Espresso',
        imageProduct: null,
        price: 2.50,
        stock: 100,
        cat: 'DRINK'
      },
      {
        id: 'americano-001',
        name: 'Americano',
        imageProduct: null,
        price: 3.00,
        stock: 95,
        cat: 'DRINK'
      },
      {
        id: 'latte-001',
        name: 'Latte',
        imageProduct: null,
        price: 4.50,
        stock: 80,
        cat: 'DRINK'
      },
      {
        id: 'cappuccino-001',
        name: 'Cappuccino',
        imageProduct: null,
        price: 4.00,
        stock: 75,
        cat: 'DRINK'
      },
      {
        id: 'macchiato-001',
        name: 'Macchiato',
        imageProduct: null,
        price: 4.25,
        stock: 60,
        cat: 'DRINK'
      },
      {
        id: 'mocha-001',
        name: 'Mocha',
        imageProduct: null,
        price: 5.00,
        stock: 50,
        cat: 'DRINK'
      },
      {
        id: 'croissant-001',
        name: 'Butter Croissant',
        imageProduct: null,
        price: 3.50,
        stock: 30,
        cat: 'FOOD'
      },
      {
        id: 'muffin-001',
        name: 'Blueberry Muffin',
        imageProduct: null,
        price: 3.25,
        stock: 25,
        cat: 'FOOD'
      },
      {
        id: 'sandwich-001',
        name: 'Breakfast Sandwich',
        imageProduct: null,
        price: 6.50,
        stock: 20,
        cat: 'FOOD'
      },
      {
        id: 'tea-001',
        name: 'Earl Grey Tea',
        imageProduct: null,
        price: 2.75,
        stock: 40,
        cat: 'DRINK'
      }
    ];

    const { data, error } = await supabase
      .from('ProductStock')
      .insert(sampleProducts)
      .select();

    if (error) {
      console.error('❌ Error inserting products:', error);
      return;
    }

    console.log('✅ Successfully seeded products:', data?.length || 0);
    
    // Verify the products were inserted
    const { data: allProducts, error: fetchError } = await supabase
      .from('ProductStock')
      .select('*');
      
    if (!fetchError) {
      console.log('📊 Total products in database:', allProducts?.length || 0);
      console.log('📋 Sample products:', allProducts?.slice(0, 3).map(p => `${p.name} - $${p.price}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedProducts();