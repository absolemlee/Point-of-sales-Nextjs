'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Star,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  HandHeart,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  MessageSquare,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ServiceOffer {
  id: string;
  service: {
    id: string;
    serviceName: string;
    serviceCode: string;
    category: string;
    complexity: string;
    shortDescription: string;
    executionInstructions: string;
    estimatedDurationHours: number;
    durationRangeMinHours: number;
    durationRangeMaxHours: number;
    requiredSkills: string[];
    requiredCertifications: string[];
  };
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
  locationId: string;
  postedAt: string;
  expiresAt?: string;
  serviceAgreements: Array<{
    id: string;
    agreementStatus: string;
    associateId: string;
  }>;
}

interface ServiceAgreement {
  id: string;
  serviceOffer: {
    service: {
      serviceName: string;
      serviceCode: string;
      category: string;
      complexity: string;
      executionInstructions: string;
    };
    offeredAmount: number;
    locationId: string;
  };
  agreedAmount: number;
  agreedStartTime: string;
  estimatedCompletionTime: string;
  agreementStatus: string;
  serviceExecution?: {
    id: string;
    completionPercentage: number;
    currentPhase?: string;
    hoursLogged?: number;
    startedAt?: string;
    completedAt?: string;
  };
  createdAt: string;
}

interface AssociateServiceAcceptanceProps {
  associateId: string;
  associateName: string;
}

