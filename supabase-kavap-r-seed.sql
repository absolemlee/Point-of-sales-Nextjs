-- KavaPR System Seed Data
-- This file populates the database with initial data for the KavaPR role-based system

-- Insert default locations
INSERT INTO "Location" ("id", "name", "type", "address", "isActive") VALUES
('loc_main_office', 'KavaPR Main Office', 'OFFICE', '123 Business District, Main City', true),
('loc_warehouse_1', 'Primary Warehouse', 'WAREHOUSE', '456 Industrial Zone, Warehouse District', true),
('loc_retail_store_1', 'Downtown Store', 'RETAIL_STORE', '789 Shopping Center, Downtown', true),
('loc_factory_1', 'Manufacturing Plant', 'FACTORY', '321 Industrial Park, Factory Zone', true),
('loc_distribution_1', 'Central Distribution', 'DISTRIBUTION_CENTER', '654 Logistics Hub, Distribution Area', true);

-- Insert system configurations
INSERT INTO "SystemConfiguration" ("id", "key", "value", "description", "category", "isEditable") VALUES
('config_system_name', 'system_name', '"KavaPR Management System"', 'Name of the system', 'general', true),
('config_company_name', 'company_name', '"KavaPR Corporation"', 'Company name', 'general', true),
('config_max_login_attempts', 'max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', true),
('config_session_timeout', 'session_timeout', '3600', 'Session timeout in seconds', 'security', true),
('config_default_location_type', 'default_location_type', '"OFFICE"', 'Default location type for new users', 'user_management', true),
('config_require_manager_approval', 'require_manager_approval', 'true', 'Require manager approval for certain actions', 'workflow', true),
('config_audit_retention_days', 'audit_retention_days', '365', 'Days to retain audit logs', 'audit', true),
('config_enable_notifications', 'enable_notifications', 'true', 'Enable system notifications', 'notifications', true);

