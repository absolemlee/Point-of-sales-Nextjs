'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Location } from './location-dashboard';

interface LocationFormProps {
  location?: Location | null;
  onClose: () => void;
}

export function LocationForm({ location, onClose }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'STATIC' as 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP',
    status: 'INACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED',
    address: '',
    coordinates: { lat: 0, lng: 0 },
    operatingHours: {
      monday: { isOpen: true, open: '07:00', close: '18:00' },
      tuesday: { isOpen: true, open: '07:00', close: '18:00' },
      wednesday: { isOpen: true, open: '07:00', close: '18:00' },
      thursday: { isOpen: true, open: '07:00', close: '18:00' },
      friday: { isOpen: true, open: '07:00', close: '20:00' },
      saturday: { isOpen: true, open: '08:00', close: '20:00' },
      sunday: { isOpen: false, open: '09:00', close: '17:00' }
    },
    contactInfo: {
      phone: '',
      email: ''
    },
    settings: {
      allowOnlineOrdering: true,
      acceptsCash: true,
      acceptsCard: true,
      hasWifi: true
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocationData = async () => {
      if (location) {
        let processedHours = formData.operatingHours;
        
        // If editing existing location, fetch proper hours data from hours API
        if (location.id) {
          try {
            const hoursResponse = await fetch(`/api/locations/${location.id}/hours`);
            const hoursData = await hoursResponse.json();
            
            if (hoursData.hours) {
              processedHours = {
                monday: { isOpen: false, open: '07:00', close: '18:00' },
                tuesday: { isOpen: false, open: '07:00', close: '18:00' },
                wednesday: { isOpen: false, open: '07:00', close: '18:00' },
                thursday: { isOpen: false, open: '07:00', close: '18:00' },
                friday: { isOpen: false, open: '07:00', close: '20:00' },
                saturday: { isOpen: false, open: '08:00', close: '20:00' },
                sunday: { isOpen: false, open: '09:00', close: '17:00' }
              };
              days.forEach(day => {
                const existingDay = hoursData.hours[day];
                if (existingDay) {
                  (processedHours as any)[day] = {
                    isOpen: existingDay.isOpen !== undefined ? existingDay.isOpen : true,
                    open: existingDay.open || '07:00',
                    close: existingDay.close || '18:00'
                  };
                } else {
                  // Default for missing days
                  (processedHours as any)[day] = {
                    isOpen: false,
                    open: '07:00',
                    close: '18:00'
                  };
                }
              });
            }
          } catch (error) {
            console.error('Failed to fetch hours data:', error);
            // Fall back to location hours if available
            if (location.operatingHours) {
              processedHours = {
                monday: { isOpen: false, open: '07:00', close: '18:00' },
                tuesday: { isOpen: false, open: '07:00', close: '18:00' },
                wednesday: { isOpen: false, open: '07:00', close: '18:00' },
                thursday: { isOpen: false, open: '07:00', close: '18:00' },
                friday: { isOpen: false, open: '07:00', close: '20:00' },
                saturday: { isOpen: false, open: '08:00', close: '20:00' },
                sunday: { isOpen: false, open: '09:00', close: '17:00' }
              };
              days.forEach(day => {
                const existingDay = (location.operatingHours as any)?.[day];
                if (existingDay) {
                  (processedHours as any)[day] = {
                    isOpen: !!(existingDay.open && existingDay.close),
                    open: existingDay.open || '07:00',
                    close: existingDay.close || '18:00'
                  };
                } else {
                  (processedHours as any)[day] = {
                    isOpen: false,
                    open: '07:00',
                    close: '18:00'
                  };
                }
              });
            }
          }
        }

        setFormData({
          name: location.name || '',
          type: (location.type || 'STATIC'),
          status: (location.status || 'INACTIVE'),
          address: location.address || '',
          coordinates: location.coordinates || { lat: 0, lng: 0 },
          operatingHours: processedHours,
          contactInfo: location.contactInfo || { phone: '', email: '' },
          settings: location.settings || formData.settings
        });
      }
    };

    loadLocationData();
  }, [location]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any> || {}),
        [field]: value
      }
    }));
  };

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          isOpen: !prev.operatingHours[day as keyof typeof prev.operatingHours]?.isOpen
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate operating hours
    const openDays = days.filter(day => {
      const dayData = formData.operatingHours[day as keyof typeof formData.operatingHours];
      return dayData?.isOpen === true;
    });

    if (formData.type === 'STATIC' && openDays.length === 0) {
      alert('Static locations must be open at least one day per week.');
      setLoading(false);
      return;
    }

    // Validate that open days have both open and close times
    const validOpenDays = openDays.every(day => {
      const dayData = formData.operatingHours[day as keyof typeof formData.operatingHours];
      return dayData?.open && dayData?.close;
    });

    if (!validOpenDays) {
      alert('Please set opening and closing times for all open days.');
      setLoading(false);
      return;
    }

    try {
      const url = location ? `/api/locations/${location.id}` : '/api/locations';
      const method = location ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onClose();
      } else {
        console.error('Failed to save location:', data.error);
        alert('Failed to save location: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error saving location');
    } finally {
      setLoading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {location ? 'Edit Location' : 'Create New Location'}
          </h1>
          <p className="text-gray-600">
            {location ? 'Update location details and settings' : 'Set up a new coffee shop location'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Downtown Coffee Shop"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Location Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STATIC">🏪 Static Location</SelectItem>
                    <SelectItem value="POPUP">⛺ Pop-up Event</SelectItem>
                    <SelectItem value="VENUE_PARTNERSHIP">🤝 Venue Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">🟢 Active</SelectItem>
                    <SelectItem value="INACTIVE">⚪ Inactive</SelectItem>
                    <SelectItem value="SCHEDULED">🔵 Scheduled</SelectItem>
                    <SelectItem value="CLOSED">🔴 Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address of the location"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
            <CardDescription>
              Set opening and closing times for each day. Check "Open" to set hours, or leave unchecked for closed days.
              {formData.type === 'STATIC' && ' Static locations must be open at least one day per week.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {days.map((day) => {
                const dayData = formData.operatingHours[day as keyof typeof formData.operatingHours];
                const isOpen = dayData?.isOpen ?? true;
                
                return (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 font-medium capitalize">
                      {day}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={() => handleDayToggle(day)}
                        className="rounded"
                      />
                      <Label className="text-sm">Open</Label>
                    </div>

                    {isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={dayData?.open || '07:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={dayData?.close || '18:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}

                    {!isOpen && (
                      <span className="text-red-500 italic font-medium">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Contact details for this location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                  placeholder="location@coffeeshop.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Location Settings</CardTitle>
            <CardDescription>
              Configure features and capabilities for this location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-ordering">Allow Online Ordering</Label>
                <input
                  id="online-ordering"
                  type="checkbox"
                  checked={formData.settings.allowOnlineOrdering}
                  onChange={(e) => handleNestedChange('settings', 'allowOnlineOrdering', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="accepts-cash">Accepts Cash</Label>
                <input
                  id="accepts-cash"
                  type="checkbox"
                  checked={formData.settings.acceptsCash}
                  onChange={(e) => handleNestedChange('settings', 'acceptsCash', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="accepts-card">Accepts Cards</Label>
                <input
                  id="accepts-card"
                  type="checkbox"
                  checked={formData.settings.acceptsCard}
                  onChange={(e) => handleNestedChange('settings', 'acceptsCard', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="has-wifi">Has WiFi</Label>
                <input
                  id="has-wifi"
                  type="checkbox"
                  checked={formData.settings.hasWifi}
                  onChange={(e) => handleNestedChange('settings', 'hasWifi', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : location ? 'Update Location' : 'Create Location'}
          </Button>
        </div>
      </form>
    </div>
  );
}