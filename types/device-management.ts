/**
 * Device Management and Authentication Types
 * 
 * Handles device registration, capability detection, and access control
 * for POS interfaces based on device characteristics and user context.
 */

export enum DeviceType {
  CUSTOMER_KIOSK = 'CUSTOMER_KIOSK',
  KITCHEN_DISPLAY = 'KITCHEN_DISPLAY', 
  PAYMENT_TERMINAL = 'PAYMENT_TERMINAL',
  MANAGER_STATION = 'MANAGER_STATION',
  MOBILE_POS = 'MOBILE_POS',
  TABLET_POS = 'TABLET_POS'
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BLOCKED = 'BLOCKED'
}

export interface DeviceCapabilities {
  screenWidth: number;
  screenHeight: number;
  touchEnabled: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  bluetoothEnabled: boolean;
  nfcEnabled: boolean;
  printerConnected: boolean;
  cashDrawerConnected: boolean;
  barcodeScanner: boolean;
  cardReader: boolean;
  userAgent: string;
  platform: string;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface RegisteredDevice {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  fingerprint: string; // Unique device identifier
  capabilities: DeviceCapabilities;
  status: DeviceStatus;
  locationId?: string;
  stationId?: string;
  assignedUserId?: string;
  allowedInterfaces: string[];
  restrictions: {
    requiresApproval: boolean;
    maxSessionDuration?: number;
    allowedTimeWindows?: {
      start: string;
      end: string;
      days: string[];
    }[];
    ipWhitelist?: string[];
    locationRestricted: boolean;
  };
  lastSeen: string;
  registeredAt: string;
  registeredBy: string;
  updatedAt: string;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  userId: string;
  locationId: string;
  interfaceType: string;
  stationId?: string;
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  status: 'ACTIVE' | 'IDLE' | 'EXPIRED';
  permissions: string[];
  expiresAt: string;
}

export interface DeviceAuthRequest {
  deviceFingerprint: string;
  deviceName: string;
  deviceType: DeviceType;
  capabilities: DeviceCapabilities;
  requestedLocation: string;
  requestedInterface: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

export interface DeviceAuthResponse {
  success: boolean;
  deviceId?: string;
  sessionId?: string;
  allowedInterfaces?: string[];
  restrictions?: any;
  expiresAt?: string;
  error?: string;
  requiresApproval?: boolean;
  approvalMessage?: string;
}

// Device fingerprinting utilities
export class DeviceFingerprint {
  static async generate(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown'
    ];

    // Add canvas fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      components.push(canvas.toDataURL());
    }

    const fingerprint = components.join('|');
    return await this.hash(fingerprint);
  }

  private static async hash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Device capability detection
export class DeviceDetector {
  static detectDeviceType(): DeviceType {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);

    // Check for specific device types
    if (userAgent.includes('kiosk') || userAgent.includes('chromecast')) {
      return DeviceType.CUSTOMER_KIOSK;
    }

    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return DeviceType.MOBILE_POS;
    }

    if (userAgent.includes('tablet') || userAgent.includes('ipad') || 
        (maxDimension >= 768 && maxDimension <= 1366 && 'ontouchstart' in window)) {
      return DeviceType.TABLET_POS;
    }

    if (maxDimension >= 1920 && !('ontouchstart' in window)) {
      return DeviceType.MANAGER_STATION;
    }

