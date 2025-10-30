'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ServiceDefinitionProps {
  onServiceCreated?: (service: any) => void;
  existingService?: any;
  mode?: 'create' | 'edit';
}

const ServiceDefinition: React.FC<ServiceDefinitionProps> = ({ 
  onServiceCreated, 
  existingService,
  mode = 'create'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: existingService?.serviceName || '',
    serviceCode: existingService?.serviceCode || '',
    category: existingService?.category || '',
    complexity: existingService?.complexity || '',
    shortDescription: existingService?.shortDescription || '',
    detailedDescription: existingService?.detailedDescription || '',
    requiredSkills: existingService?.requiredSkills || [],
    requiredCertifications: existingService?.requiredCertifications || [],
    estimatedDurationHours: existingService?.estimatedDurationHours || 0,
    durationRangeMinHours: existingService?.durationRangeMinHours || 0,
    durationRangeMaxHours: existingService?.durationRangeMaxHours || 0,
    requiresSpecificStartTime: existingService?.requiresSpecificStartTime || false,
    canBeSplitAcrossDays: existingService?.canBeSplitAcrossDays || false,
    requiresContinuousWork: existingService?.requiresContinuousWork ?? true,
    preparationInstructions: existingService?.preparationInstructions || '',
    executionInstructions: existingService?.executionInstructions || '',
    completionRequirements: existingService?.completionRequirements || '',
    qualityStandards: existingService?.qualityStandards || '',
    expectedDeliverables: existingService?.expectedDeliverables || [],
    successCriteria: existingService?.successCriteria || [],
    requiredEquipment: existingService?.requiredEquipment || [],
    requiredMaterials: existingService?.requiredMaterials || [],
    locationRequirements: existingService?.locationRequirements || '',
    suggestedBaseRate: existingService?.suggestedBaseRate || 0,
    complexityMultiplier: existingService?.complexityMultiplier || 1.0,
    requiresApproval: existingService?.requiresApproval || false
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

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

  const complexityLevels = [
    { value: 'BASIC', label: 'Basic', description: 'Simple, routine tasks' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Moderate skill required' },
    { value: 'ADVANCED', label: 'Advanced', description: 'High skill, specialized knowledge' },
    { value: 'EXPERT', label: 'Expert', description: 'Highly specialized, critical tasks' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: string, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as string[], value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'serviceName', 'serviceCode', 'category', 'complexity',
      'shortDescription', 'executionInstructions',
      'estimatedDurationHours', 'durationRangeMinHours', 'durationRangeMaxHours'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    if (formData.durationRangeMinHours > formData.durationRangeMaxHours) {
      toast.error('Minimum duration cannot be greater than maximum duration');
      return false;
    }

    if (formData.estimatedDurationHours < formData.durationRangeMinHours || 
        formData.estimatedDurationHours > formData.durationRangeMaxHours) {
      toast.error('Estimated duration must be within the specified range');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const url = mode === 'edit' ? '/api/services' : '/api/services';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const payload = mode === 'edit' ? { ...formData, id: existingService?.id } : formData;

      const response = await axios({
        method,
        url,
        data: payload
      });

      if (response.data.success) {
        toast.success(`Service ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
        if (onServiceCreated) {
          onServiceCreated(response.data.data);
        }
        
        if (mode === 'create') {
          // Reset form for new service
          setFormData({
            serviceName: '',
            serviceCode: '',
            category: '',
            complexity: '',
            shortDescription: '',
            detailedDescription: '',
            requiredSkills: [],
            requiredCertifications: [],
            estimatedDurationHours: 0,
            durationRangeMinHours: 0,
            durationRangeMaxHours: 0,
            requiresSpecificStartTime: false,
            canBeSplitAcrossDays: false,
            requiresContinuousWork: true,
            preparationInstructions: '',
            executionInstructions: '',
            completionRequirements: '',
            qualityStandards: '',
            expectedDeliverables: [],
            successCriteria: [],
            requiredEquipment: [],
            requiredMaterials: [],
            locationRequirements: '',
            suggestedBaseRate: 0,
            complexityMultiplier: 1.0,
            requiresApproval: false
          });
        }
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {mode === 'edit' ? 'Edit Service Definition' : 'Create New Service Definition'}
          </CardTitle>
          <CardDescription>
            Define a service template that locations can offer to associates with specific terms and compensation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                  placeholder="e.g., Kitchen Deep Cleaning"
                />
              </div>
              <div>
                <Label htmlFor="serviceCode">Service Code *</Label>
                <Input
                  id="serviceCode"
                  value={formData.serviceCode}
                  onChange={(e) => handleInputChange('serviceCode', e.target.value.toUpperCase())}
                  placeholder="e.g., KITCHEN-CLEAN-01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="complexity">Complexity Level *</Label>
                <Select value={formData.complexity} onValueChange={(value) => handleInputChange('complexity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief summary of the service"
              />
            </div>

            <div>
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="Comprehensive description of what this service involves"
                rows={3}
              />
            </div>

            {/* Duration Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="text-base font-medium">Duration Settings</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="durationRangeMinHours">Minimum Hours *</Label>
                  <Input
                    id="durationRangeMinHours"
                    type="number"
                    step="0.25"
                    value={formData.durationRangeMinHours}
                    onChange={(e) => handleInputChange('durationRangeMinHours', parseFloat(e.target.value))}
                    placeholder="2.0"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedDurationHours">Estimated Hours *</Label>
                  <Input
                    id="estimatedDurationHours"
                    type="number"
                    step="0.25"
                    value={formData.estimatedDurationHours}
                    onChange={(e) => handleInputChange('estimatedDurationHours', parseFloat(e.target.value))}
                    placeholder="4.0"
                  />
                </div>
                <div>
                  <Label htmlFor="durationRangeMaxHours">Maximum Hours *</Label>
                  <Input
                    id="durationRangeMaxHours"
                    type="number"
                    step="0.25"
                    value={formData.durationRangeMaxHours}
                    onChange={(e) => handleInputChange('durationRangeMaxHours', parseFloat(e.target.value))}
                    placeholder="6.0"
                  />
                </div>
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a required skill"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('requiredSkills', newSkill, setNewSkill)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('requiredSkills', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="preparationInstructions">Preparation Instructions</Label>
                <Textarea
                  id="preparationInstructions"
                  value={formData.preparationInstructions}
                  onChange={(e) => handleInputChange('preparationInstructions', e.target.value)}
                  placeholder="What needs to be prepared before starting this service"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="executionInstructions">Execution Instructions *</Label>
                <Textarea
                  id="executionInstructions"
                  value={formData.executionInstructions}
                  onChange={(e) => handleInputChange('executionInstructions', e.target.value)}
                  placeholder="Step-by-step instructions for completing this service"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="completionRequirements">Completion Requirements</Label>
                <Textarea
                  id="completionRequirements"
                  value={formData.completionRequirements}
                  onChange={(e) => handleInputChange('completionRequirements', e.target.value)}
                  placeholder="What needs to be done to consider this service complete"
                  rows={2}
                />
              </div>
            </div>

            {/* Expected Deliverables */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Expected Deliverables</Label>
              <div className="flex gap-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Add an expected deliverable"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('expectedDeliverables', newDeliverable, setNewDeliverable)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expectedDeliverables.map((deliverable: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {deliverable}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('expectedDeliverables', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pricing Guidelines */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <Label className="text-base font-medium">Pricing Guidelines</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="suggestedBaseRate">Suggested Base Rate ($)</Label>
                  <Input
                    id="suggestedBaseRate"
                    type="number"
                    step="0.01"
                    value={formData.suggestedBaseRate}
                    onChange={(e) => handleInputChange('suggestedBaseRate', parseFloat(e.target.value))}
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <Label htmlFor="complexityMultiplier">Complexity Multiplier</Label>
                  <Input
                    id="complexityMultiplier"
                    type="number"
                    step="0.1"
                    value={formData.complexityMultiplier}
                    onChange={(e) => handleInputChange('complexityMultiplier', parseFloat(e.target.value))}
                    placeholder="1.0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDefinition;