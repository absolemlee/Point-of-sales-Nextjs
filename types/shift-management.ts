// Shift Management Types and API Endpoints

export interface Shift {
  id: string;
  locationId: string;
  managerId: string;
  managerName: string;
  startTime: string;
  endTime?: string;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  targetRevenue?: number;
  actualRevenue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftWorker {
  id: string;
  shiftId: string;
  workerId: string;
  workerName: string;
  role: 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'SERVER' | 'CLEANER';
  clockInTime: string;
  clockOutTime?: string;
  breakStart?: string;
  breakEnd?: string;
  status: 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT';
  assignedStations: string[]; // e.g., ['POS_1', 'KITCHEN_DISPLAY', 'PAYMENT_TERMINAL']
  hourlyRate?: number;
  permissions: string[];
}

export interface LocationPOSConfig {
  id: string;
  locationId: string;
  activeShiftId?: string;
  
  // POS Screen Configuration
  posStations: {
    id: string;
    name: string;
    type: 'ORDER_ENTRY' | 'KITCHEN_DISPLAY' | 'PAYMENT' | 'MANAGER';
    isActive: boolean;
    assignedWorkerId?: string;
    deviceInfo?: {
      userAgent: string;
      screenSize: string;
      lastActivity: string;
    };
  }[];
  
  // Menu Configuration
  activeMenus: {
    menuId: string;
    name: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
  
  // Payment Configuration
  paymentOptions: {
    cash: boolean;
    card: boolean;
    mobile: boolean;
    giftCard: boolean;
    loyalty: boolean;
  };
  
  // Operational Settings
  settings: {
    requireWorkerSignIn: boolean;
    allowCustomerOrdering: boolean;
    kitchenDisplayEnabled: boolean;
    receiptPrintingEnabled: boolean;
    loyaltyProgramActive: boolean;
    taxRate: number;
    tipOptions: number[];
    maxOrderValue: number;
    autoCloseOrders: boolean;
    orderTimeoutMinutes: number;
  };
  
  updatedAt: string;
}

export interface WorkerSession {
  id: string;
  workerId: string;
  workerName: string;
  shiftId: string;
  locationId: string;
  role: string;
  assignedStations: string[];
  permissions: string[];
  clockInTime: string;
  lastActivity: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    screenSize: string;
  };
  status: 'ACTIVE' | 'ON_BREAK' | 'INACTIVE';
}

// API Response Types
export interface ShiftResponse {
  success: boolean;
  shift?: Shift;
  workers?: ShiftWorker[];
  error?: string;
}

export interface LocationPOSResponse {
  success: boolean;
  config?: LocationPOSConfig;
  activeSessions?: WorkerSession[];
  error?: string;
}