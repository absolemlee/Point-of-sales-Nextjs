-- Enhanced Product Structure for Kava/Kratom Business
-- This extends the existing ProductStock table with proper categorization

-- Product Categories for Kava/Kratom Business
CREATE TYPE "ProductCategory" AS ENUM (
  'KAVA_ROOT_POWDER',
  'KRATOM_POWDER', 
  'NATURAL_MIXER',
  'SUPPLEMENT',
  'EXTRACT',
  'PREMADE_DRINK',
  'LEILO_CAN',
  'RETAIL_PRODUCT',
  'INGREDIENT',
  'ACCESSORY'
);

-- Product Usage Types
CREATE TYPE "ProductUsage" AS ENUM (
  'INGREDIENT',     -- Raw materials for making drinks (kava powder, kratom powder)
  'MIXER',          -- Natural mixers and flavor enhancers
  'RETAIL',         -- Products sold as-is to customers
  'SUPPLY'          -- Operational supplies (cups, stirrers, etc.)
);

-- Location Inventory Allocation
CREATE TABLE "LocationInventory" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "usageType" "ProductUsage" NOT NULL,
    "unitType" TEXT NOT NULL, -- 'grams', 'ounces', 'cans', 'bottles', 'servings'
    "costPerUnit" DECIMAL(10,2),
    "sellingPrice" DECIMAL(10,2), -- For retail items
    "strainType" TEXT, -- For kava/kratom strain identification
    "potency" TEXT, -- Strength rating for herbs
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "lastRestocked" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationInventory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationInventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE,
    CONSTRAINT "LocationInventory_unique" UNIQUE ("locationId", "productId", "strainType")
);

-- Menu Items generated from allocated inventory
CREATE TABLE "LocationMenuItem" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "menuId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "category" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepTime" INTEGER, -- Minutes
    "servingSize" TEXT, -- '12oz', '16oz', 'small', 'large'
    "ingredients" JSON, -- Array of {inventoryId, quantity, unit}
    "allergens" TEXT[],
    "effects" TEXT[], -- For kava/kratom: 'relaxing', 'energizing', 'focus', etc.
    "potencyLevel" INTEGER, -- 1-5 scale
    "imageUrl" TEXT,
    "sortOrder" INTEGER DEFAULT 0,
    "dailyLimit" INTEGER, -- For limited ingredients
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationMenuItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationMenuItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE,
    CONSTRAINT "LocationMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "LocationMenu"("id") ON DELETE CASCADE
);

-- Menu Categories by Location Type
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableLocationTypes" TEXT[], -- Which location types can use this category
    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MenuCategory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
);

-- Recipe/Formula Management for handmade drinks
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT,
    "prepTimeMinutes" INTEGER,
    "skillLevel" TEXT, -- 'beginner', 'intermediate', 'advanced'
    "yields" INTEGER, -- Number of servings
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Recipe_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "LocationMenuItem"("id") ON DELETE CASCADE
);

-- Recipe Ingredients (detailed breakdown)
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "preparation" TEXT, -- 'ground', 'strained', 'mixed', etc.
    "timing" TEXT, -- 'start', 'middle', 'end' of preparation
    "isOptional" BOOLEAN DEFAULT false,
    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE,
    CONSTRAINT "RecipeIngredient_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "LocationInventory"("id") ON DELETE CASCADE
);

-- Professional Service Provider certifications and skills
CREATE TABLE "StaffCertification" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "certification" TEXT NOT NULL, -- 'Kava Preparation', 'Kratom Knowledge', 'Customer Service'
    "level" TEXT, -- 'basic', 'intermediate', 'expert'
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StaffCertification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StaffCertification_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "LocationStaff"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX "LocationInventory_locationId_usageType_idx" ON "LocationInventory"("locationId", "usageType");
CREATE INDEX "LocationInventory_strainType_idx" ON "LocationInventory"("strainType");
CREATE INDEX "LocationMenuItem_locationId_category_idx" ON "LocationMenuItem"("locationId", "category");
CREATE INDEX "LocationMenuItem_potencyLevel_idx" ON "LocationMenuItem"("potencyLevel");
CREATE INDEX "RecipeIngredient_inventoryId_idx" ON "RecipeIngredient"("inventoryId");

-- Sample data for Kava/Kratom business
INSERT INTO "MenuCategory" ("id", "locationId", "name", "description", "sortOrder", "applicableLocationTypes") VALUES
('cat-static-kava', 'default-location', 'Traditional Kava', 'Handcrafted kava beverages from fresh root powder', 1, ARRAY['STATIC']),
('cat-static-kratom', 'default-location', 'Kratom Blends', 'Expertly prepared kratom beverages', 2, ARRAY['STATIC']),
('cat-static-custom', 'default-location', 'Custom Blends', 'Personalized combinations', 3, ARRAY['STATIC']),
('cat-popup-ready', 'default-location', 'Ready-to-Drink', 'Pre-made beverages and cans', 1, ARRAY['POPUP', 'VENUE_PARTNERSHIP']),
('cat-popup-retail', 'default-location', 'Retail Products', 'Take-home products', 2, ARRAY['POPUP', 'VENUE_PARTNERSHIP']);