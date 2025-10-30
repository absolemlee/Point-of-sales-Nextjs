import { UserRole, CatProduct, ServiceCategory, ServiceComplexity, ServiceUrgency, OfferStatus, AgreementStatus, PaymentStructure, DeviceType, DeviceStatus, SessionStatus, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';



export function fakeUser() {
  return {
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    email: undefined,
    emailVerified: undefined,
    image: undefined,
    password: undefined,
  };
}
export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    email: undefined,
    emailVerified: undefined,
    image: undefined,
    password: undefined,
    role: UserRole.UNKNOW,
  };
}
export function fakeProductStock() {
  return {
    name: faker.person.fullName(),
    imageProduct: undefined,
    price: faker.number.float(),
    stock: faker.number.float(),
    cat: faker.helpers.arrayElement([CatProduct.ELECTRO, CatProduct.DRINK, CatProduct.FOOD, CatProduct.FASHION] as const),
  };
}
export function fakeProductStockComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    imageProduct: undefined,
    price: faker.number.float(),
    stock: faker.number.float(),
    cat: faker.helpers.arrayElement([CatProduct.ELECTRO, CatProduct.DRINK, CatProduct.FOOD, CatProduct.FASHION] as const),
  };
}
export function fakeProduct() {
  return {
    sellprice: faker.number.float(),
  };
}
export function fakeProductComplete() {
  return {
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    sellprice: faker.number.float(),
  };
}
export function fakeOnSaleProduct() {
  return {
    quantity: faker.number.int(),
  };
}
export function fakeOnSaleProductComplete() {
  return {
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    quantity: faker.number.int(),
    saledate: new Date(),
    transactionId: faker.string.uuid(),
  };
}
export function fakeTransaction() {
  return {
    totalAmount: undefined,
  };
}
export function fakeTransactionComplete() {
  return {
    id: faker.string.uuid(),
    totalAmount: undefined,
    createdAt: new Date(),
    isComplete: false,
  };
}
export function fakeShopData() {
  return {
    tax: undefined,
    name: undefined,
  };
}
export function fakeShopDataComplete() {
  return {
    id: faker.string.uuid(),
    tax: undefined,
    name: undefined,
  };
}
export function fakeService() {
  return {
    serviceName: faker.lorem.words(5),
    serviceCode: faker.lorem.words(5),
    category: faker.helpers.arrayElement([ServiceCategory.FOOD_PREPARATION, ServiceCategory.CUSTOMER_SERVICE, ServiceCategory.CLEANING_MAINTENANCE, ServiceCategory.INVENTORY_MANAGEMENT, ServiceCategory.SETUP_BREAKDOWN, ServiceCategory.DELIVERY_LOGISTICS, ServiceCategory.ADMINISTRATIVE, ServiceCategory.TRAINING_SUPPORT, ServiceCategory.MARKETING_PROMOTION, ServiceCategory.TECHNICAL_SUPPORT] as const),
    complexity: faker.helpers.arrayElement([ServiceComplexity.BASIC, ServiceComplexity.INTERMEDIATE, ServiceComplexity.ADVANCED, ServiceComplexity.EXPERT] as const),
    shortDescription: faker.lorem.words(5),
    detailedDescription: undefined,
    requiredSkills: faker.lorem.words(5).split(' '),
    requiredCertifications: faker.lorem.words(5).split(' '),
    estimatedDurationHours: faker.number.float(),
    durationRangeMinHours: faker.number.float(),
    durationRangeMaxHours: faker.number.float(),
    preparationInstructions: undefined,
    executionInstructions: faker.lorem.words(5),
    completionRequirements: undefined,
    qualityStandards: undefined,
    expectedDeliverables: faker.lorem.words(5).split(' '),
    successCriteria: faker.lorem.words(5).split(' '),
    requiredEquipment: faker.lorem.words(5).split(' '),
    requiredMaterials: faker.lorem.words(5).split(' '),
    locationRequirements: undefined,
    suggestedBaseRate: undefined,
    createdBy: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceComplete() {
  return {
    id: faker.string.uuid(),
    serviceName: faker.lorem.words(5),
    serviceCode: faker.lorem.words(5),
    category: faker.helpers.arrayElement([ServiceCategory.FOOD_PREPARATION, ServiceCategory.CUSTOMER_SERVICE, ServiceCategory.CLEANING_MAINTENANCE, ServiceCategory.INVENTORY_MANAGEMENT, ServiceCategory.SETUP_BREAKDOWN, ServiceCategory.DELIVERY_LOGISTICS, ServiceCategory.ADMINISTRATIVE, ServiceCategory.TRAINING_SUPPORT, ServiceCategory.MARKETING_PROMOTION, ServiceCategory.TECHNICAL_SUPPORT] as const),
    complexity: faker.helpers.arrayElement([ServiceComplexity.BASIC, ServiceComplexity.INTERMEDIATE, ServiceComplexity.ADVANCED, ServiceComplexity.EXPERT] as const),
    shortDescription: faker.lorem.words(5),
    detailedDescription: undefined,
    requiredSkills: faker.lorem.words(5).split(' '),
    requiredCertifications: faker.lorem.words(5).split(' '),
    estimatedDurationHours: faker.number.float(),
    durationRangeMinHours: faker.number.float(),
    durationRangeMaxHours: faker.number.float(),
    requiresSpecificStartTime: false,
    canBeSplitAcrossDays: false,
    requiresContinuousWork: true,
    preparationInstructions: undefined,
    executionInstructions: faker.lorem.words(5),
    completionRequirements: undefined,
    qualityStandards: undefined,
    expectedDeliverables: faker.lorem.words(5).split(' '),
    successCriteria: faker.lorem.words(5).split(' '),
    requiredEquipment: faker.lorem.words(5).split(' '),
    requiredMaterials: faker.lorem.words(5).split(' '),
    locationRequirements: undefined,
    suggestedBaseRate: undefined,
    complexityMultiplier: 1,
    isActive: true,
    requiresApproval: false,
    createdBy: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    versionNumber: 1,
  };
}
export function fakeServiceOffer() {
  return {
    locationId: faker.lorem.words(5),
    offerTitle: undefined,
    customInstructions: undefined,
    preferredStartDate: faker.date.anytime(),
    preferredStartTime: undefined,
    latestStartDate: undefined,
    mustCompleteBy: undefined,
    acceptableStartTimes: faker.lorem.words(5).split(' '),
    offeredAmount: faker.number.float(),
    hourlyRate: undefined,
    maxHours: undefined,
    bonusConditions: undefined,
    customDurationEstimate: undefined,
    locationSpecificRequirements: faker.lorem.words(5).split(' '),
    additionalEquipmentProvided: faker.lorem.words(5).split(' '),
    preferredAssociates: faker.lorem.words(5).split(' '),
    excludedAssociates: faker.lorem.words(5).split(' '),
    postedBy: faker.lorem.words(5),
    expiresAt: undefined,
    internalNotes: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceOfferComplete() {
  return {
    id: faker.string.uuid(),
    serviceId: faker.string.uuid(),
    locationId: faker.lorem.words(5),
    offerTitle: undefined,
    customInstructions: undefined,
    preferredStartDate: faker.date.anytime(),
    preferredStartTime: undefined,
    latestStartDate: undefined,
    mustCompleteBy: undefined,
    canStartAnytimeInRange: false,
    acceptableStartTimes: faker.lorem.words(5).split(' '),
    offeredAmount: faker.number.float(),
    paymentStructure: PaymentStructure.FIXED,
    hourlyRate: undefined,
    maxHours: undefined,
    bonusConditions: undefined,
    expenseReimbursement: false,
    customDurationEstimate: undefined,
    locationSpecificRequirements: faker.lorem.words(5).split(' '),
    additionalEquipmentProvided: faker.lorem.words(5).split(' '),
    minimumExperienceLevel: 0,
    requiredLocationExperience: false,
    preferredAssociates: faker.lorem.words(5).split(' '),
    excludedAssociates: faker.lorem.words(5).split(' '),
    offerStatus: OfferStatus.OPEN,
    urgency: ServiceUrgency.ROUTINE,
    maxApplicants: 1,
    currentApplicants: 0,
    postedBy: faker.lorem.words(5),
    postedAt: new Date(),
    expiresAt: undefined,
    internalNotes: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceAgreement() {
  return {
    associateId: faker.lorem.words(5),
    locationId: faker.lorem.words(5),
    agreedAmount: faker.number.float(),
    agreedStartTime: faker.date.anytime(),
    estimatedCompletionTime: faker.date.anytime(),
    specificInstructions: undefined,
    agreedDeliverables: faker.lorem.words(5).split(' '),
    qualityRequirements: undefined,
    cancellationPolicy: undefined,
    latePenaltyTerms: undefined,
    qualityGuaranteeTerms: undefined,
    associateAcceptedAt: undefined,
    locationApprovedAt: undefined,
    approvedBy: undefined,
    negotiationNotes: faker.lorem.words(5).split(' '),
    revisedTerms: JSON.stringify({"foo":"b117e9eb-ac1c-450c-89f7-e99e12c6b56d","bar":5261303704715264,"bike":"a","a":"m","b":0.8533717258833349,"name":"Blaise","prop":"0b1"}),
    actualStartTime: undefined,
    actualCompletionTime: undefined,
    finalAmountPaid: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceAgreementComplete() {
  return {
    id: faker.string.uuid(),
    serviceOfferId: faker.string.uuid(),
    associateId: faker.lorem.words(5),
    locationId: faker.lorem.words(5),
    agreedAmount: faker.number.float(),
    agreedStartTime: faker.date.anytime(),
    estimatedCompletionTime: faker.date.anytime(),
    specificInstructions: undefined,
    agreedDeliverables: faker.lorem.words(5).split(' '),
    qualityRequirements: undefined,
    cancellationPolicy: undefined,
    latePenaltyTerms: undefined,
    qualityGuaranteeTerms: undefined,
    agreementStatus: AgreementStatus.PROPOSED,
    associateAcceptedAt: undefined,
    locationApprovedAt: undefined,
    approvedBy: undefined,
    negotiationNotes: faker.lorem.words(5).split(' '),
    revisedTerms: JSON.stringify({"foo":"19f532ae-a87b-41cb-a1fa-bbc9464af49a","bar":5440858746781696,"bike":"e","a":"C","b":0.7980631683021784,"name":"Rosario","prop":"0b0"}),
    actualStartTime: undefined,
    actualCompletionTime: undefined,
    finalAmountPaid: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceExecution() {
  return {
    startedAt: undefined,
    pausedAt: undefined,
    resumedAt: undefined,
    completedAt: undefined,
    currentPhase: undefined,
    milestonesCompleted: faker.lorem.words(5).split(' '),
    qualityCheckpoints: JSON.stringify({"foo":"d2f2d034-88f5-400e-9499-92cde8d63ce2","bar":3000043881627648,"bike":"a","a":"6","b":0.7423401887062937,"name":"Evelyn","prop":"0b1"}),
    performanceNotes: faker.lorem.words(5).split(' '),
    issuesEncountered: faker.lorem.words(5).split(' '),
    equipmentUsed: faker.lorem.words(5).split(' '),
    materialsConsumed: undefined,
    additionalResourcesNeeded: faker.lorem.words(5).split(' '),
    associateNotes: faker.lorem.words(5).split(' '),
    progressReports: JSON.stringify({"foo":"f8baa227-a6e2-4c03-8f7f-66891ae94e3c","bar":6386964628504576,"bike":"0","a":"p","b":0.8281859706621617,"name":"Katharina","prop":"0b1"}),
    locationFeedback: faker.lorem.words(5).split(' '),
    satisfactionRating: undefined,
    hoursLogged: undefined,
    expensesIncurred: undefined,
    bonusEarned: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceExecutionComplete() {
  return {
    id: faker.string.uuid(),
    serviceAgreementId: faker.string.uuid(),
    startedAt: undefined,
    pausedAt: undefined,
    resumedAt: undefined,
    completedAt: undefined,
    completionPercentage: 0,
    currentPhase: undefined,
    milestonesCompleted: faker.lorem.words(5).split(' '),
    qualityCheckpoints: JSON.stringify({"foo":"d7bafdfa-8dd1-40a6-b112-c1d62d55adc7","bar":2054950592970752,"bike":"8","a":"r","b":0.9225677808281034,"name":"Arely","prop":"0b1"}),
    performanceNotes: faker.lorem.words(5).split(' '),
    issuesEncountered: faker.lorem.words(5).split(' '),
    equipmentUsed: faker.lorem.words(5).split(' '),
    materialsConsumed: undefined,
    additionalResourcesNeeded: faker.lorem.words(5).split(' '),
    associateNotes: faker.lorem.words(5).split(' '),
    progressReports: JSON.stringify({"foo":"c8e20927-965f-4e9f-8baa-6845e4c73448","bar":3122486889676800,"bike":"6","a":"s","b":0.32476137042976916,"name":"Kali","prop":"0b0"}),
    locationFeedback: faker.lorem.words(5).split(' '),
    satisfactionRating: undefined,
    hoursLogged: undefined,
    expensesIncurred: undefined,
    bonusEarned: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceReview() {
  return {
    reviewerId: faker.lorem.words(5),
    reviewerType: faker.lorem.words(5),
    overallRating: faker.number.int(),
    qualityRating: undefined,
    timelinessRating: undefined,
    communicationRating: undefined,
    professionalismRating: undefined,
    writtenReview: undefined,
    positiveAspects: faker.lorem.words(5).split(' '),
    areasForImprovement: faker.lorem.words(5).split(' '),
    wouldWorkAgain: undefined,
    wouldRecommend: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeServiceReviewComplete() {
  return {
    id: faker.string.uuid(),
    serviceAgreementId: faker.string.uuid(),
    reviewerId: faker.lorem.words(5),
    reviewerType: faker.lorem.words(5),
    overallRating: faker.number.int(),
    qualityRating: undefined,
    timelinessRating: undefined,
    communicationRating: undefined,
    professionalismRating: undefined,
    writtenReview: undefined,
    positiveAspects: faker.lorem.words(5).split(' '),
    areasForImprovement: faker.lorem.words(5).split(' '),
    wouldWorkAgain: undefined,
    wouldRecommend: undefined,
    isVerified: false,
    reviewHelpfulVotes: 0,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeDevice() {
  return {
    fingerprint: faker.lorem.words(5),
    deviceType: faker.helpers.arrayElement([DeviceType.CUSTOMER_KIOSK, DeviceType.KITCHEN_DISPLAY, DeviceType.PAYMENT_TERMINAL, DeviceType.MANAGER_STATION, DeviceType.MOBILE_POS, DeviceType.TABLET_POS] as const),
    name: faker.person.fullName(),
    description: undefined,
    capabilities: JSON.stringify({"foo":"5e3d978b-7f94-4fc7-87c9-cb78b606516b","bar":130503554367488,"bike":"f","a":"K","b":0.5756523495074362,"name":"Norma","prop":"0b0"}),
    locationId: undefined,
    assignedUserId: undefined,
    approvedBy: undefined,
    approvedAt: undefined,
    userAgent: undefined,
    lastIpAddress: undefined,
    lastSeen: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeDeviceComplete() {
  return {
    id: faker.string.uuid(),
    fingerprint: faker.lorem.words(5),
    deviceType: faker.helpers.arrayElement([DeviceType.CUSTOMER_KIOSK, DeviceType.KITCHEN_DISPLAY, DeviceType.PAYMENT_TERMINAL, DeviceType.MANAGER_STATION, DeviceType.MOBILE_POS, DeviceType.TABLET_POS] as const),
    name: faker.person.fullName(),
    description: undefined,
    capabilities: JSON.stringify({"foo":"1e1add8a-4ccc-4e55-9d6f-f39a9c2aad80","bar":1317497825394688,"bike":"e","a":"n","b":0.5315564358606935,"name":"Dora","prop":"0b1"}),
    locationId: undefined,
    assignedUserId: undefined,
    status: DeviceStatus.PENDING_APPROVAL,
    approvedBy: undefined,
    approvedAt: undefined,
    userAgent: undefined,
    lastIpAddress: undefined,
    lastSeen: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeDeviceSession() {
  return {
    userId: undefined,
    sessionToken: faker.lorem.words(5),
    ipAddress: undefined,
    userAgent: undefined,
    expiresAt: faker.date.anytime(),
    terminatedAt: undefined,
    terminatedReason: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeDeviceSessionComplete() {
  return {
    id: faker.string.uuid(),
    deviceId: faker.string.uuid(),
    userId: undefined,
    sessionToken: faker.lorem.words(5),
    status: SessionStatus.ACTIVE,
    lastActivity: new Date(),
    ipAddress: undefined,
    userAgent: undefined,
    expiresAt: faker.date.anytime(),
    terminatedAt: undefined,
    terminatedReason: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeLocation() {
  return {
    name: faker.person.fullName(),
    address: undefined,
    phone: undefined,
    email: undefined,
    posConfig: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeLocationComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    address: undefined,
    phone: undefined,
    email: undefined,
    isActive: true,
    timezone: 'UTC',
    posConfig: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeShift() {
  return {
    workerId: faker.lorem.words(5),
    startTime: faker.date.anytime(),
    endTime: undefined,
    breakDuration: undefined,
    notes: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeShiftComplete() {
  return {
    id: faker.string.uuid(),
    locationId: faker.string.uuid(),
    workerId: faker.lorem.words(5),
    startTime: faker.date.anytime(),
    endTime: undefined,
    breakDuration: undefined,
    isActive: true,
    clockedIn: false,
    clockedOut: false,
    ordersProcessed: 0,
    totalSales: new Decimal(0),
    notes: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeOrder() {
  return {
    orderNumber: faker.lorem.words(5),
    orderType: faker.lorem.words(5),
    customerName: undefined,
    customerPhone: undefined,
    tableNumber: undefined,
    items: JSON.stringify({"foo":"c732f9bc-42e8-43f3-9a8f-cfcc3adc2815","bar":5583411192266752,"bike":"5","a":"U","b":0.6729164407588542,"name":"Genevieve","prop":"0b1"}),
    subtotal: new Decimal(faker.number.float()),
    taxAmount: new Decimal(faker.number.float()),
    totalAmount: new Decimal(faker.number.float()),
    prepStartTime: undefined,
    readyTime: undefined,
    servedTime: undefined,
    takenBy: undefined,
    preparedBy: undefined,
    servedBy: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeOrderComplete() {
  return {
    id: faker.string.uuid(),
    orderNumber: faker.lorem.words(5),
    locationId: faker.string.uuid(),
    status: OrderStatus.PENDING,
    orderType: faker.lorem.words(5),
    customerName: undefined,
    customerPhone: undefined,
    tableNumber: undefined,
    items: JSON.stringify({"foo":"5a33678d-6c2f-4aae-9c7f-846f55568069","bar":5471016348286976,"bike":"0","a":"k","b":0.8990234499797225,"name":"Gladys","prop":"0b1"}),
    subtotal: new Decimal(faker.number.float()),
    taxAmount: new Decimal(faker.number.float()),
    tipAmount: new Decimal(0),
    discountAmount: new Decimal(0),
    totalAmount: new Decimal(faker.number.float()),
    orderTime: new Date(),
    prepStartTime: undefined,
    readyTime: undefined,
    servedTime: undefined,
    takenBy: undefined,
    preparedBy: undefined,
    servedBy: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakePayment() {
  return {
    amount: new Decimal(faker.number.float()),
    method: faker.helpers.arrayElement([PaymentMethod.CASH, PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD, PaymentMethod.MOBILE_PAY, PaymentMethod.GIFT_CARD] as const),
    transactionId: undefined,
    processorResponse: undefined,
    processedBy: undefined,
    processedAt: undefined,
    refundedAt: undefined,
    refundReason: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakePaymentComplete() {
  return {
    id: faker.string.uuid(),
    orderId: faker.string.uuid(),
    amount: new Decimal(faker.number.float()),
    method: faker.helpers.arrayElement([PaymentMethod.CASH, PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD, PaymentMethod.MOBILE_PAY, PaymentMethod.GIFT_CARD] as const),
    status: PaymentStatus.PENDING,
    transactionId: undefined,
    processorResponse: undefined,
    processedBy: undefined,
    processedAt: undefined,
    refundedAmount: new Decimal(0),
    refundedAt: undefined,
    refundReason: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
