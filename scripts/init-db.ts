import { createClient } from '@supabase/supabase-js'

// This uses the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database schema...')
    
    // First, let's test the connection
    const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Create our schema using Supabase SQL
    const schema = `
      -- Create enums first
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('OWNER', 'WORKER', 'UNKNOW');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE "CatProduct" AS ENUM ('ELECTRO', 'DRINK', 'FOOD', 'FASHION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create tables if they don't exist
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "email" TEXT,
          "emailVerified" TIMESTAMP(3),
          "image" TEXT,
          "password" TEXT,
          "role" "UserRole" NOT NULL DEFAULT 'UNKNOW',
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "ProductStock" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "imageProduct" TEXT,
          "price" DOUBLE PRECISION NOT NULL,
          "stock" DOUBLE PRECISION NOT NULL,
          "cat" "CatProduct" NOT NULL,
          CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "sellprice" DOUBLE PRECISION NOT NULL,
          CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Transaction" (
          "id" TEXT NOT NULL,
          "totalAmount" DECIMAL(65,30),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "isComplete" BOOLEAN NOT NULL DEFAULT false,
          CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "OnSaleProduct" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "saledate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "transactionId" TEXT NOT NULL,
          CONSTRAINT "OnSaleProduct_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "ShopData" (
          "id" TEXT NOT NULL,
          "tax" INTEGER,
          "name" TEXT,
          CONSTRAINT "ShopData_pkey" PRIMARY KEY ("id")
      );

      -- Create indexes if they don't exist
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email") WHERE "email" IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductStock_id_key" ON "ProductStock"("id");
      CREATE UNIQUE INDEX IF NOT EXISTS "Product_productId_key" ON "Product"("productId");
      CREATE INDEX IF NOT EXISTS "OnSaleProduct_productId_transactionId_idx" ON "OnSaleProduct"("productId", "transactionId");
    `
    
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (schemaError) {
      console.error('❌ Schema creation failed:', schemaError.message)
      return false
    }
    
    console.log('✅ Database schema created successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

// Run the initialization
initializeDatabase().then(success => {
  if (success) {
    console.log('🎉 Database setup complete!')
    process.exit(0)
  } else {
    console.log('💥 Database setup failed!')
    process.exit(1)
  }
})