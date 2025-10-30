'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { HandHeart, Clock, DollarSign, AlertTriangle } from 'lucide-react';

interface ServiceExchangeSettings {
  enableServiceExchange: boolean;
  defaultServiceFee: number;
  maxServiceDuration: number;
  requireApproval: boolean;
  autoAssignServices: boolean;
  defaultCurrency: string;
  minimumServiceRating: number;
  allowMultipleOffers: boolean;
}

export function ServiceExchangeSettingsCard() {
  const [settings, setSettings] = useState<ServiceExchangeSettings>({
    enableServiceExchange: true,
    defaultServiceFee: 25.00,
    maxServiceDuration: 8,
    requireApproval: true,
    autoAssignServices: false,
    defaultCurrency: 'USD',
    minimumServiceRating: 4.0,
    allowMultipleOffers: true
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from API or localStorage
    const savedSettings = localStorage.getItem('serviceExchangeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.warn('Failed to parse saved settings');
      }
    }
  }, []);

  const handleSettingChange = (key: keyof ServiceExchangeSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // await fetch('/api/settings/service-exchange', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // For now, save to localStorage
      localStorage.setItem('serviceExchangeSettings', JSON.stringify(settings));
      
      toast.success('Service exchange settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings: ServiceExchangeSettings = {
      enableServiceExchange: true,
      defaultServiceFee: 25.00,
      maxServiceDuration: 8,
      requireApproval: true,
      autoAssignServices: false,
      defaultCurrency: 'USD',
      minimumServiceRating: 4.0,
      allowMultipleOffers: true
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-blue-600" />
          Service Exchange Settings
        </CardTitle>
        <CardDescription>
          Configure service exchange system preferences and business rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-service-exchange">Enable Service Exchange</Label>
              <p className="text-sm text-muted-foreground">
                Allow associates to offer and accept service-based work
              </p>
            </div>
            <Switch
              id="enable-service-exchange"
              checked={settings.enableServiceExchange}
              onCheckedChange={(checked) => handleSettingChange('enableServiceExchange', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-approval">Require Manager Approval</Label>
              <p className="text-sm text-muted-foreground">
                Service agreements must be approved by location manager
              </p>
            </div>
            <Switch
              id="require-approval"
              checked={settings.requireApproval}
              onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-multiple-offers">Allow Multiple Offers</Label>
              <p className="text-sm text-muted-foreground">
                Locations can create multiple offers for the same service
              </p>
            </div>
            <Switch
              id="allow-multiple-offers"
              checked={settings.allowMultipleOffers}
              onCheckedChange={(checked) => handleSettingChange('allowMultipleOffers', checked)}
            />
          </div>
        </div>

        {/* Financial Settings */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Financial Settings
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-service-fee">Default Service Fee ($)</Label>
              <Input
                id="default-service-fee"
                type="number"
                step="0.50"
                min="0"
                value={settings.defaultServiceFee}
                onChange={(e) => handleSettingChange('defaultServiceFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value) => handleSettingChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Service Quality Settings */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Service Quality Settings
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-service-duration">Maximum Service Duration (hours)</Label>
              <Input
                id="max-service-duration"
                type="number"
                min="1"
                max="24"
                value={settings.maxServiceDuration}
                onChange={(e) => handleSettingChange('maxServiceDuration', parseInt(e.target.value) || 8)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimum-rating">Minimum Service Rating</Label>
              <Input
                id="minimum-rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={settings.minimumServiceRating}
                onChange={(e) => handleSettingChange('minimumServiceRating', parseFloat(e.target.value) || 4.0)}
              />
            </div>
          </div>
        </div>

        {!settings.enableServiceExchange && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Service exchange is currently disabled. Enable it to allow service-based transactions.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}