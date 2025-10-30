'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MapPin, Clock, Settings, Users, Menu, Crown, UserPlus, ClipboardList } from 'lucide-react';
import { LocationForm } from './location-form';
import { LocationProducts } from './location-products';
import { LocationInventory } from './location-inventory';
import { LocationHours } from './location-hours';
import { LocationEvents } from './location-events';
import { getCurrentUser, hasPermission, canAccessLocation, getAccessibleLocations, getUserTypeLabel, getUserTypeColor, type UserProfile } from '@/lib/user-permissions';

export interface Location {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED';
  address?: string;
  coordinates?: { lat: number; lng: number };
  operatingHours?: any;
  contactInfo?: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export function LocationDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showProducts, setShowProducts] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState<string | null>(null);
  const [showHours, setShowHours] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState<string | null>(null);
  
  // User permissions
  const currentUser = getCurrentUser();
  const [roleDeclarations, setRoleDeclarations] = useState<any[]>([]);
  const [serviceOffers, setServiceOffers] = useState<any[]>([]);
  
  // Role management state
  const [showRoleManagement, setShowRoleManagement] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      const allLocations = data.locations || [];
      
      // Filter locations based on user permissions
      const accessibleLocations = getAccessibleLocations(currentUser, allLocations);
      setLocations(accessibleLocations);
      
      // Fetch role management data for executive directors
      if (hasPermission(currentUser, 'canDeclareRoles')) {
        await fetchRoleManagementData();
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRoleManagementData = async () => {
    try {
      const response = await fetch('/api/executive-locations');
      const data = await response.json();
      if (data.success) {
        setRoleDeclarations(data.data.roleDeclarations || []);
        setServiceOffers(data.data.serviceOffers || []);
      }
    } catch (error) {
      console.error('Failed to fetch role management data:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STATIC':
        return '🏪';
      case 'POPUP':
        return '⛺';
      case 'VENUE_PARTNERSHIP':
        return '🤝';
      default:
        return '📍';
    }
  };

  const getOperatingHoursText = (hours: any) => {
    if (!hours) return 'Hours not set';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    
    if (!todayHours) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLocation(null);
    fetchLocations();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <LocationForm
        location={selectedLocation}
        onClose={handleCloseForm}
      />
    );
  }

  if (showProducts) {
    const location = locations.find(l => l.id === showProducts);
    if (location) {
      return (
        <LocationProducts
          location={location}
          onBack={() => setShowProducts(null)}
        />
      );
    }
  }

  if (showInventory) {
    const location = locations.find(l => l.id === showInventory);
    if (location) {
      return (
        <LocationInventory
          location={location}
          onBack={() => setShowInventory(null)}
        />
      );
    }
  }

  if (showHours) {
    const location = locations.find(l => l.id === showHours);
    if (location) {
      return (
        <LocationHours
          location={location}
          onBack={() => setShowHours(null)}
        />
      );
    }
  }

  if (showEvents) {
    const location = locations.find(l => l.id === showEvents);
    if (location) {
      return (
        <LocationEvents
          location={location}
          onBack={() => setShowEvents(null)}
        />
      );
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with User Context */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
            <Badge variant={getUserTypeColor(currentUser.userType) as any} className="h-6">
              {getUserTypeLabel(currentUser.userType)}
            </Badge>
          </div>
          <p className="text-gray-600">
            {currentUser.userType === 'EXECUTIVE_DIRECTOR' 
              ? `Executive oversight for ${currentUser.assignedLocations.length} location(s)` 
              : `Manage your kava locations, roles, and operations`}
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission(currentUser, 'canCreateLocations') && (
            <Button onClick={handleCreateLocation} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          )}
        </div>
      </div>

      {/* Executive Director Stats */}
      {hasPermission(currentUser, 'canDeclareRoles') && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Roles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {roleDeclarations.filter(d => d.declarationStatus === 'ACTIVE').length}
                  </p>
                </div>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {serviceOffers.filter(o => o.offerStatus === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Static Locations</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {locations.filter(l => l.type === 'STATIC').length}
                  </p>
                </div>
                <div className="text-xl">🏪</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Authority</p>
                  <p className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                    <Crown className="h-5 w-5" />
                    CEO
                  </p>
                </div>
                <div className="text-xl">👑</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Standard Stats for other user types */}
      {!hasPermission(currentUser, 'canDeclareRoles') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {locations.filter(l => l.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Static Locations</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {locations.filter(l => l.type === 'STATIC').length}
                  </p>
                </div>
                <div className="text-xl">🏪</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pop-ups</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {locations.filter(l => l.type === 'POPUP').length}
                  </p>
                </div>
                <div className="text-xl">⛺</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(location.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {location.type.replace('_', ' ').toLowerCase()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(location.status)}>
                  {location.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Address */}
              {location.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{location.address}</span>
                </div>
              )}

              {/* Operating Hours */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{getOperatingHoursText(location.operatingHours)}</span>
              </div>

              {/* Contact Info */}
              {location.contactInfo?.phone && (
                <div className="text-sm text-gray-600">
                  📞 {location.contactInfo.phone}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHours(location.id)}
                  className="flex items-center justify-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  Hours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEvents(location.id)}
                  className="flex items-center justify-center gap-1"
                >
                  📅 Events
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInventory(location.id)}
                  className="flex items-center justify-center gap-1"
                >
                  📦 Inventory
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProducts(location.id)}
                  className="flex items-center justify-center gap-1"
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditLocation(location)}
                  className="col-span-2 flex items-center justify-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Edit Location
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {locations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🏪</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No locations yet</h3>
              <p className="text-gray-600 mt-1">
                Create your first location to start managing your coffee shop business
              </p>
            </div>
            <Button onClick={handleCreateLocation} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Location
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}