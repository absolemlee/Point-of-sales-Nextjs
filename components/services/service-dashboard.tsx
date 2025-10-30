'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import axios from 'axios';
import ServiceDefinition from './service-definition';

interface Service {
  id: string;
  serviceName: string;
  serviceCode: string;
  category: string;
  complexity: string;
  shortDescription: string;
  estimatedDurationHours: number;
  durationRangeMinHours: number;
  durationRangeMaxHours: number;
  suggestedBaseRate?: number;
  isActive: boolean;
  serviceOffers: Array<{
    id: string;
    offeredAmount: number;
    locationId: string;
  }>;
  createdAt: string;
  versionNumber: number;
}

const ServiceDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const complexityLevels = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/services');
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceCreated = (newService: Service) => {
    setServices(prev => [newService, ...prev]);
    setShowCreateDialog(false);
  };

  const handleServiceUpdated = (updatedService: Service) => {
    setServices(prev => prev.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    setShowEditDialog(false);
    setSelectedService(null);
  };

  const handleDeactivateService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to deactivate this service? It will no longer be available for new offers.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/services?id=${serviceId}`);
      if (response.data.success) {
        setServices(prev => prev.map(service => 
          service.id === serviceId ? { ...service, isActive: false } : service
        ));
        toast.success('Service deactivated successfully');
      }
    } catch (error: any) {
      console.error('Error deactivating service:', error);
      toast.error(error.response?.data?.error || 'Failed to deactivate service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || service.category === categoryFilter;
    const matchesComplexity = !complexityFilter || service.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'BASIC': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-orange-100 text-orange-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-cyan-100 text-cyan-800',
      'bg-teal-100 text-teal-800',
      'bg-emerald-100 text-emerald-800',
      'bg-lime-100 text-lime-800',
      'bg-amber-100 text-amber-800',
      'bg-rose-100 text-rose-800'
    ];
    return colors[categories.indexOf(category) % colors.length];
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-muted-foreground">
            Manage service definitions that locations can offer to associates
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Define a new service template that locations can offer to associates.
              </DialogDescription>
            </DialogHeader>
            <ServiceDefinition 
              onServiceCreated={handleServiceCreated}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.isActive).length}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Offers</p>
                <p className="text-2xl font-bold">{services.filter(s => s.serviceOffers.length > 0).length}</p>
              </div>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{new Set(services.map(s => s.category)).size}</p>
              </div>
              <Filter className="h-4 w-4 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                {complexityLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.serviceName}</div>
                      <div className="text-sm text-muted-foreground">{service.serviceCode}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.shortDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(service.category)}>
                      {formatCategory(service.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getComplexityColor(service.complexity)}>
                      {service.complexity.charAt(0) + service.complexity.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {service.durationRangeMinHours}-{service.durationRangeMaxHours}h
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ~{service.estimatedDurationHours}h avg
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.suggestedBaseRate ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${service.suggestedBaseRate}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {service.serviceOffers.length} active
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedService(service);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {service.isActive && (
                          <DropdownMenuItem
                            onClick={() => handleDeactivateService(service.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No services found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service definition. Changes will create a new version.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceDefinition 
              existingService={selectedService}
              onServiceCreated={handleServiceUpdated}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDashboard;