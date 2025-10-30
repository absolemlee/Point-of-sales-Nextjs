'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DeviceFingerprint, 
  DeviceDetector, 
  DeviceType, 
  DeviceCapabilities,
  DeviceAuthRequest,
  DeviceAuthResponse,
  RegisteredDevice,
  DeviceSession
} from '@/types/device-management';

interface UseDeviceAuthOptions {
  locationId: string;
  requestedInterface?: string;
  userId?: string;
  autoAuthenticate?: boolean;
}

interface DeviceAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  device: RegisteredDevice | null;
  session: DeviceSession | null;
  capabilities: DeviceCapabilities | null;
  error: string | null;
  requiresApproval: boolean;
  allowedInterfaces: string[];
}

export function useDeviceAuth({
  locationId,
  requestedInterface,
  userId,
  autoAuthenticate = true
}: UseDeviceAuthOptions) {
  const [state, setState] = useState<DeviceAuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    device: null,
    session: null,
    capabilities: null,
    error: null,
    requiresApproval: false,
    allowedInterfaces: []
  });

  const authenticate = useCallback(async (interfaceType?: string) => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      // Generate device fingerprint
      const fingerprint = await DeviceFingerprint.generate();
      
      // Detect device capabilities
      const capabilities = await DeviceDetector.detectCapabilities();
      const deviceType = DeviceDetector.detectDeviceType();

      const authRequest: DeviceAuthRequest = {
        deviceFingerprint: fingerprint,
        deviceName: getDeviceName(deviceType, capabilities),
        deviceType,
        capabilities,
        requestedLocation: locationId,
        requestedInterface: interfaceType || requestedInterface || 'CUSTOMER_ORDERING',
        userId,
        ipAddress: 'client', // Will be determined server-side
        userAgent: navigator.userAgent
      };

      const response = await fetch('/api/device/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authRequest)
      });

      const result: DeviceAuthResponse = await response.json();

      if (result.success && result.deviceId && result.sessionId) {
        // Fetch full device and session details
        const [deviceResponse, sessionResponse] = await Promise.all([
          fetch(`/api/device/register?deviceId=${result.deviceId}`),
          fetch(`/api/device/sessions?sessionId=${result.sessionId}`)
        ]);

        const deviceData = await deviceResponse.json();
        const sessionData = await sessionResponse.json();

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isAuthenticating: false,
          device: deviceData.device,
          session: sessionData.session,
          capabilities,
          allowedInterfaces: result.allowedInterfaces || [],
          error: null
        }));

        // Store session info in localStorage for persistence
        localStorage.setItem('deviceSession', JSON.stringify({
          deviceId: result.deviceId,
          sessionId: result.sessionId,
          expiresAt: result.expiresAt
        }));

      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isAuthenticating: false,
          capabilities,
          error: result.error || 'Authentication failed',
          requiresApproval: result.requiresApproval || false
        }));
      }

    } catch (error) {
      console.error('Device authentication error:', error);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isAuthenticating: false,
        error: 'Authentication failed',
        requiresApproval: false
      }));
    }
  }, [locationId, requestedInterface, userId]);

  const logout = useCallback(async () => {
    if (state.session) {
      try {
        await fetch(`/api/device/sessions?sessionId=${state.session.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error ending device session:', error);
      }
    }

    localStorage.removeItem('deviceSession');
    setState({
      isAuthenticated: false,
      isAuthenticating: false,
      device: null,
      session: null,
      capabilities: null,
      error: null,
      requiresApproval: false,
      allowedInterfaces: []
    });
  }, [state.session]);

  const checkExistingSession = useCallback(async () => {
    try {
      const storedSession = localStorage.getItem('deviceSession');
      if (!storedSession) return false;

      const sessionInfo = JSON.parse(storedSession);
      
      // Check if session is expired
      if (new Date(sessionInfo.expiresAt) < new Date()) {
        localStorage.removeItem('deviceSession');
        return false;
      }

      // Validate session with server
      const response = await fetch(`/api/device/sessions?sessionId=${sessionInfo.sessionId}`);
      const result = await response.json();

      if (result.success && result.sessions.length > 0) {
        const session = result.sessions[0];
        if (session.status === 'ACTIVE') {
          // Session is still valid
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            session,
            error: null
          }));
          return true;
        }
      }

      localStorage.removeItem('deviceSession');
      return false;
    } catch (error) {
      console.error('Error checking existing session:', error);
      localStorage.removeItem('deviceSession');
      return false;
    }
  }, []);

  const requestApproval = useCallback(async () => {
    // In a real implementation, this would send a notification to administrators
    console.log('Device approval requested for location:', locationId);
    
    // Mock approval notification
    const notificationData = {
      type: 'DEVICE_APPROVAL_REQUEST',
      deviceFingerprint: await DeviceFingerprint.generate(),
      locationId,
      requestedInterface,
      userId,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch('/api/notifications/device-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
    } catch (error) {
      console.error('Error sending approval request:', error);
    }
  }, [locationId, requestedInterface, userId]);

  // Auto-authenticate on mount if enabled
  useEffect(() => {
    if (autoAuthenticate && locationId) {
      checkExistingSession().then(hasValidSession => {
        if (!hasValidSession) {
          authenticate();
        }
      });
    }
  }, [autoAuthenticate, locationId, authenticate, checkExistingSession]);

  // Update activity timestamp periodically
  useEffect(() => {
    if (state.isAuthenticated && state.session) {
      const interval = setInterval(async () => {
        try {
          await fetch('/api/device/sessions/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: state.session!.id })
          });
        } catch (error) {
          console.error('Error updating activity:', error);
        }
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.session]);

  return {
    ...state,
    authenticate,
    logout,
    requestApproval,
    canAccessInterface: (interfaceType: string) => 
      state.allowedInterfaces.includes(interfaceType),
    isSessionExpired: () => 
      state.session ? new Date(state.session.expiresAt) < new Date() : false
  };
}

function getDeviceName(deviceType: DeviceType, capabilities: DeviceCapabilities): string {
  const platform = capabilities.platform || 'Unknown';
  const screenSize = `${capabilities.screenWidth}x${capabilities.screenHeight}`;
  
  switch (deviceType) {
    case DeviceType.MOBILE_POS:
      return `Mobile POS (${platform})`;
    case DeviceType.TABLET_POS:
      return `Tablet POS (${platform} - ${screenSize})`;
    case DeviceType.MANAGER_STATION:
      return `Manager Station (${platform} - ${screenSize})`;
    case DeviceType.CUSTOMER_KIOSK:
      return `Customer Kiosk (${screenSize})`;
    case DeviceType.KITCHEN_DISPLAY:
      return `Kitchen Display (${screenSize})`;
    case DeviceType.PAYMENT_TERMINAL:
      return `Payment Terminal (${platform})`;
    default:
      return `Unknown Device (${platform})`;
  }
}