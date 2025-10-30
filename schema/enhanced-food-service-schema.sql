-- Enhanced Schema for Multi-Location Food Service Platform

-- Location Management
CREATE TYPE "LocationType" AS ENUM ('STATIC', 'POPUP', 'VENUE_PARTNERSHIP');
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SCHEDULED', 'CLOSED');

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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Menu and Product Management (Location-specific)
CREATE TYPE "ProductType" AS ENUM ('BEVERAGE', 'FOOD', 'ADDON', 'MODIFIER');
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK');

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

CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "productId" TEXT NOT NULL, -- References existing ProductStock
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "category" TEXT,
    "prepTime" INTEGER, -- Minutes
    "allergens" TEXT[],
    "customizations" JSON, -- Available modifications
    "dailyLimit" INTEGER, -- For pop-up events
    "currentStock" INTEGER,
    "imageUrl" TEXT,
    "sortOrder" INTEGER DEFAULT 0,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "LocationMenu"("id") ON DELETE CASCADE,
    CONSTRAINT "MenuItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
);

-- Staff and Shift Management
CREATE TYPE "StaffRole" AS ENUM ('BARISTA', 'KITCHEN', 'MANAGER', 'OWNER');
CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL, -- References User table
    "locationId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSON, -- Role-specific permissions
    "deviceId" TEXT, -- For device-specific POS access
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
    CONSTRAINT "Staff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id")
);

CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "status" "ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "openingCash" DECIMAL(10,2),
    "closingCash" DECIMAL(10,2),
    "notes" TEXT,
    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Shift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id"),
    CONSTRAINT "Shift_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id")
);

-- Customer Management
CREATE TYPE "CustomerType" AS ENUM ('GUEST', 'MEMBER', 'VIP');

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "name" TEXT,
    "type" "CustomerType" NOT NULL DEFAULT 'GUEST',
    "loyaltyPoints" INTEGER DEFAULT 0,
    "preferences" JSON, -- Dietary preferences, favorites
    "paymentMethods" JSON, -- Saved payment methods
    "addresses" JSON, -- Delivery addresses
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Enhanced Order Management
CREATE TYPE "OrderSource" AS ENUM ('STAFF_POS', 'CUSTOMER_APP', 'QR_SCAN', 'THIRD_PARTY', 'PHONE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEOUT', 'DELIVERY', 'PICKUP');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL, -- Human-readable order number
    "locationId" TEXT NOT NULL,
    "customerId" TEXT,
    "staffId" TEXT, -- Who took the order
    "shiftId" TEXT,
    "source" "OrderSource" NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tip" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "customerNotes" TEXT,
    "staffNotes" TEXT,
    "estimatedReadyTime" TIMESTAMP(3),
    "actualReadyTime" TIMESTAMP(3),
    "customerInfo" JSON, -- Name, phone for guest orders
    "tableNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Order_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id"),
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
    CONSTRAINT "Order_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id"),
    CONSTRAINT "Order_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id")
);

CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "customizations" JSON, -- Size, milk type, extras, etc.
    "specialInstructions" TEXT,
    "kitchenStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "kitchenNotes" TEXT,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id")
);

-- Kitchen Display System
CREATE TYPE "KitchenStationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');

CREATE TABLE "KitchenStation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL, -- "Espresso Bar", "Grill", "Cold Prep"
    "type" TEXT NOT NULL, -- Station category
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCapacity" INTEGER DEFAULT 10,
    CONSTRAINT "KitchenStation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KitchenStation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id")
);

CREATE TABLE "KitchenQueue" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "status" "KitchenStationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER DEFAULT 0,
    "estimatedTime" INTEGER, -- Minutes
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedStaff" TEXT,
    CONSTRAINT "KitchenQueue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KitchenQueue_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id"),
    CONSTRAINT "KitchenQueue_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "KitchenStation"("id")
);

-- Payment Processing
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'CARD', 'MOBILE', 'GIFT_CARD', 'LOYALTY_POINTS');

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethodType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT, -- External payment processor ID
    "processorResponse" JSON, -- Payment gateway response
    "processedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id")
);

-- QR Code and Self-Service
CREATE TABLE "QRTable" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentOrderId" TEXT,
    CONSTRAINT "QRTable_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QRTable_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id")
);

-- Integration Management (for UberEats, etc.)
CREATE TYPE "IntegrationType" AS ENUM ('UBEREATS', 'DOORDASH', 'GRUBHUB', 'CUSTOM');
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');

CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'INACTIVE',
    "config" JSON, -- API keys, webhook URLs, etc.
    "menuMapping" JSON, -- Map internal items to external platform
    "lastSync" TIMESTAMP(3),
    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Integration_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id")
);

-- Indexes for performance
CREATE INDEX "Order_locationId_createdAt_idx" ON "Order"("locationId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "KitchenQueue_stationId_status_idx" ON "KitchenQueue"("stationId", "status");
CREATE INDEX "MenuItem_locationId_status_idx" ON "MenuItem"("locationId", "status");