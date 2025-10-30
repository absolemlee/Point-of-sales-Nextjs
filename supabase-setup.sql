-- Create enums first
CREATE TYPE "UserRole" AS ENUM (
    'SUPERADMIN',
    'FULLADMIN', 
    'ADMIN',
    'MANAGER',
    'SUPERVISOR',
    'COORDINATOR',
    'SPECIALIST',
    'ANALYST',
    'ASSISTANT',
    'INTERN',
    'CONTRACTOR',
    'OWNER',
    'WORKER',
    'UNKNOW'
);

CREATE TYPE "CatProduct" AS ENUM ('ELECTRO', 'DRINK', 'FOOD', 'FASHION');

CREATE TYPE "LocationType" AS ENUM (
    'WAREHOUSE',
    'RETAIL_STORE',
    'OFFICE',
    'FACTORY',
    'DISTRIBUTION_CENTER',
    'SERVICE_CENTER',
    'FRANCHISE_LOCATION',
    'TEMPORARY_BOOTH',
    'OTHER'
);

CREATE TYPE "PermissionType" AS ENUM (
    'READ',
    'WRITE',
    'DELETE',
    'ADMIN'
);

-- Create User table with enhanced KavaPR role system
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'UNKNOW',
    "locationType" "LocationType",
    "locationId" TEXT,
    "department" TEXT,
    "managerId" TEXT,
    "permissions" TEXT[], -- Array of permission strings
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Location table for managing different business locations
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "address" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB, -- Store location-specific settings
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Create RolePermission table for flexible permission management
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "resource" TEXT NOT NULL, -- e.g., 'products', 'transactions', 'users'
    "permission" "PermissionType" NOT NULL,
    "locationTypes" "LocationType"[], -- Which location types this applies to
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- Create SystemConfiguration table for editable system settings
CREATE TABLE "SystemConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- Create ProductStock table
CREATE TABLE "ProductStock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageProduct" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL,
    "cat" "CatProduct" NOT NULL,
    "locationId" TEXT, -- Link products to specific locations
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id")
);

-- Create Product table
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellprice" DOUBLE PRECISION NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT, -- Track who created the transaction
    "locationId" TEXT, -- Track where the transaction occurred

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Create OnSaleProduct table
CREATE TABLE "OnSaleProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "saledate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT, -- Track who processed the sale

    CONSTRAINT "OnSaleProduct_pkey" PRIMARY KEY ("id")
);

-- Create ShopData table
CREATE TABLE "ShopData" (
    "id" TEXT NOT NULL,
    "tax" INTEGER,
    "name" TEXT,
    "locationId" TEXT,

    CONSTRAINT "ShopData_pkey" PRIMARY KEY ("id")
);

-- Create AuditLog table for tracking changes
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    "resource" TEXT NOT NULL, -- e.g., 'User', 'Product', 'Transaction'
    "resourceId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "ProductStock_id_key" ON "ProductStock"("id");
CREATE UNIQUE INDEX "Product_productId_key" ON "Product"("productId");
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");
CREATE UNIQUE INDEX "SystemConfiguration_key_key" ON "SystemConfiguration"("key");
CREATE UNIQUE INDEX "RolePermission_role_resource_permission_key" ON "RolePermission"("role", "resource", "permission");

-- Create indexes for performance
CREATE INDEX "OnSaleProduct_productId_transactionId_idx" ON "OnSaleProduct"("productId", "transactionId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_locationType_idx" ON "User"("locationType");
CREATE INDEX "User_locationId_idx" ON "User"("locationId");
CREATE INDEX "User_managerId_idx" ON "User"("managerId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_locationId_idx" ON "Transaction"("locationId");
CREATE INDEX "ProductStock_locationId_idx" ON "ProductStock"("locationId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- Add foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Location" ADD CONSTRAINT "Location_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OnSaleProduct" ADD CONSTRAINT "OnSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnSaleProduct" ADD CONSTRAINT "OnSaleProduct_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "OnSaleProduct" ADD CONSTRAINT "OnSaleProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ShopData" ADD CONSTRAINT "ShopData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SystemConfiguration" ADD CONSTRAINT "SystemConfiguration_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;