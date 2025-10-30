# Service Exchange System

This system replaces the traditional hourly rate model with a project-based service exchange where:

1. **Services are defined** with clear parameters: start time, duration range, specifications, and instructions
2. **Locations offer specific amounts** for services rather than hourly rates
3. **Associates can accept or reject** these service offers based on their availability and preferences

## System Overview

### Key Components

#### 1. Service Definitions
- **Service Templates**: Standardized service definitions that can be offered across locations
- **Duration Ranges**: Minimum, maximum, and estimated hours rather than fixed hourly rates
- **Requirements**: Skills, certifications, equipment, and materials needed
- **Instructions**: Detailed execution guidelines and completion criteria
- **Complexity Levels**: Basic, Intermediate, Advanced, Expert

#### 2. Service Offers
- **Location-Specific**: Each location creates offers based on their needs
- **Fixed Compensation**: Specific amounts offered rather than hourly calculations
- **Timing Flexibility**: Preferred start times with acceptable ranges
- **Urgency Levels**: Routine, Priority, Urgent, Emergency
- **Requirements**: Location-specific needs and associate qualifications

#### 3. Service Agreements
- **Application Process**: Associates apply for specific offers
- **Negotiation**: Terms can be adjusted within reasonable limits
- **Status Tracking**: Proposed → Accepted → Active → Completed
- **Performance Monitoring**: Progress tracking and quality checkpoints

#### 4. Service Execution
- **Real-time Tracking**: Progress updates, time logging, milestone completion
- **Quality Control**: Checkpoints, feedback, and issue reporting
- **Resource Management**: Equipment usage, materials consumed, expenses

## Database Schema

### Core Tables

- **Services**: Service definitions and templates
- **ServiceOffers**: Location-specific service requests
- **ServiceAgreements**: Contracts between locations and associates
- **ServiceExecution**: Real-time service delivery tracking
- **ServiceReviews**: Feedback and ratings from both parties

### Key Features

- **Role-based Access**: Different interfaces for System Admins, Central Operations, Location Managers, and Associates
- **Flexible Pricing**: Fixed amounts, hourly-capped, milestone-based, or performance-based compensation
- **Quality Assurance**: Built-in review system and progress monitoring
- **Resource Tracking**: Equipment, materials, and expense management

## API Endpoints

### Services Management
- `GET /api/services` - List all services with filtering
- `POST /api/services` - Create new service definition
- `PUT /api/services` - Update existing service
- `DELETE /api/services` - Deactivate service

### Service Offers
- `GET /api/service-offers` - List offers with location/associate filtering
- `POST /api/service-offers` - Create new service offer
- `PUT /api/service-offers` - Update offer details
- `DELETE /api/service-offers` - Cancel service offer

### Service Agreements
- `GET /api/service-agreements` - List agreements with filtering
- `POST /api/service-agreements` - Apply for service offer
- `PUT /api/service-agreements` - Update agreement status (approve, start, complete)
- `DELETE /api/service-agreements` - Cancel agreement

### Service Execution
- `GET /api/service-execution` - Get execution details
- `PUT /api/service-execution` - Update progress, log time, report issues
- `POST /api/service-execution` - Add progress reports

## User Interfaces

### System Admin / Central Operations
- **Service Dashboard**: Manage service definitions across the organization
- **System Analytics**: Monitor performance metrics and usage patterns
- **Policy Management**: Set organization-wide service policies

### Location Managers
- **Service Offerings**: Browse services and create location-specific offers
- **Agreement Management**: Review applications and manage active services
- **Performance Tracking**: Monitor service quality and associate performance

### Associates
- **Service Opportunities**: Browse and apply for available service offers
- **My Services**: Track active agreements and update progress
- **Earnings Dashboard**: Monitor completed services and payments

## Installation & Setup

1. **Database Setup**:
   ```bash
   # Add service exchange models to your Prisma schema
   npx prisma db push
   
   # Seed with demo data
   psql -d your_database -f seed-service-exchange.sql
   ```

2. **Environment Variables**:
   ```env
   # Your existing database configuration
   DATABASE_URL="your_connection_string"
   ```

3. **Navigation**:
   The system adds a "Services" menu item to your existing navigation.

## Usage Examples

### Creating a Service Definition
```typescript
const service = {
  serviceName: "Kitchen Deep Cleaning",
  serviceCode: "KITCHEN-CLEAN-01",
  category: "CLEANING_MAINTENANCE",
  complexity: "INTERMEDIATE",
  shortDescription: "Complete deep cleaning of commercial kitchen",
  estimatedDurationHours: 4.0,
  durationRangeMinHours: 3.0,
  durationRangeMaxHours: 6.0,
  executionInstructions: "Clean from top to bottom...",
  suggestedBaseRate: 75.00
}
```

### Location Creating an Offer
```typescript
const offer = {
  serviceId: "service_id",
  locationId: "location_downtown",
  preferredStartDate: "2024-10-26",
  preferredStartTime: "08:00",
  offeredAmount: 85.00,
  urgency: "PRIORITY",
  customInstructions: "Focus on grill area, health inspection Monday"
}
```

### Associate Applying
```typescript
const application = {
  serviceOfferId: "offer_id",
  associateId: "associate_id",
  agreedAmount: 85.00,
  agreedStartTime: "2024-10-26T08:00:00",
  proposalMessage: "I have 3 years experience with commercial kitchen cleaning..."
}
```

## Benefits of the New System

### For Locations
- **Predictable Costs**: Fixed service amounts instead of variable hourly rates
- **Clear Deliverables**: Defined expectations and completion criteria
- **Quality Assurance**: Built-in progress tracking and review system
- **Flexible Scheduling**: Associates can work within preferred time ranges

### For Associates
- **Project-Based Work**: Complete services rather than clock hours
- **Rate Negotiation**: Ability to propose rates within reasonable ranges
- **Skill Development**: Clear service requirements encourage skill building
- **Performance Recognition**: Review system builds reputation

### For Organization
- **Standardization**: Consistent service definitions across locations
- **Efficiency**: Reduced administrative overhead of hourly tracking
- **Scalability**: Easy to add new service types and locations
- **Analytics**: Better insights into service needs and performance

## Future Enhancements

- **Skills Certification System**: Track and verify associate qualifications
- **Automated Matching**: AI-powered matching of associates to suitable services
- **Mobile App**: Native mobile interface for associates
- **Advanced Analytics**: Predictive analytics for service demand
- **Integration APIs**: Connect with external scheduling and payroll systems