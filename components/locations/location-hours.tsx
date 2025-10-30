'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Clock, Calendar, Plus, X } from 'lucide-react';
import { Location } from './location-dashboard';

interface OperatingHours {
  [key: string]: {
    isOpen: boolean;
    open?: string;
    close?: string;
  };
}

interface HoursException {
  id?: string;
  date: string;
  exceptionType: 'CLOSED' | 'SPECIAL_HOURS' | 'HOLIDAY' | 'MAINTENANCE' | 'EVENT';
  openTime?: string;
  closeTime?: string;
  reason: string;
  notes?: string;
  isRecurring?: boolean;
}

interface LocationHoursProps {
  location: Location;
  onBack: () => void;
}

export function LocationHours({ location, onBack }: LocationHoursProps) {
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isOpen: true, open: '07:00', close: '18:00' },
    tuesday: { isOpen: true, open: '07:00', close: '18:00' },
    wednesday: { isOpen: true, open: '07:00', close: '18:00' },
    thursday: { isOpen: true, open: '07:00', close: '18:00' },
    friday: { isOpen: true, open: '07:00', close: '20:00' },
    saturday: { isOpen: true, open: '08:00', close: '20:00' },
    sunday: { isOpen: false }
  });

  const [exceptions, setExceptions] = useState<HoursException[]>([]);
  const [newException, setNewException] = useState<Partial<HoursException>>({
    exceptionType: 'CLOSED',
    date: '',
    reason: ''
  });
  const [showAddException, setShowAddException] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const fetchHours = async () => {
    try {
      const response = await fetch(`/api/locations/${location.id}/hours?includeExceptions=true`);
      const data = await response.json();
      
      if (data.hours && Object.keys(data.hours).length > 0) {
        setOperatingHours(data.hours);
      }
      
      if (data.exceptions) {
        setExceptions(data.exceptions);
      }
    } catch (error) {
      console.error('Failed to fetch hours:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHours();
  }, [location.id]);

  const handleDayToggle = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveHours = async () => {
    setSaving(true);
    
    // Validate that open days have both open and close times
    const openDays = days.filter(day => operatingHours[day]?.isOpen);
    const isValid = openDays.every(day => {
      const hours = operatingHours[day];
      return hours && hours.open && hours.close;
    });

    if (!isValid) {
      alert('Please set opening and closing times for all open days.');
      setSaving(false);
      return;
    }

    // Ensure at least one day is open for static locations
    if (location.type === 'STATIC' && openDays.length === 0) {
      alert('Static locations must be open at least one day per week.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/locations/${location.id}/hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatingHours })
      });

      if (response.ok) {
        alert('Operating hours updated successfully!');
      } else {
        const error = await response.json();
        alert('Failed to update hours: ' + error.error);
      }
    } catch (error) {
      alert('Error updating hours');
    } finally {
      setSaving(false);
    }
  };

  const handleAddException = async () => {
    if (!newException.date || !newException.reason) {
      alert('Date and reason are required');
      return;
    }

    try {
      const response = await fetch(`/api/locations/${location.id}/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newException)
      });

      if (response.ok) {
        const data = await response.json();
        setExceptions(prev => [...prev, data.exception]);
        setNewException({ exceptionType: 'CLOSED', date: '', reason: '' });
        setShowAddException(false);
      } else {
        const error = await response.json();
        alert('Failed to add exception: ' + error.error);
      }
    } catch (error) {
      alert('Error adding exception');
    }
  };

  const getLocationTypeHints = () => {
    switch (location.type) {
      case 'STATIC':
        return {
          title: 'Static Location Hours',
          hints: [
            'Set consistent weekly operating hours',
            'Use exceptions for holidays and maintenance',
            'Consider extended hours for weekend service',
            'Plan ahead for staff scheduling'
          ]
        };
      case 'POPUP':
        return {
          title: 'Pop-up Event Hours',
          hints: [
            'Set hours specific to each event',
            'Include setup and cleanup time',
            'Consider venue restrictions',
            'Plan for weather contingencies'
          ]
        };
      case 'VENUE_PARTNERSHIP':
        return {
          title: 'Partnership Event Hours',
          hints: [
            'Coordinate with host venue hours',
            'Account for venue setup requirements',
            'Consider partner venue\'s regular events',
            'Respect venue closing policies'
          ]
        };
      default:
        return { title: 'Operating Hours', hints: [] };
    }
  };

  const hints = getLocationTypeHints();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {location.name} - Operating Hours
          </h1>
          <p className="text-gray-600">
            Manage hours and exceptions for this {location.type.toLowerCase().replace('_', ' ')} location
          </p>
        </div>
      </div>

      {/* Location Type Hints */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">{hints.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-blue-700 space-y-1">
            {hints.hints.map((hint, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {hint}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Regular Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Regular Operating Hours
          </CardTitle>
          <CardDescription>
            Set standard hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24 font-medium capitalize">
                {dayLabels[day as keyof typeof dayLabels]}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={operatingHours[day]?.isOpen || false}
                  onChange={() => handleDayToggle(day)}
                  className="rounded"
                />
                <Label className="text-sm">Open</Label>
              </div>

              {operatingHours[day]?.isOpen && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={operatingHours[day]?.open || '07:00'}
                    onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={operatingHours[day]?.close || '18:00'}
                    onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}

              {!operatingHours[day]?.isOpen && (
                <span className="text-red-500 italic font-medium">Closed</span>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveHours} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Hours'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hours Exceptions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Hours Exceptions
              </CardTitle>
              <CardDescription>
                Special hours, closures, and event-specific schedules
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddException(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exception
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Exception Form */}
          {showAddException && (
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Add New Exception</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddException(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newException.date || ''}
                      onChange={(e) => setNewException(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Exception Type</Label>
                    <Select
                      value={newException.exceptionType}
                      onValueChange={(value) => setNewException(prev => ({ ...prev, exceptionType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLOSED">🚫 Closed</SelectItem>
                        <SelectItem value="SPECIAL_HOURS">⏰ Special Hours</SelectItem>
                        <SelectItem value="HOLIDAY">🎉 Holiday</SelectItem>
                        <SelectItem value="MAINTENANCE">🔧 Maintenance</SelectItem>
                        <SelectItem value="EVENT">🎪 Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newException.exceptionType === 'SPECIAL_HOURS' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Open Time</Label>
                      <Input
                        type="time"
                        value={newException.openTime || ''}
                        onChange={(e) => setNewException(prev => ({ ...prev, openTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Close Time</Label>
                      <Input
                        type="time"
                        value={newException.closeTime || ''}
                        onChange={(e) => setNewException(prev => ({ ...prev, closeTime: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Reason</Label>
                  <Input
                    value={newException.reason || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Thanksgiving Holiday, Equipment Maintenance"
                  />
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={newException.notes || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddException(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddException}>
                    Add Exception
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Exceptions */}
          {exceptions.length > 0 ? (
            <div className="space-y-2">
              {exceptions.map((exception) => (
                <div key={exception.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(exception.date).toLocaleDateString()} - {exception.reason}
                    </div>
                    <div className="text-sm text-gray-600">
                      {exception.exceptionType === 'CLOSED' ? 'Closed all day' : 
                       exception.exceptionType === 'SPECIAL_HOURS' ? 
                       `${exception.openTime} - ${exception.closeTime}` : 
                       exception.exceptionType}
                    </div>
                    {exception.notes && (
                      <div className="text-sm text-gray-500 italic">{exception.notes}</div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No exceptions scheduled. Add exceptions for holidays, maintenance, or special events.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}