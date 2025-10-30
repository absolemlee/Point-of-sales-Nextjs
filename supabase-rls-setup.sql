-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductStock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OnSaleProduct" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopData" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict later)
-- User table policies
CREATE POLICY "Allow all operations on User" ON "User"
FOR ALL USING (true) WITH CHECK (true);

-- ProductStock table policies
CREATE POLICY "Allow all operations on ProductStock" ON "ProductStock"
FOR ALL USING (true) WITH CHECK (true);

-- Product table policies
CREATE POLICY "Allow all operations on Product" ON "Product"
FOR ALL USING (true) WITH CHECK (true);

-- Transaction table policies
CREATE POLICY "Allow all operations on Transaction" ON "Transaction"
FOR ALL USING (true) WITH CHECK (true);

-- OnSaleProduct table policies
CREATE POLICY "Allow all operations on OnSaleProduct" ON "OnSaleProduct"
FOR ALL USING (true) WITH CHECK (true);

-- ShopData table policies
CREATE POLICY "Allow all operations on ShopData" ON "ShopData"
FOR ALL USING (true) WITH CHECK (true);