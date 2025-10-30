-- Demo data for service exchange system
-- Run this after setting up the schema to see the system in action

-- Insert sample services
INSERT INTO "Service" (id, "serviceName", "serviceCode", category, complexity, "shortDescription", "detailedDescription", "requiredSkills", "requiredCertifications", "estimatedDurationHours", "durationRangeMinHours", "durationRangeMaxHours", "executionInstructions", "expectedDeliverables", "successCriteria", "requiredEquipment", "requiredMaterials", "suggestedBaseRate", "isActive", "createdAt", "updatedAt") VALUES
('svc_001', 'Kitchen Deep Cleaning', 'KITCHEN-CLEAN-01', 'CLEANING_MAINTENANCE', 'INTERMEDIATE', 'Complete deep cleaning of commercial kitchen facilities', 'Thorough sanitization and deep cleaning of all kitchen equipment, surfaces, and storage areas following health department standards.', ARRAY['Commercial Cleaning', 'Food Safety', 'Equipment Handling'], ARRAY['Food Handler''s License'], 4.0, 3.0, 6.0, 'Start by clearing all equipment. Clean from top to bottom. Sanitize all surfaces. Document completion with checklist.', ARRAY['Clean equipment inventory', 'Sanitization log', 'Photo documentation'], ARRAY['All surfaces pass sanitation test', 'Health inspection ready'], ARRAY['Commercial cleaners', 'Sanitizer', 'Cleaning cloths', 'Scrub brushes'], ARRAY['Degreaser', 'Sanitizing solution', 'Paper towels'], 75.00, true, NOW(), NOW()),

('svc_002', 'Customer Service Coverage', 'CUST-SERVICE-01', 'CUSTOMER_SERVICE', 'BASIC', 'Provide front-of-house customer service coverage', 'Handle customer inquiries, process orders, manage transactions, and maintain positive customer experience during peak hours or staff shortages.', ARRAY['Customer Service', 'POS Systems', 'Cash Handling'], ARRAY[], 3.0, 2.0, 8.0, 'Greet customers warmly. Process orders accurately. Handle complaints professionally. Maintain clean workspace.', ARRAY['Order accuracy report', 'Customer feedback summary'], ARRAY['95% order accuracy', 'No customer complaints'], ARRAY['POS terminal', 'Cash register'], ARRAY[], 45.00, true, NOW(), NOW()),

('svc_003', 'Inventory Count & Organization', 'INVENTORY-COUNT-01', 'INVENTORY_MANAGEMENT', 'ADVANCED', 'Complete inventory audit and reorganization', 'Conduct full inventory count, verify stock levels, organize storage areas, and update inventory management system with accurate counts.', ARRAY['Inventory Management', 'Data Entry', 'Organization'], ARRAY[], 5.0, 4.0, 8.0, 'Count all items systematically. Verify against system records. Organize by category and expiration date. Update inventory system.', ARRAY['Complete inventory report', 'Organized storage areas', 'Updated system records'], ARRAY['100% items counted', 'System accuracy >98%', 'Storage optimized'], ARRAY['Scanner/tablet', 'Counting sheets'], ARRAY['Labels', 'Storage containers'], 90.00, true, NOW(), NOW()),

('svc_004', 'Event Setup & Breakdown', 'EVENT-SETUP-01', 'SETUP_BREAKDOWN', 'INTERMEDIATE', 'Setup and breakdown for special events', 'Complete setup of furniture, decorations, equipment for events. Post-event breakdown and cleanup. Ensure all items are properly stored.', ARRAY['Event Setup', 'Heavy Lifting', 'Organization'], ARRAY[], 6.0, 4.0, 10.0, 'Arrive early for setup. Follow event layout plan. Test all equipment. Post-event, clean and store all items properly.', ARRAY['Event ready space', 'All equipment functional', 'Clean breakdown'], ARRAY['Event starts on time', 'No equipment issues', 'All items stored'], ARRAY['Tables', 'Chairs', 'Audio equipment'], ARRAY['Tablecloths', 'Decorations'], 80.00, true, NOW(), NOW()),

('svc_005', 'Training Session Facilitation', 'TRAINING-FACILITATE-01', 'TRAINING_SUPPORT', 'EXPERT', 'Lead training sessions for new associates', 'Facilitate comprehensive training sessions covering procedures, safety, customer service, and systems. Assess trainee progress and provide feedback.', ARRAY['Training', 'Public Speaking', 'Assessment'], ARRAY['Trainer Certification'], 4.0, 3.0, 6.0, 'Prepare training materials. Engage trainees with interactive sessions. Conduct assessments. Provide constructive feedback.', ARRAY['Training completion certificates', 'Assessment results', 'Feedback reports'], ARRAY['All trainees pass assessment', 'Positive feedback scores >4/5'], ARRAY['Projector', 'Training materials'], ARRAY['Handouts', 'Assessment forms'], 120.00, true, NOW(), NOW());