const AssociateServiceAcceptance: React.FC<AssociateServiceAcceptanceProps> = ({
  associateId,
  associateName
}) => {
  const [availableOffers, setAvailableOffers] = useState<ServiceOffer[]>([]);
  const [myAgreements, setMyAgreements] = useState<ServiceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<ServiceOffer | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    proposalMessage: '',
    agreedAmount: 0,
    agreedStartTime: '',
    estimatedDurationHours: 0,
    specificInstructions: '',
    agreedDeliverables: [] as string[],
    qualityRequirements: ''
  });

  const [newDeliverable, setNewDeliverable] = useState('');

  const urgencyLevels = [
    { value: 'ROUTINE', label: 'Routine', color: 'bg-green-100 text-green-800' },
    { value: 'PRIORITY', label: 'Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
    { value: 'EMERGENCY', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchAvailableOffers();
    fetchMyAgreements();
  }, [associateId]);

  const fetchAvailableOffers = async () => {
    try {
      const response = await axios.get(`/api/service-offers?associateId=${associateId}`);
      if (response.data.success) {
        setAvailableOffers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load available offers');
    }
  };

  const fetchMyAgreements = async () => {
    try {
      const response = await axios.get(`/api/service-agreements?associateId=${associateId}`);
      if (response.data.success) {
        setMyAgreements(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
      toast.error('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOffer) return;

    // Validation
    if (!applicationForm.proposalMessage || !applicationForm.agreedStartTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const agreedAmount = applicationForm.agreedAmount || selectedOffer.offeredAmount;

    try {
      const response = await axios.post('/api/service-agreements', {
        serviceOfferId: selectedOffer.id,
        associateId,
        agreedAmount,
        agreedStartTime: applicationForm.agreedStartTime,
        estimatedDurationHours: applicationForm.estimatedDurationHours || selectedOffer.service.estimatedDurationHours,
        specificInstructions: applicationForm.specificInstructions,
        agreedDeliverables: applicationForm.agreedDeliverables,
        qualityRequirements: applicationForm.qualityRequirements,
        proposalMessage: applicationForm.proposalMessage
      });

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        setMyAgreements(prev => [response.data.data, ...prev]);
        setShowApplicationDialog(false);
        resetApplicationForm();
        fetchAvailableOffers(); // Refresh to update applicant counts
      }
    } catch (error: any) {
      console.error('Error applying for offer:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      proposalMessage: '',
      agreedAmount: 0,
      agreedStartTime: '',
      estimatedDurationHours: 0,
      specificInstructions: '',
      agreedDeliverables: [],
      qualityRequirements: ''
    });
    setSelectedOffer(null);
  };

  const handleStartService = async (agreementId: string) => {
    try {
      const response = await axios.put('/api/service-agreements', {
        id: agreementId,
        action: 'start'
      });

      if (response.data.success) {
        toast.success('Service started successfully!');
        fetchMyAgreements();
      }
    } catch (error: any) {
      console.error('Error starting service:', error);
      toast.error(error.response?.data?.error || 'Failed to start service');
    }
  };

  const handleUpdateProgress = async (agreementId: string, completionPercentage: number, progressNote: string) => {
    try {
      const response = await axios.put('/api/service-execution', {
        agreementId,
        action: 'updateProgress',
        completionPercentage,
        progressNote
      });

      if (response.data.success) {
        toast.success('Progress updated successfully!');
        fetchMyAgreements();
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.response?.data?.error || 'Failed to update progress');
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setApplicationForm(prev => ({
        ...prev,
        agreedDeliverables: [...prev.agreedDeliverables, newDeliverable.trim()]
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setApplicationForm(prev => ({
      ...prev,
      agreedDeliverables: prev.agreedDeliverables.filter((_, i) => i !== index)
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
      case 'PROPOSED': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOffers = availableOffers.filter(offer => {
    const matchesCategory = !categoryFilter || offer.service.category === categoryFilter;
    const matchesUrgency = !urgencyFilter || offer.urgency === urgencyFilter;
    const hasNotApplied = !offer.serviceAgreements.some(agreement => agreement.associateId === associateId);
    const isOpen = offer.offerStatus === 'OPEN';
    const notExpired = !offer.expiresAt || new Date(offer.expiresAt) > new Date();
    
    return matchesCategory && matchesUrgency && hasNotApplied && isOpen && notExpired;
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
          <h1 className="text-3xl font-bold">Service Opportunities</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Welcome {associateName} - Find and manage your service commitments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Offers</p>
                <p className="text-2xl font-bold">{filteredOffers.length}</p>
              </div>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold">{myAgreements.filter(a => a.agreementStatus === 'ACTIVE').length}</p>
              </div>
              <PlayCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{myAgreements.filter(a => a.agreementStatus === 'PROPOSED').length}</p>
              </div>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ${myAgreements.filter(a => a.agreementStatus === 'COMPLETED')
                    .reduce((sum, a) => sum + a.agreedAmount, 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Offers ({filteredOffers.length})</TabsTrigger>
          <TabsTrigger value="agreements">My Services ({myAgreements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="FOOD_PREPARATION">Food Preparation</option>
                  <option value="CUSTOMER_SERVICE">Customer Service</option>
                  <option value="CLEANING_MAINTENANCE">Cleaning & Maintenance</option>
                  <option value="INVENTORY_MANAGEMENT">Inventory Management</option>
                  <option value="SETUP_BREAKDOWN">Setup & Breakdown</option>
                  <option value="DELIVERY_LOGISTICS">Delivery & Logistics</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="TRAINING_SUPPORT">Training & Support</option>
                  <option value="MARKETING_PROMOTION">Marketing & Promotion</option>
                  <option value="TECHNICAL_SUPPORT">Technical Support</option>
                </select>
                <select 
                  value={urgencyFilter} 
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Urgency</option>
                  <option value="ROUTINE">Routine</option>
                  <option value="PRIORITY">Priority</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Available Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {offer.offerTitle || offer.service.serviceName}
                      </CardTitle>
                      <CardDescription>{offer.service.serviceCode}</CardDescription>
                    </div>
                    <Badge className={getUrgencyColor(offer.urgency)}>
                      {offer.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{offer.service.shortDescription}</p>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-lg">${offer.offeredAmount}</span>
                    <Badge variant="outline">{offer.paymentStructure.replace('_', ' ')}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {offer.service.durationRangeMinHours}-{offer.service.durationRangeMaxHours}h
                      (est: {offer.service.estimatedDurationHours}h)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(offer.preferredStartDate).toLocaleDateString()}
                      {offer.preferredStartTime && ` at ${offer.preferredStartTime}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Location: {offer.locationId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getComplexityColor(offer.service.complexity)}>
                      {offer.service.complexity.charAt(0) + offer.service.complexity.slice(1).toLowerCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {offer.currentApplicants}/{offer.maxApplicants} applicants
                    </span>
                  </div>

                  {offer.service.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {offer.service.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {offer.service.requiredSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{offer.service.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{offer.service.serviceName}</DialogTitle>
                          <DialogDescription>
                            {offer.service.serviceCode} - {formatCategory(offer.service.category)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Instructions</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {offer.service.executionInstructions}
                            </p>
                          </div>
                          {offer.customInstructions && (
                            <div>
                              <h4 className="font-medium mb-2">Additional Instructions</h4>
                              <p className="text-sm text-muted-foreground">
                                {offer.customInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setApplicationForm(prev => ({
                          ...prev,
                          agreedAmount: offer.offeredAmount,
                          estimatedDurationHours: offer.service.estimatedDurationHours
                        }));
                        setShowApplicationDialog(true);
                      }}
                    >
                      <HandHeart className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOffers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Available Offers</h3>
                <p className="text-muted-foreground">
                  Check back later for new service opportunities that match your skills and availability.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          {/* My Agreements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAgreements.map((agreement) => (
              <Card key={agreement.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {agreement.serviceOffer.service.serviceName}
                      </CardTitle>
                      <CardDescription>{agreement.serviceOffer.service.serviceCode}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(agreement.agreementStatus)}>
                      {agreement.agreementStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${agreement.agreedAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(agreement.agreedStartTime).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Location: {agreement.serviceOffer.locationId}</span>
                  </div>

                  {agreement.serviceExecution && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm">{agreement.serviceExecution.completionPercentage}%</span>
                      </div>
                      <Progress value={agreement.serviceExecution.completionPercentage} className="h-2" />
                      {agreement.serviceExecution.currentPhase && (
                        <p className="text-xs text-muted-foreground">
                          Current: {agreement.serviceExecution.currentPhase}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Applied {new Date(agreement.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    {agreement.agreementStatus === 'ACCEPTED' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleStartService(agreement.id)}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {agreement.agreementStatus === 'ACTIVE' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Progress</DialogTitle>
                            <DialogDescription>
                              Update your progress on {agreement.serviceOffer.service.serviceName}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const percentage = parseInt(formData.get('percentage') as string);
                            const note = formData.get('note') as string;
                            handleUpdateProgress(agreement.id, percentage, note);
                          }}>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="percentage">Completion Percentage</Label>
                                <Input
                                  id="percentage"
                                  name="percentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  defaultValue={agreement.serviceExecution?.completionPercentage || 0}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="note">Progress Note</Label>
                                <Textarea
                                  id="note"
                                  name="note"
                                  placeholder="Describe what you've accomplished..."
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full">
                                Update Progress
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myAgreements.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Service Agreements Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse available offers and apply for services that match your skills and availability.
                </p>
                <Button onClick={() => setShowApplicationDialog(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Browse Available Offers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Service</DialogTitle>
            <DialogDescription>
              {selectedOffer && `Apply for ${selectedOffer.service.serviceName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <form onSubmit={handleApplyForOffer} className="space-y-6">
              <div>
                <Label htmlFor="proposalMessage">Why are you the right person for this service? *</Label>
                <Textarea
                  id="proposalMessage"
                  value={applicationForm.proposalMessage}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, proposalMessage: e.target.value }))}
                  placeholder="Describe your relevant experience and why you'd like to take on this service..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agreedAmount">Your Rate ($)</Label>
                  <Input
                    id="agreedAmount"
                    type="number"
                    step="0.01"
                    value={applicationForm.agreedAmount || ''}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, agreedAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder={selectedOffer.offeredAmount.toString()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Offered: ${selectedOffer.offeredAmount} (leave blank to accept offered amount)
                  </p>
                </div>
                <div>
                  <Label htmlFor="agreedStartTime">When can you start? *</Label>
                  <Input
                    id="agreedStartTime"
                    type="datetime-local"
                    value={applicationForm.agreedStartTime}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, agreedStartTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedDurationHours">How long do you think this will take? (hours)</Label>
                <Input
                  id="estimatedDurationHours"
                  type="number"
                  step="0.25"
                  value={applicationForm.estimatedDurationHours || ''}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, estimatedDurationHours: parseFloat(e.target.value) || 0 }))}
                  placeholder={selectedOffer.service.estimatedDurationHours.toString()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated: {selectedOffer.service.estimatedDurationHours}h (Range: {selectedOffer.service.durationRangeMinHours}-{selectedOffer.service.durationRangeMaxHours}h)
                </p>
              </div>

              <div>
                <Label htmlFor="specificInstructions">Additional Notes or Requirements</Label>
                <Textarea
                  id="specificInstructions"
                  value={applicationForm.specificInstructions}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, specificInstructions: e.target.value }))}
                  placeholder="Any specific instructions, requirements, or questions you have..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssociateServiceAcceptance;