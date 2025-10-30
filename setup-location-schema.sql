-- Location Management Schema (Incremental Addition)
-- This builds on the existing ProductStock, Transaction, etc. tables

-- First, let's create the Location types and tables
CREATE TYPE "LocationType" AS ENUM ('STATIC', 'POPUP', 'VENUE_PARTNERSHIP');
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SCHEDULED', 'CLOSED');

-- Location table
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "status" "LocationStatus" NOT NULL DEFAULT 'INACTIVE',
    "address" TEXT,
    "coordinates" JSON, -- {lat, lng}
    "operatingHours" JSON, -- Flexible schedule structure
    "contactInfo" JSON, -- Phone, email, etc.
    "settings" JSON, -- Location-specific configurations
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Menu Management per Location
CREATE TABLE "LocationMenu" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationMenu_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationMenu_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
);

-- Location-specific product availability and pricing
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK');
CREATE TYPE "ProductType" AS ENUM ('BEVERAGE', 'FOOD', 'ADDON', 'MODIFIER');

CREATE TABLE "LocationProduct" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL, -- References ProductStock.id
    "menuId" TEXT, -- Optional menu assignment
    "locationName" TEXT, -- Location-specific name override
    "locationPrice" DECIMAL(10,2), -- Location-specific price override
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "category" TEXT,
    "prepTime" INTEGER, -- Minutes
    "dailyLimit" INTEGER, -- For pop-up events
    "currentStock" INTEGER,
    "sortOrder" INTEGER DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationProduct_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationProduct_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE,
    CONSTRAINT "LocationProduct_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "LocationMenu"("id") ON DELETE SET NULL,
    CONSTRAINT "LocationProduct_unique" UNIQUE ("locationId", "productId")
);

-- Staff per location
CREATE TYPE "StaffRole" AS ENUM ('BARISTA', 'KITCHEN', 'MANAGER', 'OWNER');

CREATE TABLE "LocationStaff" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSON, -- Role-specific permissions
    "deviceId" TEXT, -- For device-specific POS access
    "pin" TEXT, -- For quick login
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationStaff_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationStaff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Location_type_status_idx" ON "Location"("type", "status");
CREATE INDEX "LocationProduct_locationId_status_idx" ON "LocationProduct"("locationId", "status");
CREATE INDEX "LocationProduct_productId_idx" ON "LocationProduct"("productId");
CREATE INDEX "LocationStaff_locationId_role_idx" ON "LocationStaff"("locationId", "role");

-- Insert a default location to start with
INSERT INTO "Location" ("id", "name", "type", "status", "address") 
VALUES ('default-location', 'Main Location', 'STATIC', 'ACTIVE', 'Default Address');

-- Create a default menu for the location
INSERT INTO "LocationMenu" ("id", "locationId", "name", "description", "isActive")
VALUES ('default-menu', 'default-location', 'Main Menu', 'Primary menu for main location', true);