-- Insert sample service offers (these would normally be created by locations)
INSERT INTO "ServiceOffer" (id, "serviceId", "locationId", "offerTitle", "customInstructions", "preferredStartDate", "preferredStartTime", "offeredAmount", "paymentStructure", "urgency", "maxApplicants", "postedBy", "postedAt", "createdAt", "updatedAt") VALUES
('offer_001', 'svc_001', 'location_downtown', 'Downtown Kitchen Deep Clean - Weekend', 'Focus extra attention on the grill area and walk-in cooler. Health inspection is Monday.', '2024-10-26', '08:00', 85.00, 'FIXED', 'PRIORITY', 1, 'user_manager_001', NOW(), NOW(), NOW()),

('offer_002', 'svc_002', 'location_mall', 'Mall Location Lunch Rush Coverage', 'Need coverage during lunch rush 11am-3pm. Must be familiar with our POS system.', '2024-10-25', '11:00', 50.00, 'FIXED', 'ROUTINE', 1, 'user_manager_002', NOW(), NOW(), NOW()),

('offer_003', 'svc_003', 'location_downtown', 'Monthly Inventory Audit', 'Full inventory count needed for month-end reporting. Access to storage room and office required.', '2024-10-27', '06:00', 95.00, 'FIXED', 'ROUTINE', 1, 'user_manager_001', NOW(), NOW(), NOW()),

('offer_004', 'svc_004', 'location_events', 'Wedding Reception Setup', 'Large wedding reception for 150 guests. Setup starts at 2pm, event at 6pm. Breakdown after 11pm.', '2024-10-28', '14:00', 150.00, 'FIXED', 'PRIORITY', 2, 'user_manager_003', NOW(), NOW(), NOW()),

('offer_005', 'svc_005', 'location_downtown', 'New Hire Training Session', 'Train 3 new associates on food safety and customer service procedures. Materials provided.', '2024-10-29', '10:00', 130.00, 'FIXED', 'ROUTINE', 1, 'user_manager_001', NOW(), NOW(), NOW());

-- Insert sample service agreements (associates applying/accepting offers)
INSERT INTO "ServiceAgreement" (id, "serviceOfferId", "associateId", "locationId", "agreedAmount", "agreedStartTime", "estimatedCompletionTime", "agreementStatus", "associateAcceptedAt", "locationApprovedAt", "approvedBy", "createdAt", "updatedAt") VALUES
('agreement_001', 'offer_001', 'associate_001', 'location_downtown', 85.00, '2024-10-26 08:00:00', '2024-10-26 12:00:00', 'ACCEPTED', '2024-10-24 10:30:00', '2024-10-24 14:15:00', 'user_manager_001', NOW(), NOW()),

('agreement_002', 'offer_002', 'associate_002', 'location_mall', 50.00, '2024-10-25 11:00:00', '2024-10-25 15:00:00', 'ACTIVE', '2024-10-24 09:15:00', '2024-10-24 11:30:00', 'user_manager_002', NOW(), NOW()),

('agreement_003', 'offer_003', 'associate_003', 'location_downtown', 100.00, '2024-10-27 06:00:00', '2024-10-27 11:00:00', 'PROPOSED', '2024-10-24 16:45:00', NULL, NULL, NOW(), NOW()),

('agreement_004', 'offer_004', 'associate_001', 'location_events', 150.00, '2024-10-28 14:00:00', '2024-10-29 01:00:00', 'ACCEPTED', '2024-10-24 12:00:00', '2024-10-24 15:30:00', 'user_manager_003', NOW(), NOW()),

('agreement_005', 'offer_004', 'associate_004', 'location_events', 150.00, '2024-10-28 14:00:00', '2024-10-29 01:00:00', 'ACCEPTED', '2024-10-24 13:15:00', '2024-10-24 15:30:00', 'user_manager_003', NOW(), NOW());

-- Insert sample service execution records
INSERT INTO "ServiceExecution" (id, "serviceAgreementId", "startedAt", "completionPercentage", "currentPhase", "associateNotes", "hoursLogged", "createdAt", "updatedAt") VALUES
('exec_001', 'agreement_002', '2024-10-25 11:00:00', 75, 'Lunch rush coverage - peak period', ARRAY['Started shift on time', 'Handled 45 customers in first 2 hours', 'POS system working well'], 3.0, NOW(), NOW());

-- Insert sample service reviews
INSERT INTO "ServiceReview" (id, "serviceAgreementId", "reviewerId", "reviewerType", "overallRating", "qualityRating", "timelinessRating", "communicationRating", "writtenReview", "positiveAspects", "createdAt", "updatedAt") VALUES
('review_001', 'agreement_001', 'user_manager_001', 'LOCATION', 5, 5, 5, 4, 'Excellent work! Kitchen was spotless and ready for health inspection. Very thorough and professional.', ARRAY['Attention to detail', 'Professional attitude', 'Thorough cleaning'], NOW(), NOW()),

('review_002', 'agreement_001', 'associate_001', 'ASSOCIATE', 4, 4, 5, 5, 'Clear instructions and well-organized job. Manager was very helpful and provided all necessary supplies.', ARRAY['Clear expectations', 'Good communication', 'Supplies provided'], NOW(), NOW());