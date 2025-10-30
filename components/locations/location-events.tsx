'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Location } from './location-dashboard';

interface LocationEvent {
  id: string;
  locationId: string;
  eventName: string;
  eventDescription?: string;
  eventType: 'POPUP' | 'KAVA_NIGHT' | 'PRIVATE_PARTY' | 'FESTIVAL' | 'PARTNERSHIP';
  organizer: string;
  hostVenue?: string;
  hostVenueAddress?: string;
  hostVenueContact?: any;
  eventDate: string;
  startTime: string;
  endTime: string;
  setupTime?: string;
  cleanupTime?: string;
  expectedAttendance?: number;
  ticketPrice?: number;
  eventUrl?: string;
  socialMediaLinks?: any;
  specialInstructions?: string;
  equipmentNeeded?: string[];
  staffRequired?: number;
  authorizedTenders?: string[];
  eventStatus: 'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface LocationEventsProps {
  location: Location;
  onBack: () => void;
}

export function LocationEvents({ location, onBack }: LocationEventsProps) {
  const [events, setEvents] = useState<LocationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<LocationEvent>>({
    eventType: 'POPUP',
    eventStatus: 'PLANNED',
    eventDate: '',
    startTime: '10:00',
    endTime: '16:00',
    organizer: '',
    eventName: ''
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/locations/${location.id}/events?upcoming=true`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [location.id]);

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'POPUP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'KAVA_NIGHT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRIVATE_PARTY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FESTIVAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PARTNERSHIP':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'POPUP':
        return '⛺';
      case 'KAVA_NIGHT':
        return '🌙';
      case 'PRIVATE_PARTY':
        return '🎉';
      case 'FESTIVAL':
        return '🎪';
      case 'PARTNERSHIP':
        return '🤝';
      default:
        return '📅';
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.eventName || !newEvent.eventDate || !newEvent.organizer) {
      alert('Event name, date, and organizer are required');
      return;
    }

    try {
      const response = await fetch(`/api/locations/${location.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(prev => [...prev, data.event]);
        setNewEvent({
          eventType: 'POPUP',
          eventStatus: 'PLANNED',
          eventDate: '',
          startTime: '10:00',
          endTime: '16:00',
          organizer: '',
          eventName: ''
        });
        setShowAddEvent(false);
      } else {
        const error = await response.json();
        alert('Failed to add event: ' + error.error);
      }
    } catch (error) {
      alert('Error adding event');
    }
  };

  const getLocationTypeEventTips = () => {
    switch (location.type) {
      case 'STATIC':
        return {
          title: 'Static Location Events',
          tips: [
            'Host educational kava nights and tasting events',
            'Organize private parties for special occasions',
            'Plan seasonal festivals and community gatherings',
            'Consider regular weekly or monthly events'
          ]
        };
      case 'POPUP':
        return {
          title: 'Pop-up Event Management',
          tips: [
            'Research venue requirements and permits',
            'Plan equipment and inventory needs carefully',
            'Account for setup and breakdown time',
            'Consider weather contingencies for outdoor events'
          ]
        };
      case 'VENUE_PARTNERSHIP':
        return {
          title: 'Partnership Event Planning',
          tips: [
            'Coordinate closely with host venue management',
            'Respect venue policies and customer base',
            'Plan events that complement venue atmosphere',
            'Ensure authorized tenders understand venue rules'
          ]
        };
      default:
        return { title: 'Event Management', tips: [] };
    }
  };

  const eventTips = getLocationTypeEventTips();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {location.name} - Event Management
          </h1>
          <p className="text-gray-600">
            Manage events for this {location.type.toLowerCase().replace('_', ' ')} location
          </p>
        </div>
      </div>

      {/* Event Type Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">{eventTips.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-green-700 space-y-1">
            {eventTips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Add Event Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <Button onClick={() => setShowAddEvent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Add Event Form */}
      {showAddEvent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Add a new event for this location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Event Name *</Label>
                <Input
                  value={newEvent.eventName || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="e.g., Weekend Farmers Market Pop-up"
                />
              </div>

              <div>
                <Label>Event Type *</Label>
                <Select
                  value={newEvent.eventType}
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POPUP">⛺ Pop-up Event</SelectItem>
                    <SelectItem value="KAVA_NIGHT">🌙 Kava Night</SelectItem>
                    <SelectItem value="PRIVATE_PARTY">🎉 Private Party</SelectItem>
                    <SelectItem value="FESTIVAL">🎪 Festival</SelectItem>
                    <SelectItem value="PARTNERSHIP">🤝 Partnership Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Event Description</Label>
              <Textarea
                value={newEvent.eventDescription || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, eventDescription: e.target.value }))}
                placeholder="Describe the event..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Event Date *</Label>
                <Input
                  type="date"
                  value={newEvent.eventDate || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={newEvent.startTime || '10:00'}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={newEvent.endTime || '16:00'}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Organizer *</Label>
                <Input
                  value={newEvent.organizer || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Event organizer name"
                />
              </div>

              <div>
                <Label>Expected Attendance</Label>
                <Input
                  type="number"
                  value={newEvent.expectedAttendance || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, expectedAttendance: parseInt(e.target.value) || undefined }))}
                  placeholder="Number of expected attendees"
                />
              </div>
            </div>

            {(newEvent.eventType === 'POPUP' || newEvent.eventType === 'PARTNERSHIP') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Host Venue</Label>
                  <Input
                    value={newEvent.hostVenue || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, hostVenue: e.target.value }))}
                    placeholder="Name of host venue"
                  />
                </div>

                <div>
                  <Label>Host Venue Address</Label>
                  <Input
                    value={newEvent.hostVenueAddress || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, hostVenueAddress: e.target.value }))}
                    placeholder="Venue address"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Ticket Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newEvent.ticketPrice || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, ticketPrice: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Staff Required</Label>
                <Input
                  type="number"
                  value={newEvent.staffRequired || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, staffRequired: parseInt(e.target.value) || undefined }))}
                  placeholder="Number of staff needed"
                />
              </div>
            </div>

            <div>
              <Label>Special Instructions</Label>
              <Textarea
                value={newEvent.specialInstructions || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special instructions for staff or setup..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEvent}>
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getEventTypeIcon(event.eventType)}</span>
                  <div>
                    <CardTitle className="text-lg">{event.eventName}</CardTitle>
                    <CardDescription>
                      Organized by {event.organizer}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getEventTypeColor(event.eventType)}>
                    {event.eventType.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(event.eventStatus)}>
                    {event.eventStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Event Description */}
              {event.eventDescription && (
                <p className="text-sm text-gray-600">{event.eventDescription}</p>
              )}

              {/* Date and Time */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 text-blue-600 ml-2" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>

              {/* Venue */}
              {event.hostVenue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{event.hostVenue}</span>
                </div>
              )}

              {/* Attendance and Price */}
              <div className="flex items-center gap-4 text-sm">
                {event.expectedAttendance && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>{event.expectedAttendance} expected</span>
                  </div>
                )}
                {event.ticketPrice && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${event.ticketPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {event.specialInstructions && (
                <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                  {event.specialInstructions}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Event
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">📅</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="text-gray-600 mt-1">
                Create your first event to start planning activities for this location
              </p>
            </div>
            <Button onClick={() => setShowAddEvent(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Event
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}