-- Insert comprehensive role permissions
INSERT INTO "RolePermission" ("id", "role", "resource", "permission", "locationTypes", "isActive") VALUES
-- SUPERADMIN permissions (full access to everything)
('perm_sa_users_admin', 'SUPERADMIN', 'users', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_sa_products_admin', 'SUPERADMIN', 'products', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_sa_transactions_admin', 'SUPERADMIN', 'transactions', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_sa_analytics_admin', 'SUPERADMIN', 'analytics', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_sa_system_admin', 'SUPERADMIN', 'system', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_sa_locations_admin', 'SUPERADMIN', 'locations', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),

-- FULLADMIN permissions (nearly full access, limited system config)
('perm_fa_users_admin', 'FULLADMIN', 'users', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_fa_products_admin', 'FULLADMIN', 'products', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_fa_transactions_admin', 'FULLADMIN', 'transactions', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_fa_analytics_admin', 'FULLADMIN', 'analytics', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_fa_system_read', 'FULLADMIN', 'system', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),
('perm_fa_locations_admin', 'FULLADMIN', 'locations', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER","SERVICE_CENTER","FRANCHISE_LOCATION","TEMPORARY_BOOTH","OTHER"}', true),

-- ADMIN permissions (location-specific admin access)
('perm_admin_users_write', 'ADMIN', 'users', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_admin_products_admin', 'ADMIN', 'products', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_admin_transactions_admin', 'ADMIN', 'transactions', 'ADMIN', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_admin_analytics_read', 'ADMIN', 'analytics', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_admin_locations_read', 'ADMIN', 'locations', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),

-- MANAGER permissions (department/location management)
('perm_mgr_users_read', 'MANAGER', 'users', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_mgr_products_write', 'MANAGER', 'products', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_mgr_transactions_write', 'MANAGER', 'transactions', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_mgr_analytics_read', 'MANAGER', 'analytics', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),

-- SUPERVISOR permissions (team supervision)
('perm_sup_users_read', 'SUPERVISOR', 'users', 'READ', '{"WAREHOUSE","RETAIL_STORE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_sup_products_write', 'SUPERVISOR', 'products', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_sup_transactions_write', 'SUPERVISOR', 'transactions', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_sup_analytics_read', 'SUPERVISOR', 'analytics', 'READ', '{"WAREHOUSE","RETAIL_STORE","FACTORY","DISTRIBUTION_CENTER"}', true),

-- COORDINATOR permissions (coordination tasks)
('perm_coord_products_write', 'COORDINATOR', 'products', 'WRITE', '{"WAREHOUSE","RETAIL_STORE","OFFICE","DISTRIBUTION_CENTER"}', true),
('perm_coord_transactions_read', 'COORDINATOR', 'transactions', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","DISTRIBUTION_CENTER"}', true),
('perm_coord_analytics_read', 'COORDINATOR', 'analytics', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","DISTRIBUTION_CENTER"}', true),

-- SPECIALIST permissions (specialized work)
('perm_spec_products_write', 'SPECIALIST', 'products', 'WRITE', '{"WAREHOUSE","FACTORY","SERVICE_CENTER"}', true),
('perm_spec_transactions_read', 'SPECIALIST', 'transactions', 'READ', '{"WAREHOUSE","FACTORY","SERVICE_CENTER"}', true),

-- ANALYST permissions (data analysis)
('perm_analyst_products_read', 'ANALYST', 'products', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_analyst_transactions_read', 'ANALYST', 'transactions', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),
('perm_analyst_analytics_read', 'ANALYST', 'analytics', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE","FACTORY","DISTRIBUTION_CENTER"}', true),

-- ASSISTANT permissions (support tasks)
('perm_assist_products_read', 'ASSISTANT', 'products', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE"}', true),
('perm_assist_transactions_read', 'ASSISTANT', 'transactions', 'READ', '{"WAREHOUSE","RETAIL_STORE","OFFICE"}', true),

-- INTERN permissions (limited access)
('perm_intern_products_read', 'INTERN', 'products', 'READ', '{"OFFICE","RETAIL_STORE"}', true),

-- CONTRACTOR permissions (project-specific)
('perm_contract_products_read', 'CONTRACTOR', 'products', 'READ', '{"WAREHOUSE","FACTORY","SERVICE_CENTER","TEMPORARY_BOOTH"}', true),
('perm_contract_transactions_read', 'CONTRACTOR', 'transactions', 'READ', '{"WAREHOUSE","FACTORY","SERVICE_CENTER","TEMPORARY_BOOTH"}', true);

-- Insert sample users with hierarchical structure
INSERT INTO "User" ("id", "name", "username", "email", "role", "locationType", "locationId", "department", "permissions", "isActive") VALUES
-- DEVELOPMENT SUPERADMIN (for development only)
('dev-admin-001', 'Development Admin', 'dev.admin', 'admin@admin.com', 'SUPERADMIN', 'OFFICE', 'loc_main_office', 'Development', '{"system:admin","users:admin","products:admin","transactions:admin","analytics:admin","locations:admin","configuration:admin","audit:admin"}', true),

-- SUPERADMIN
('user_superadmin_1', 'Sarah Chen', 'sarah.chen', 'sarah.chen@kavapr.com', 'SUPERADMIN', 'OFFICE', 'loc_main_office', 'Executive', '{"system:admin","users:admin","products:admin","transactions:admin","analytics:admin","locations:admin"}', true),

-- FULLADMIN
('user_fulladmin_1', 'Michael Rodriguez', 'michael.rodriguez', 'michael.rodriguez@kavapr.com', 'FULLADMIN', 'OFFICE', 'loc_main_office', 'Operations', '{"users:admin","products:admin","transactions:admin","analytics:admin","locations:admin"}', true),

-- ADMIN (location managers)
('user_admin_warehouse', 'Jennifer Wang', 'jennifer.wang', 'jennifer.wang@kavapr.com', 'ADMIN', 'WAREHOUSE', 'loc_warehouse_1', 'Warehouse Operations', '{"users:write","products:admin","transactions:admin","analytics:read"}', true),
('user_admin_retail', 'David Thompson', 'david.thompson', 'david.thompson@kavapr.com', 'ADMIN', 'RETAIL_STORE', 'loc_retail_store_1', 'Retail Operations', '{"users:write","products:admin","transactions:admin","analytics:read"}', true),
('user_admin_factory', 'Lisa Park', 'lisa.park', 'lisa.park@kavapr.com', 'ADMIN', 'FACTORY', 'loc_factory_1', 'Manufacturing', '{"users:write","products:admin","transactions:admin","analytics:read"}', true),

-- MANAGER (department heads)
('user_manager_sales', 'Robert Kim', 'robert.kim', 'robert.kim@kavapr.com', 'MANAGER', 'RETAIL_STORE', 'loc_retail_store_1', 'Sales', '{"products:write","transactions:write","analytics:read"}', true),
('user_manager_inventory', 'Amanda Foster', 'amanda.foster', 'amanda.foster@kavapr.com', 'MANAGER', 'WAREHOUSE', 'loc_warehouse_1', 'Inventory Management', '{"products:write","transactions:write","analytics:read"}', true),
('user_manager_production', 'Carlos Martinez', 'carlos.martinez', 'carlos.martinez@kavapr.com', 'MANAGER', 'FACTORY', 'loc_factory_1', 'Production', '{"products:write","transactions:write","analytics:read"}', true),

-- SUPERVISOR (team leads)
('user_supervisor_floor', 'Rachel Green', 'rachel.green', 'rachel.green@kavapr.com', 'SUPERVISOR', 'RETAIL_STORE', 'loc_retail_store_1', 'Floor Operations', '{"products:write","transactions:write"}', true),
('user_supervisor_shipping', 'Kevin Lee', 'kevin.lee', 'kevin.lee@kavapr.com', 'SUPERVISOR', 'WAREHOUSE', 'loc_warehouse_1', 'Shipping & Receiving', '{"products:write","transactions:write"}', true),

-- COORDINATOR
('user_coordinator_logistics', 'Maria Santos', 'maria.santos', 'maria.santos@kavapr.com', 'COORDINATOR', 'DISTRIBUTION_CENTER', 'loc_distribution_1', 'Logistics', '{"products:write","transactions:read","analytics:read"}', true),

-- SPECIALIST
('user_specialist_quality', 'James Wilson', 'james.wilson', 'james.wilson@kavapr.com', 'SPECIALIST', 'FACTORY', 'loc_factory_1', 'Quality Assurance', '{"products:write","transactions:read"}', true),

-- ANALYST
('user_analyst_data', 'Emma Johnson', 'emma.johnson', 'emma.johnson@kavapr.com', 'ANALYST', 'OFFICE', 'loc_main_office', 'Data Analytics', '{"products:read","transactions:read","analytics:read"}', true),

-- ASSISTANT
('user_assistant_admin', 'Tyler Brown', 'tyler.brown', 'tyler.brown@kavapr.com', 'ASSISTANT', 'OFFICE', 'loc_main_office', 'Administrative Support', '{"products:read","transactions:read"}', true),
('user_assistant_retail', 'Sophie Davis', 'sophie.davis', 'sophie.davis@kavapr.com', 'ASSISTANT', 'RETAIL_STORE', 'loc_retail_store_1', 'Customer Service', '{"products:read","transactions:read"}', true),

-- INTERN
('user_intern_summer', 'Alex Chen', 'alex.chen', 'alex.chen@kavapr.com', 'INTERN', 'OFFICE', 'loc_main_office', 'Summer Internship Program', '{"products:read"}', true),

-- CONTRACTOR
('user_contractor_it', 'Jordan Miller', 'jordan.miller', 'jordan.miller@contractor.com', 'CONTRACTOR', 'OFFICE', 'loc_main_office', 'IT Services', '{"products:read","transactions:read"}', true);

-- Set up manager relationships
UPDATE "User" SET "managerId" = 'user_superadmin_1' WHERE "id" = 'user_fulladmin_1';
UPDATE "User" SET "managerId" = 'user_fulladmin_1' WHERE "id" IN ('user_admin_warehouse', 'user_admin_retail', 'user_admin_factory');
UPDATE "User" SET "managerId" = 'user_admin_retail' WHERE "id" IN ('user_manager_sales', 'user_supervisor_floor', 'user_assistant_retail');
UPDATE "User" SET "managerId" = 'user_admin_warehouse' WHERE "id" IN ('user_manager_inventory', 'user_supervisor_shipping');
UPDATE "User" SET "managerId" = 'user_admin_factory' WHERE "id" IN ('user_manager_production', 'user_specialist_quality');
UPDATE "User" SET "managerId" = 'user_manager_sales' WHERE "id" = 'user_supervisor_floor';
UPDATE "User" SET "managerId" = 'user_fulladmin_1' WHERE "id" IN ('user_coordinator_logistics', 'user_analyst_data', 'user_assistant_admin', 'user_intern_summer', 'user_contractor_it');

-- Set location managers
UPDATE "Location" SET "managerId" = 'user_superadmin_1' WHERE "id" = 'loc_main_office';
UPDATE "Location" SET "managerId" = 'user_admin_warehouse' WHERE "id" = 'loc_warehouse_1';
UPDATE "Location" SET "managerId" = 'user_admin_retail' WHERE "id" = 'loc_retail_store_1';
UPDATE "Location" SET "managerId" = 'user_admin_factory' WHERE "id" = 'loc_factory_1';
UPDATE "Location" SET "managerId" = 'user_coordinator_logistics' WHERE "id" = 'loc_distribution_1';

-- Insert sample products with location assignments
INSERT INTO "ProductStock" ("id", "name", "imageProduct", "price", "stock", "cat", "locationId") VALUES
-- Warehouse inventory
('prod_laptop_dell_001', 'Dell Latitude 7420 Laptop', '/images/laptop-dell.jpg', 1299.99, 25, 'ELECTRO', 'loc_warehouse_1'),
('prod_monitor_lg_001', 'LG 27" 4K Monitor', '/images/monitor-lg.jpg', 399.99, 15, 'ELECTRO', 'loc_warehouse_1'),
('prod_coffee_premium_001', 'Premium Colombian Coffee Beans', '/images/coffee-premium.jpg', 24.99, 100, 'DRINK', 'loc_warehouse_1'),
('prod_shirt_polo_001', 'KavaPR Polo Shirt', '/images/shirt-polo.jpg', 45.99, 50, 'FASHION', 'loc_warehouse_1'),

-- Retail store inventory
('prod_tablet_samsung_001', 'Samsung Galaxy Tab S8', '/images/tablet-samsung.jpg', 699.99, 12, 'ELECTRO', 'loc_retail_store_1'),
('prod_headphones_sony_001', 'Sony WH-1000XM4 Headphones', '/images/headphones-sony.jpg', 349.99, 8, 'ELECTRO', 'loc_retail_store_1'),
('prod_energy_drink_001', 'KavaPR Energy Boost', '/images/energy-drink.jpg', 2.99, 200, 'DRINK', 'loc_retail_store_1'),
('prod_sandwich_001', 'Gourmet Deli Sandwich', '/images/sandwich.jpg', 8.99, 30, 'FOOD', 'loc_retail_store_1'),
('prod_jacket_001', 'KavaPR Corporate Jacket', '/images/jacket.jpg', 89.99, 20, 'FASHION', 'loc_retail_store_1'),

-- Factory products (raw materials/components)
('prod_component_cpu_001', 'Intel i7 Processor Component', '/images/cpu-component.jpg', 299.99, 40, 'ELECTRO', 'loc_factory_1'),
('prod_component_memory_001', '32GB DDR4 Memory Module', '/images/memory-component.jpg', 149.99, 60, 'ELECTRO', 'loc_factory_1');

-- Insert corresponding products for sale
INSERT INTO "Product" ("id", "productId", "sellprice", "locationId") VALUES
('sale_laptop_dell_001', 'prod_laptop_dell_001', 1499.99, 'loc_retail_store_1'),
('sale_monitor_lg_001', 'prod_monitor_lg_001', 449.99, 'loc_retail_store_1'),
('sale_coffee_premium_001', 'prod_coffee_premium_001', 29.99, 'loc_retail_store_1'),
('sale_shirt_polo_001', 'prod_shirt_polo_001', 55.99, 'loc_retail_store_1'),
('sale_tablet_samsung_001', 'prod_tablet_samsung_001', 799.99, 'loc_retail_store_1'),
('sale_headphones_sony_001', 'prod_headphones_sony_001', 399.99, 'loc_retail_store_1'),
('sale_energy_drink_001', 'prod_energy_drink_001', 3.49, 'loc_retail_store_1'),
('sale_sandwich_001', 'prod_sandwich_001', 12.99, 'loc_retail_store_1'),
('sale_jacket_001', 'prod_jacket_001', 109.99, 'loc_retail_store_1');

-- Insert shop data for different locations
INSERT INTO "ShopData" ("id", "tax", "name", "locationId") VALUES
('shop_main', 8, 'KavaPR Main Office', 'loc_main_office'),
('shop_warehouse', 8, 'KavaPR Warehouse', 'loc_warehouse_1'),
('shop_retail', 10, 'KavaPR Downtown Store', 'loc_retail_store_1'),
('shop_factory', 8, 'KavaPR Manufacturing', 'loc_factory_1'),
('shop_distribution', 8, 'KavaPR Distribution Center', 'loc_distribution_1');

-- Insert sample transactions
INSERT INTO "Transaction" ("id", "totalAmount", "isComplete", "userId", "locationId") VALUES
('trans_001', 1949.98, true, 'user_supervisor_floor', 'loc_retail_store_1'),
('trans_002', 32.48, true, 'user_assistant_retail', 'loc_retail_store_1'),
('trans_003', 799.99, true, 'user_supervisor_floor', 'loc_retail_store_1'),
('trans_004', 169.97, false, 'user_assistant_retail', 'loc_retail_store_1');

-- Insert corresponding sale items
INSERT INTO "OnSaleProduct" ("id", "productId", "quantity", "transactionId", "userId") VALUES
('sale_item_001', 'sale_laptop_dell_001', 1, 'trans_001', 'user_supervisor_floor'),
('sale_item_002', 'sale_monitor_lg_001', 1, 'trans_001', 'user_supervisor_floor'),
('sale_item_003', 'sale_coffee_premium_001', 1, 'trans_002', 'user_assistant_retail'),
('sale_item_004', 'sale_energy_drink_001', 1, 'trans_002', 'user_assistant_retail'),
('sale_item_005', 'sale_tablet_samsung_001', 1, 'trans_003', 'user_supervisor_floor'),
('sale_item_006', 'sale_headphones_sony_001', 1, 'trans_004', 'user_assistant_retail'),
('sale_item_007', 'sale_sandwich_001', 5, 'trans_004', 'user_assistant_retail');

-- Insert initial audit log entries
INSERT INTO "AuditLog" ("id", "userId", "action", "resource", "resourceId", "newData") VALUES
('audit_001', 'user_superadmin_1', 'CREATE', 'SystemConfiguration', 'config_system_name', '{"key": "system_name", "value": "KavaPR Management System"}'),
('audit_002', 'user_fulladmin_1', 'CREATE', 'Location', 'loc_main_office', '{"name": "KavaPR Main Office", "type": "OFFICE"}'),
('audit_003', 'user_admin_warehouse', 'CREATE', 'ProductStock', 'prod_laptop_dell_001', '{"name": "Dell Latitude 7420 Laptop", "price": 1299.99, "stock": 25}'),
('audit_004', 'user_supervisor_floor', 'CREATE', 'Transaction', 'trans_001', '{"totalAmount": 1949.98, "isComplete": true}');

-- Create a view for user hierarchy
CREATE OR REPLACE VIEW "UserHierarchy" AS
WITH RECURSIVE hierarchy AS (
  -- Base case: users without managers (top level)
  SELECT 
    "id",
    "name",
    "username",
    "email",
    "role",
    "managerId",
    "locationType",
    "locationId",
    "department",
    0 as level,
    ARRAY["id"] as path
  FROM "User"
  WHERE "managerId" IS NULL
  
  UNION ALL
  
  -- Recursive case: users with managers
  SELECT 
    u."id",
    u."name",
    u."username",
    u."email",
    u."role",
    u."managerId",
    u."locationType",
    u."locationId",
    u."department",
    h.level + 1,
    h.path || u."id"
  FROM "User" u
  JOIN hierarchy h ON u."managerId" = h."id"
)
SELECT * FROM hierarchy ORDER BY level, "name";

-- Create a function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  user_id TEXT,
  resource TEXT,
  permission_type TEXT,
  location_type TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_role "UserRole";
  user_location_type "LocationType";
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user role and location type
  SELECT "role", "locationType" INTO user_role, user_location_type
  FROM "User" WHERE "id" = user_id;
  
  -- Check if user has the specific permission
  SELECT EXISTS(
    SELECT 1 FROM "RolePermission" rp
    WHERE rp."role" = user_role
    AND rp."resource" = resource
    AND rp."permission"::TEXT = permission_type
    AND rp."isActive" = true
    AND (
      location_type IS NULL 
      OR user_location_type = ANY(rp."locationTypes")
      OR location_type::TEXT = ANY(SELECT unnest(rp."locationTypes")::TEXT)
    )
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user's subordinates
CREATE OR REPLACE FUNCTION get_user_subordinates(manager_id TEXT)
RETURNS TABLE(
  subordinate_id TEXT,
  subordinate_name TEXT,
  subordinate_role "UserRole",
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subordinates AS (
    -- Direct reports
    SELECT 
      u."id",
      u."name",
      u."role",
      1 as level
    FROM "User" u
    WHERE u."managerId" = manager_id
    
    UNION ALL
    
    -- Indirect reports
    SELECT 
      u."id",
      u."name", 
      u."role",
      s.level + 1
    FROM "User" u
    JOIN subordinates s ON u."managerId" = s.subordinate_id
  )
  SELECT * FROM subordinates ORDER BY level, subordinate_name;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION audit_log_trigger() RETURNS TRIGGER AS $$
DECLARE
  current_user_id TEXT;
BEGIN
  -- Try to get current user from request headers or session
  current_user_id := current_setting('request.jwt.claims', true)::json->>'user_id';
  
  IF current_user_id IS NULL THEN
    current_user_id := 'system';
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "AuditLog" ("id", "userId", "action", "resource", "resourceId", "newData")
    VALUES (
      'audit_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 8),
      current_user_id,
      'CREATE',
      TG_TABLE_NAME,
      NEW."id",
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO "AuditLog" ("id", "userId", "action", "resource", "resourceId", "oldData", "newData")
    VALUES (
      'audit_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 8),
      current_user_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW."id",
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO "AuditLog" ("id", "userId", "action", "resource", "resourceId", "oldData")
    VALUES (
      'audit_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 8),
      current_user_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD."id",
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
CREATE TRIGGER audit_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON "User"
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_product_changes
  AFTER INSERT OR UPDATE OR DELETE ON "ProductStock"
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_transaction_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Transaction"
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_system_config_changes
  AFTER INSERT OR UPDATE OR DELETE ON "SystemConfiguration"
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();