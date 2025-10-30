// Service Exchange System Types

export interface Service {
  id: string;
  serviceName: string;
  serviceCode: string;
  category: ServiceCategory;
  complexity: ServiceComplexity;
  shortDescription: string;
  detailedDescription?: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  estimatedDurationHours: number;
  durationRangeMinHours: number;
  durationRangeMaxHours: number;
  requiresSpecificStartTime: boolean;
  canBeSplitAcrossDays: boolean;
  requiresContinuousWork: boolean;
  preparationInstructions?: string;
  executionInstructions: string;
  completionRequirements?: string;
  qualityStandards?: string;
  expectedDeliverables: string[];
  successCriteria: string[];
  requiredEquipment: string[];
  requiredMaterials: string[];
  locationRequirements?: string;
  suggestedBaseRate?: number;
  complexityMultiplier: number;
  isActive: boolean;
  requiresApproval: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
  serviceOffers?: ServiceOffer[];
}

export interface ServiceOffer {
  id: string;
  serviceId: string;
  service: Service;
  locationId: string;
  offerTitle?: string;
  customInstructions?: string;
  preferredStartDate: string;
  preferredStartTime?: string;
  latestStartDate?: string;
  mustCompleteBy?: string;
  canStartAnytimeInRange: boolean;
  acceptableStartTimes: string[];
  offeredAmount: number;
  paymentStructure: PaymentStructure;
  hourlyRate?: number;
  maxHours?: number;
  bonusConditions?: any;
  expenseReimbursement: boolean;
  customDurationEstimate?: number;
  locationSpecificRequirements: string[];
  additionalEquipmentProvided: string[];
  minimumExperienceLevel: number;
  requiredLocationExperience: boolean;
  preferredAssociates: string[];
  excludedAssociates: string[];
  offerStatus: OfferStatus;
  urgency: ServiceUrgency;
  maxApplicants: number;
  currentApplicants: number;
  postedBy: string;
  postedAt: string;
  expiresAt?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  serviceAgreements?: ServiceAgreement[];
}

export interface ServiceAgreement {
  id: string;
  serviceOfferId: string;
  serviceOffer: ServiceOffer;
  associateId: string;
  locationId: string;
  agreedAmount: number;
  agreedStartTime: string;
  estimatedCompletionTime: string;
  specificInstructions?: string;
  agreedDeliverables: string[];
  qualityRequirements?: string;
  cancellationPolicy?: string;
  latePenaltyTerms?: string;
  qualityGuaranteeTerms?: string;
  agreementStatus: AgreementStatus;
  associateAcceptedAt?: string;
  locationApprovedAt?: string;
  approvedBy?: string;
  negotiationNotes: string[];
  revisedTerms?: any[];
  actualStartTime?: string;
  actualCompletionTime?: string;
  finalAmountPaid?: number;
  createdAt: string;
  updatedAt: string;
  serviceExecution?: ServiceExecution;
  serviceReviews?: ServiceReview[];
}

