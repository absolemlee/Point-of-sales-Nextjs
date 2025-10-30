'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface Service {
  id: string;
  serviceName: string;
  serviceCode: string;
  category: string;
  complexity: string;
  shortDescription: string;
  detailedDescription?: string;
  estimatedDurationHours: number;
  durationRangeMinHours: number;
  durationRangeMaxHours: number;
  executionInstructions: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  suggestedBaseRate?: number;
}

interface ServiceOffer {
  id: string;
  service: Service;
  offerTitle?: string;
  customInstructions?: string;
  preferredStartDate: string;
  preferredStartTime?: string;
  offeredAmount: number;
  paymentStructure: string;
  urgency: string;
  offerStatus: string;
  maxApplicants: number;
  currentApplicants: number;
  postedAt: string;
  expiresAt?: string;
}

interface LocationServiceOfferingProps {
  locationId: string;
  locationName: string;
  userRole: string;
}

const LocationServiceOffering: React.FC<LocationServiceOfferingProps> = ({
  locationId,
  locationName,
  userRole
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [myOffers, setMyOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOfferDialog, setShowCreateOfferDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('');

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    offerTitle: '',
    customInstructions: '',
    preferredStartDate: '',
    preferredStartTime: '',
    latestStartDate: '',
    mustCompleteBy: '',
    offeredAmount: 0,
    paymentStructure: 'FIXED',
    hourlyRate: 0,
    maxHours: 0,
    urgency: 'ROUTINE',
    maxApplicants: 1,
    expenseReimbursement: false,
    customDurationEstimate: 0,
    locationSpecificRequirements: [] as string[],
    additionalEquipmentProvided: [] as string[],
    minimumExperienceLevel: 0,
    requiredLocationExperience: false,
    expiresAt: '',
    internalNotes: ''
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const categories = [
    'FOOD_PREPARATION',
    'CUSTOMER_SERVICE', 
    'CLEANING_MAINTENANCE',
    'INVENTORY_MANAGEMENT',
    'SETUP_BREAKDOWN',
    'DELIVERY_LOGISTICS',
    'ADMINISTRATIVE',
    'TRAINING_SUPPORT',
    'MARKETING_PROMOTION',
    'TECHNICAL_SUPPORT'
  ];

  const urgencyLevels = [
    { value: 'ROUTINE', label: 'Routine', color: 'bg-green-100 text-green-800' },
    { value: 'PRIORITY', label: 'Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
    { value: 'EMERGENCY', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchServices();
    fetchMyOffers();
  }, [locationId]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services?active=true');
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchMyOffers = async () => {
    try {
      const response = await axios.get(`/api/service-offers?locationId=${locationId}`);
      if (response.data.success) {
        setMyOffers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) return;

    // Validation
    if (!offerForm.preferredStartDate || !offerForm.offeredAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (offerForm.offeredAmount <= 0) {
      toast.error('Offered amount must be greater than zero');
      return;
    }

    try {
      const response = await axios.post('/api/service-offers', {
        serviceId: selectedService.id,
        locationId,
        postedBy: 'current-user-id', // This should come from auth context
        ...offerForm
      });

      if (response.data.success) {
        toast.success('Service offer created successfully!');
        setMyOffers(prev => [response.data.data, ...prev]);
        setShowCreateOfferDialog(false);
        resetOfferForm();
      }
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.response?.data?.error || 'Failed to create offer');
    }
  };

  const resetOfferForm = () => {
    setOfferForm({
      offerTitle: '',
      customInstructions: '',
      preferredStartDate: '',
      preferredStartTime: '',
      latestStartDate: '',
      mustCompleteBy: '',
      offeredAmount: 0,
      paymentStructure: 'FIXED',
      hourlyRate: 0,
      maxHours: 0,
      urgency: 'ROUTINE',
      maxApplicants: 1,
      expenseReimbursement: false,
      customDurationEstimate: 0,
      locationSpecificRequirements: [],
      additionalEquipmentProvided: [],
      minimumExperienceLevel: 0,
      requiredLocationExperience: false,
      expiresAt: '',
      internalNotes: ''
    });
    setSelectedService(null);
  };

  const addToArray = (field: 'locationSpecificRequirements' | 'additionalEquipmentProvided', value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setOfferForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: 'locationSpecificRequirements' | 'additionalEquipmentProvided', index: number) => {
    setOfferForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'BASIC': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-orange-100 text-orange-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    return urgencyLevels.find(u => u.value === urgency)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = !categoryFilter || service.category === categoryFilter;
    const matchesComplexity = !complexityFilter || service.complexity === complexityFilter;
    return matchesCategory && matchesComplexity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Offerings</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {locationName} - Manage service requests for associates
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                <p className="text-2xl font-bold">{myOffers.filter(o => o.offerStatus === 'OPEN').length}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{myOffers.filter(o => o.offerStatus === 'PENDING').length}</p>
              </div>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{myOffers.filter(o => o.offerStatus === 'IN_PROGRESS').length}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  ${myOffers.filter(o => ['OPEN', 'PENDING', 'ACCEPTED'].includes(o.offerStatus))
                    .reduce((sum, o) => sum + o.offeredAmount, 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          <TabsTrigger value="offers">My Offers ({myOffers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {formatCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Complexity</SelectItem>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Available Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                      <CardDescription>{service.serviceCode}</CardDescription>
                    </div>
                    <Badge className={getComplexityColor(service.complexity)}>
                      {service.complexity.charAt(0) + service.complexity.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {service.durationRangeMinHours}-{service.durationRangeMaxHours}h
                      (avg: {service.estimatedDurationHours}h)
                    </span>
                  </div>

                  {service.suggestedBaseRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Suggested: ${service.suggestedBaseRate}</span>
                    </div>
                  )}

                  <Badge variant="outline">
                    {formatCategory(service.category)}
                  </Badge>

                  {service.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {service.requiredSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{service.serviceName}</DialogTitle>
                        <DialogDescription>{service.serviceCode}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {service.detailedDescription || service.shortDescription}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Execution Instructions</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {service.executionInstructions}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => {
                              setShowCreateOfferDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Offer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      setSelectedService(service);
                      setShowCreateOfferDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {/* My Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {offer.offerTitle || offer.service.serviceName}
                      </CardTitle>
                      <CardDescription>{offer.service.serviceCode}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(offer.offerStatus)}>
                      {offer.offerStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${offer.offeredAmount}</span>
                    <Badge variant="outline" className={getUrgencyColor(offer.urgency)}>
                      {offer.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(offer.preferredStartDate).toLocaleDateString()}
                      {offer.preferredStartTime && ` at ${offer.preferredStartTime}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {offer.currentApplicants}/{offer.maxApplicants} applicants
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Posted {new Date(offer.postedAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myOffers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Service Offers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse available services and create offers to get associates to help with your location's needs.
                </p>
                <Button onClick={() => setShowCreateOfferDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Offer Dialog */}
      <Dialog open={showCreateOfferDialog} onOpenChange={setShowCreateOfferDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Service Offer</DialogTitle>
            <DialogDescription>
              {selectedService && `Create an offer for ${selectedService.serviceName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <form onSubmit={handleCreateOffer} className="space-y-6">
              {/* Basic Offer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="offerTitle">Offer Title (Optional)</Label>
                  <Input
                    id="offerTitle"
                    value={offerForm.offerTitle}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, offerTitle: e.target.value }))}
                    placeholder={`${selectedService.serviceName} - ${locationName}`}
                  />
                </div>

                <div>
                  <Label htmlFor="customInstructions">Additional Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    value={offerForm.customInstructions}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, customInstructions: e.target.value }))}
                    placeholder="Any location-specific instructions or requirements"
                    rows={3}
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Timing Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredStartDate">Preferred Start Date *</Label>
                    <Input
                      id="preferredStartDate"
                      type="date"
                      value={offerForm.preferredStartDate}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, preferredStartDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredStartTime">Preferred Start Time</Label>
                    <Input
                      id="preferredStartTime"
                      type="time"
                      value={offerForm.preferredStartTime}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, preferredStartTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offeredAmount">Offered Amount ($) *</Label>
                    <Input
                      id="offeredAmount"
                      type="number"
                      step="0.01"
                      value={offerForm.offeredAmount || ''}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, offeredAmount: parseFloat(e.target.value) || 0 }))}
                      placeholder={selectedService.suggestedBaseRate?.toString() || "0.00"}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentStructure">Payment Structure</Label>
                    <Select 
                      value={offerForm.paymentStructure} 
                      onValueChange={(value) => setOfferForm(prev => ({ ...prev, paymentStructure: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="HOURLY_CAPPED">Hourly with Cap</SelectItem>
                        <SelectItem value="MILESTONE">Milestone Based</SelectItem>
                        <SelectItem value="PERFORMANCE">Performance Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Offer Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select 
                      value={offerForm.urgency} 
                      onValueChange={(value) => setOfferForm(prev => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxApplicants">Max Applicants</Label>
                    <Input
                      id="maxApplicants"
                      type="number"
                      min="1"
                      value={offerForm.maxApplicants}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, maxApplicants: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumExperienceLevel">Min Experience (years)</Label>
                    <Input
                      id="minimumExperienceLevel"
                      type="number"
                      min="0"
                      value={offerForm.minimumExperienceLevel}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, minimumExperienceLevel: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              {/* Location Requirements */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Location-Specific Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToArray('locationSpecificRequirements', newRequirement, setNewRequirement)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {offerForm.locationSpecificRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('locationSpecificRequirements', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateOfferDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Offer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationServiceOffering;