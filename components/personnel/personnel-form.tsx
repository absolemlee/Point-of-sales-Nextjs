"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Phone, Calendar, MapPin, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PersonnelFormProps {
  onClose: () => void;
  onPersonnelCreated: () => void;
}

interface PersonnelForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  hireDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hourlyRate: number;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  canAccessPOS: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canManagePersonnel: boolean;
  isLocationManager: boolean;
  maxHoursPerWeek: number;
  availableLocations: string[];
  notes: string;
}

const EMPLOYMENT_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' }
];

const DEFAULT_LOCATIONS = [
  { id: 'default-location', name: 'Main Kava Lounge' },
  { id: 'location-2', name: 'Downtown Location' },
  { id: 'location-3', name: 'Mall Location' }
];

export function PersonnelForm({ onClose, onPersonnelCreated }: PersonnelFormProps) {
  const [formData, setFormData] = useState<PersonnelForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    hireDate: new Date().toISOString().split('T')[0],
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    hourlyRate: 15.00,
    employmentStatus: 'ACTIVE',
    canAccessPOS: true,
    canManageInventory: false,
    canViewReports: false,
    canManagePersonnel: false,
    isLocationManager: false,
    maxHoursPerWeek: 40,
    availableLocations: ['default-location'],
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof PersonnelForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationToggle = (locationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availableLocations: checked 
        ? [...prev.availableLocations, locationId]
        : prev.availableLocations.filter(id => id !== locationId)
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phoneNumber.trim()) errors.push("Phone number is required");
    if (!formData.hireDate) errors.push("Hire date is required");
    if (formData.hourlyRate <= 0) errors.push("Hourly rate must be greater than 0");
    if (formData.availableLocations.length === 0) errors.push("At least one location must be selected");
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Invalid email format");
    }
    
    // Validate phone format (basic US format)
    const phoneRegex = /^\d{3}-?\d{3}-?\d{4}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'))) {
      errors.push("Invalid phone number format");
    }
    
    return errors;
  };

  const generateEmployeeId = () => {
    const firstName = formData.firstName.substring(0, 3).toUpperCase();
    const lastName = formData.lastName.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${firstName}${lastName}${random}`;
  };

  const calculatePermissions = () => {
    const permissions = [];
    
    if (formData.canAccessPOS) permissions.push('ACCESS_POS');
    if (formData.canManageInventory) permissions.push('MANAGE_INVENTORY');
    if (formData.canViewReports) permissions.push('VIEW_REPORTS');
    if (formData.canManagePersonnel) permissions.push('MANAGE_PERSONNEL');
    if (formData.isLocationManager) permissions.push('LOCATION_MANAGER');
    
    return permissions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        employeeId: generateEmployeeId(),
        permissions: calculatePermissions()
      };

      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Employee ${formData.firstName} ${formData.lastName} created successfully.`,
        });
        onPersonnelCreated();
      } else {
        throw new Error('Failed to create employee');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Create a new employee record with roles and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="employee@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="555-123-4567"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hire Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address, city, state, zip code"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.25"
                    placeholder="15.00"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value: any) => handleInputChange('employmentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxHoursPerWeek">Max Hours/Week</Label>
                  <Input
                    type="number"
                    value={formData.maxHoursPerWeek}
                    onChange={(e) => handleInputChange('maxHoursPerWeek', parseInt(e.target.value) || 0)}
                    min="0"
                    max="168"
                    placeholder="40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>POS System Access</Label>
                      <p className="text-xs text-muted-foreground">Allow access to point of sale system</p>
                    </div>
                    <Switch
                      checked={formData.canAccessPOS}
                      onCheckedChange={(checked) => handleInputChange('canAccessPOS', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inventory Management</Label>
                      <p className="text-xs text-muted-foreground">Manage inventory and stock levels</p>
                    </div>
                    <Switch
                      checked={formData.canManageInventory}
                      onCheckedChange={(checked) => handleInputChange('canManageInventory', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>View Reports</Label>
                      <p className="text-xs text-muted-foreground">Access sales and operational reports</p>
                    </div>
                    <Switch
                      checked={formData.canViewReports}
                      onCheckedChange={(checked) => handleInputChange('canViewReports', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Personnel Management</Label>
                      <p className="text-xs text-muted-foreground">Manage staff schedules and records</p>
                    </div>
                    <Switch
                      checked={formData.canManagePersonnel}
                      onCheckedChange={(checked) => handleInputChange('canManagePersonnel', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Location Manager</Label>
                      <p className="text-xs text-muted-foreground">Full management rights for assigned locations</p>
                    </div>
                    <Switch
                      checked={formData.isLocationManager}
                      onCheckedChange={(checked) => handleInputChange('isLocationManager', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Permission Summary */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Assigned Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {calculatePermissions().map(permission => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                  {calculatePermissions().length === 0 && (
                    <span className="text-xs text-muted-foreground">No permissions assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Location Access</CardTitle>
              <CardDescription className="text-xs">
                Select which locations this employee can work at
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEFAULT_LOCATIONS.map((location) => (
                  <div key={location.id} className="flex items-center justify-between">
                    <Label>{location.name}</Label>
                    <Switch
                      checked={formData.availableLocations.includes(location.id)}
                      onCheckedChange={(checked) => handleLocationToggle(location.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this employee..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating Employee..." : "Create Employee"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}