export interface ServiceExecution {
  id: string;
  serviceAgreementId: string;
  serviceAgreement: ServiceAgreement;
  startedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  completedAt?: string;
  completionPercentage: number;
  currentPhase?: string;
  milestonesCompleted: string[];
  qualityCheckpoints: any[];
  performanceNotes: string[];
  issuesEncountered: string[];
  equipmentUsed: string[];
  materialsConsumed?: any;
  additionalResourcesNeeded: string[];
  associateNotes: string[];
  progressReports: any[];
  locationFeedback: string[];
  satisfactionRating?: number;
  hoursLogged?: number;
  expensesIncurred?: number;
  bonusEarned?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReview {
  id: string;
  serviceAgreementId: string;
  serviceAgreement: ServiceAgreement;
  reviewerId: string;
  reviewerType: 'LOCATION' | 'ASSOCIATE';
  overallRating: number;
  qualityRating?: number;
  timelinessRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  writtenReview?: string;
  positiveAspects: string[];
  areasForImprovement: string[];
  wouldWorkAgain?: boolean;
  wouldRecommend?: boolean;
  isVerified: boolean;
  reviewHelpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

// Enum types
export type ServiceCategory = 
  | 'FOOD_PREPARATION'
  | 'CUSTOMER_SERVICE'
  | 'CLEANING_MAINTENANCE'
  | 'INVENTORY_MANAGEMENT'
  | 'SETUP_BREAKDOWN'
  | 'DELIVERY_LOGISTICS'
  | 'ADMINISTRATIVE'
  | 'TRAINING_SUPPORT'
  | 'MARKETING_PROMOTION'
  | 'TECHNICAL_SUPPORT';

export type ServiceComplexity = 
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export type ServiceUrgency = 
  | 'ROUTINE'
  | 'PRIORITY'
  | 'URGENT'
  | 'EMERGENCY';

export type OfferStatus = 
  | 'OPEN'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type AgreementStatus = 
  | 'PROPOSED'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStructure = 
  | 'FIXED'
  | 'HOURLY_CAPPED'
  | 'MILESTONE'
  | 'PERFORMANCE';

// API Response types
export interface ServiceResponse {
  success: boolean;
  data?: Service | Service[];
  error?: string;
  message?: string;
  count?: number;
}

export interface ServiceOfferResponse {
  success: boolean;
  data?: ServiceOffer | ServiceOffer[];
  error?: string;
  message?: string;
  count?: number;
}

export interface ServiceAgreementResponse {
  success: boolean;
  data?: ServiceAgreement | ServiceAgreement[];
  error?: string;
  message?: string;
  count?: number;
}

export interface ServiceExecutionResponse {
  success: boolean;
  data?: ServiceExecution | ServiceExecution[];
  error?: string;
  message?: string;
  count?: number;
}

// Form types for components
export interface ServiceFormData {
  serviceName: string;
  serviceCode: string;
  category: ServiceCategory;
  complexity: ServiceComplexity;
  shortDescription: string;
  detailedDescription?: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  estimatedDurationHours: number;
  durationRangeMinHours: number;
  durationRangeMaxHours: number;
  requiresSpecificStartTime: boolean;
  canBeSplitAcrossDays: boolean;
  requiresContinuousWork: boolean;
  preparationInstructions?: string;
  executionInstructions: string;
  completionRequirements?: string;
  qualityStandards?: string;
  expectedDeliverables: string[];
  successCriteria: string[];
  requiredEquipment: string[];
  requiredMaterials: string[];
  locationRequirements?: string;
  suggestedBaseRate?: number;
  complexityMultiplier: number;
  requiresApproval: boolean;
}

export interface ServiceOfferFormData {
  offerTitle?: string;
  customInstructions?: string;
  preferredStartDate: string;
  preferredStartTime?: string;
  latestStartDate?: string;
  mustCompleteBy?: string;
  canStartAnytimeInRange: boolean;
  acceptableStartTimes: string[];
  offeredAmount: number;
  paymentStructure: PaymentStructure;
  hourlyRate?: number;
  maxHours?: number;
  bonusConditions?: any;
  expenseReimbursement: boolean;
  customDurationEstimate?: number;
  locationSpecificRequirements: string[];
  additionalEquipmentProvided: string[];
  minimumExperienceLevel: number;
  requiredLocationExperience: boolean;
  preferredAssociates: string[];
  excludedAssociates: string[];
  urgency: ServiceUrgency;
  maxApplicants: number;
  expiresAt?: string;
  internalNotes?: string;
}

export interface ServiceApplicationFormData {
  proposalMessage: string;
  agreedAmount: number;
  agreedStartTime: string;
  estimatedDurationHours: number;
  specificInstructions?: string;
  agreedDeliverables: string[];
  qualityRequirements?: string;
  cancellationPolicy?: string;
  latePenaltyTerms?: string;
  qualityGuaranteeTerms?: string;
}

// Utility types
export interface CategoryOption {
  value: ServiceCategory;
  label: string;
  description?: string;
}

export interface ComplexityOption {
  value: ServiceComplexity;
  label: string;
  description: string;
  color: string;
}

export interface UrgencyOption {
  value: ServiceUrgency;
  label: string;
  color: string;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  servicesWithOffers: number;
  categories: number;
  totalOffers: number;
  activeOffers: number;
  pendingOffers: number;
  inProgressOffers: number;
  completedOffers: number;
  totalBudget: number;
  activeAgreements: number;
  completedAgreements: number;
  totalEarnings: number;
}