    // Default classification based on screen size
    if (minDimension < 768) {
      return DeviceType.MOBILE_POS;
    } else if (minDimension < 1024) {
      return DeviceType.TABLET_POS;
    } else {
      return DeviceType.MANAGER_STATION;
    }
  }

  static async detectCapabilities(): Promise<DeviceCapabilities> {
    const capabilities: DeviceCapabilities = {
      screenWidth: screen.width,
      screenHeight: screen.height,
      touchEnabled: 'ontouchstart' in window,
      cameraEnabled: false,
      microphoneEnabled: false,
      bluetoothEnabled: false,
      nfcEnabled: false,
      printerConnected: false,
      cashDrawerConnected: false,
      barcodeScanner: false,
      cardReader: false,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      connectionType: this.getConnectionType()
    };

    // Check for camera access
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      capabilities.cameraEnabled = devices.some(device => device.kind === 'videoinput');
      capabilities.microphoneEnabled = devices.some(device => device.kind === 'audioinput');
    } catch (error) {
      console.warn('Could not detect media devices:', error);
    }

    // Check for Bluetooth
    if ('bluetooth' in navigator) {
      capabilities.bluetoothEnabled = true;
    }

    // Check for NFC
    if ('nfc' in navigator) {
      capabilities.nfcEnabled = true;
    }

    // Check for payment capabilities
    if ('paymentRequest' in window) {
      // Basic payment request support
    }

    // Check battery status
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        capabilities.batteryLevel = Math.round(battery.level * 100);
        capabilities.isCharging = battery.charging;
      } catch (error) {
        console.warn('Could not access battery info:', error);
      }
    }

    return capabilities;
  }

  private static getConnectionType(): 'wifi' | 'cellular' | 'ethernet' | 'unknown' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const type = connection.effectiveType || connection.type;
        if (type.includes('wifi')) return 'wifi';
        if (type.includes('cellular') || type.includes('4g') || type.includes('3g')) return 'cellular';
        if (type.includes('ethernet')) return 'ethernet';
      }
    }
    return 'unknown';
  }
}

// Device access control utilities
export class DeviceAccessControl {
  static canAccessInterface(
    device: RegisteredDevice,
    interfaceType: string,
    locationId: string,
    userId?: string
  ): { allowed: boolean; reason?: string } {
    // Check device status
    if (device.status !== DeviceStatus.ACTIVE) {
      return { allowed: false, reason: `Device is ${device.status.toLowerCase()}` };
    }

    // Check location restrictions
    if (device.restrictions.locationRestricted && device.locationId !== locationId) {
      return { allowed: false, reason: 'Device not authorized for this location' };
    }

    // Check interface permissions
    if (!device.allowedInterfaces.includes(interfaceType)) {
      return { allowed: false, reason: 'Interface not permitted on this device' };
    }

    // Check user assignment
    if (device.assignedUserId && device.assignedUserId !== userId) {
      return { allowed: false, reason: 'Device assigned to different user' };
    }

    // Check time restrictions
    if (device.restrictions.allowedTimeWindows && device.restrictions.allowedTimeWindows.length > 0) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      
      const isInTimeWindow = device.restrictions.allowedTimeWindows.some(window => {
        if (!window.days.includes(currentDay)) return false;
        
        const startTime = parseInt(window.start.replace(':', ''));
        const endTime = parseInt(window.end.replace(':', ''));
        
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (!isInTimeWindow) {
        return { allowed: false, reason: 'Access not permitted at this time' };
      }
    }

    return { allowed: true };
  }

  static getRecommendedInterface(
    device: RegisteredDevice,
    userRole: string,
    locationContext: any
  ): string | null {
    const allowedInterfaces = device.allowedInterfaces;
    
    // Prioritize based on device type and capabilities
    if (device.deviceType === DeviceType.KITCHEN_DISPLAY) {
      return allowedInterfaces.includes('KITCHEN_DISPLAY') ? 'KITCHEN_DISPLAY' : null;
    }

    if (device.deviceType === DeviceType.PAYMENT_TERMINAL) {
      return allowedInterfaces.includes('PAYMENT_TERMINAL') ? 'PAYMENT_TERMINAL' : null;
    }

    if (device.deviceType === DeviceType.CUSTOMER_KIOSK) {
      return allowedInterfaces.includes('CUSTOMER_KIOSK') ? 'CUSTOMER_KIOSK' : null;
    }

    // Role-based recommendations for general devices
    if (['MANAGER', 'OWNER', 'ADMIN'].includes(userRole)) {
      if (allowedInterfaces.includes('MANAGER_TERMINAL')) return 'MANAGER_TERMINAL';
    }

    if (device.deviceType === DeviceType.MOBILE_POS) {
      if (allowedInterfaces.includes('MOBILE_POS')) return 'MOBILE_POS';
    }

    // Default to most permissive interface available
    const priority = ['ORDER_ENTRY', 'PAYMENT_TERMINAL', 'CUSTOMER_ORDERING'];
    for (const interface_ of priority) {
      if (allowedInterfaces.includes(interface_)) return interface_;
    }

    return null;
  }
}