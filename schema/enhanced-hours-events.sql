-- Enhanced Location Operating Hours and Event Management Schema

-- Operating Hours Exceptions (holidays, special events, maintenance)
CREATE TABLE "OperatingHoursException" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "exceptionType" TEXT NOT NULL, -- 'CLOSED', 'SPECIAL_HOURS', 'HOLIDAY', 'MAINTENANCE', 'EVENT'
    "openTime" TIME,
    "closeTime" TIME,
    "reason" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN DEFAULT false, -- For annual holidays
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperatingHoursException_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OperatingHoursException_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE,
    CONSTRAINT "OperatingHoursException_unique" UNIQUE ("locationId", "date")
);

-- Event Information for Pop-ups and Partner Venues
CREATE TABLE "LocationEvent" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDescription" TEXT,
    "eventType" TEXT NOT NULL, -- 'POPUP', 'KAVA_NIGHT', 'PRIVATE_PARTY', 'FESTIVAL', 'PARTNERSHIP'
    "organizer" TEXT, -- Name of organizer/tender
    "hostVenue" TEXT, -- For partner venues
    "hostVenueAddress" TEXT,
    "hostVenueContact" JSON, -- Contact info for host venue
    "eventDate" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "setupTime" TIME, -- When staff should arrive for setup
    "cleanupTime" TIME, -- Expected cleanup completion
    "expectedAttendance" INTEGER,
    "ticketPrice" DECIMAL(10,2),
    "eventUrl" TEXT, -- Link to event page/tickets
    "socialMediaLinks" JSON, -- Instagram, Facebook, etc.
    "specialInstructions" TEXT,
    "equipmentNeeded" TEXT[],
    "staffRequired" INTEGER,
    "authorizedTenders" TEXT[], -- List of authorized tender IDs
    "eventStatus" TEXT DEFAULT 'PLANNED', -- 'PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocationEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LocationEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
);

-- Enhanced Location table structure for better hours management
-- Note: This extends the existing Location table with additional JSON structure guidelines

-- Standard operating hours structure for Location.operatingHours JSON field:
/*
{
  "monday": { "isOpen": true, "open": "07:00", "close": "18:00" },
  "tuesday": { "isOpen": true, "open": "07:00", "close": "18:00" },
  "wednesday": { "isOpen": true, "open": "07:00", "close": "18:00" },
  "thursday": { "isOpen": true, "open": "07:00", "close": "18:00" },
  "friday": { "isOpen": true, "open": "07:00", "close": "20:00" },
  "saturday": { "isOpen": true, "open": "08:00", "close": "20:00" },
  "sunday": { "isOpen": false, "open": null, "close": null },
  "timezone": "America/New_York",
  "lastUpdated": "2025-10-18T00:00:00Z"
}
*/

-- Event-specific settings structure for Location.settings JSON field:
/*
{
  "allowOnlineOrdering": true,
  "acceptsCash": true,
  "acceptsCard": true,
  "hasWifi": true,
  "eventSpecific": {
    "requiresSetup": true,
    "maxCapacity": 150,
    "hasParking": true,
    "isOutdoor": false,
    "needsPermits": ["liquor", "event"],
    "insuranceRequired": true
  }
}
*/

-- Authorized Tenders for Events (links to staff management)
CREATE TABLE "AuthorizedTender" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "locationId" TEXT,
    "certificationLevel" TEXT NOT NULL, -- 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTER'
    "specialties" TEXT[], -- 'KAVA_PREPARATION', 'KRATOM_KNOWLEDGE', 'EVENT_MANAGEMENT', 'CUSTOMER_SERVICE'
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canOrganizeEvents" BOOLEAN DEFAULT false,
    "maxEventSize" INTEGER, -- Maximum attendees they can handle
    "certificationDate" TIMESTAMP(3) NOT NULL,
    "certificationExpiry" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "AuthorizedTender_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuthorizedTender_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "LocationStaff"("id") ON DELETE CASCADE,
    CONSTRAINT "AuthorizedTender_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL
);

-- Event Equipment Tracking
CREATE TABLE "EventEquipment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL, -- 'KAVA_STRAINER', 'PORTABLE_BAR', 'SOUND_SYSTEM', 'TABLES', 'CHAIRS'
    "quantity" INTEGER NOT NULL,
    "condition" TEXT DEFAULT 'GOOD', -- 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR'
    "checkedOut" TIMESTAMP(3),
    "checkedIn" TIMESTAMP(3),
    "checkedOutBy" TEXT, -- Staff ID
    "notes" TEXT,
    CONSTRAINT "EventEquipment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EventEquipment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "LocationEvent"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX "OperatingHoursException_locationId_date_idx" ON "OperatingHoursException"("locationId", "date");
CREATE INDEX "LocationEvent_eventDate_status_idx" ON "LocationEvent"("eventDate", "eventStatus");
CREATE INDEX "LocationEvent_eventType_idx" ON "LocationEvent"("eventType");
CREATE INDEX "AuthorizedTender_certificationLevel_idx" ON "AuthorizedTender"("certificationLevel");

-- Sample data for different location types
INSERT INTO "OperatingHoursException" ("id", "locationId", "date", "exceptionType", "reason") VALUES
('exc-holiday-thanksgiving', 'default-location', '2025-11-27', 'CLOSED', 'Thanksgiving Holiday'),
('exc-holiday-christmas', 'default-location', '2025-12-25', 'CLOSED', 'Christmas Day'),
('exc-maintenance-deep-clean', 'default-location', '2025-11-15', 'CLOSED', 'Deep cleaning and equipment maintenance');

-- Sample popup event
INSERT INTO "LocationEvent" ("id", "locationId", "eventName", "eventDescription", "eventType", "organizer", "eventDate", "startTime", "endTime", "setupTime", "expectedAttendance", "eventStatus") VALUES
('evt-popup-farmers-market', 'default-location', 'Farmers Market Kava Pop-up', 'Weekly kava and kratom popup at the downtown farmers market', 'POPUP', 'Sarah Johnson', '2025-10-26', '09:00', '15:00', '08:00', 50, 'CONFIRMED');

-- Sample partner venue event
INSERT INTO "LocationEvent" ("id", "locationId", "eventName", "eventDescription", "eventType", "organizer", "hostVenue", "hostVenueAddress", "eventDate", "startTime", "endTime", "expectedAttendance", "ticketPrice", "eventStatus") VALUES
('evt-kava-night-brewery', 'default-location', 'Kava Night at Local Brewery', 'Monthly kava tasting and education event', 'KAVA_NIGHT', 'Mike Chen', 'Craft Beer Co.', '123 Brewery St, Downtown', '2025-11-02', '19:00', '23:00', 75, 15.00, 'PLANNED');