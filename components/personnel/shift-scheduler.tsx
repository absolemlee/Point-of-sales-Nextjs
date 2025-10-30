"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  roles?: PersonnelRole[];
}

interface PersonnelRole {
  roleName: string;
  locationId: string;
  permissions: string[];
}

interface ShiftSchedulerProps {
  personnel: Personnel[];
  onClose: () => void;
  onShiftCreated: () => void;
}

interface ShiftForm {
  personnelId: string;
  locationId: string;
  shiftDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  scheduledBreakDurationMinutes: number;
  shiftType: 'REGULAR' | 'OPENING' | 'CLOSING' | 'SPLIT' | 'DOUBLE';
  position: string;
  hourlyRate?: number;
  isSupervisorShift: boolean;
  requiresSupervisorPresent: boolean;
  notes: string;
}

const SHIFT_TYPES = [
  { value: 'REGULAR', label: 'Regular Shift' },
  { value: 'OPENING', label: 'Opening Shift' },
  { value: 'CLOSING', label: 'Closing Shift' },
  { value: 'SPLIT', label: 'Split Shift' },
  { value: 'DOUBLE', label: 'Double Shift' }
];

const COMMON_POSITIONS = [
  'Barista',
  'Shift Lead',
  'Shift Supervisor',
  'Assistant Manager',
  'Manager',
  'Server',
  'Kitchen Staff',
  'Cashier',
  'Security',
  'Maintenance'
];

export function ShiftScheduler({ personnel, onClose, onShiftCreated }: ShiftSchedulerProps) {
  const [formData, setFormData] = useState<ShiftForm>({
    personnelId: '',
    locationId: 'default-location',
    shiftDate: new Date().toISOString().split('T')[0],
    scheduledStartTime: '09:00',
    scheduledEndTime: '17:00',
    scheduledBreakDurationMinutes: 30,
    shiftType: 'REGULAR',
    position: '',
    isSupervisorShift: false,
    requiresSupervisorPresent: false,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ShiftForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSelectedPersonnel = () => {
    return personnel.find(p => p.id === formData.personnelId);
  };

  const calculateShiftDuration = () => {
    if (!formData.scheduledStartTime || !formData.scheduledEndTime) return 0;
    
    const start = new Date(`2000-01-01T${formData.scheduledStartTime}:00`);
    const end = new Date(`2000-01-01T${formData.scheduledEndTime}:00`);
    
    let diff = end.getTime() - start.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000; // Handle overnight shifts
    
    return Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Hours with 2 decimal places
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.personnelId) errors.push("Employee is required");
    if (!formData.shiftDate) errors.push("Shift date is required");
    if (!formData.scheduledStartTime) errors.push("Start time is required");
    if (!formData.scheduledEndTime) errors.push("End time is required");
    if (!formData.position) errors.push("Position is required");
    
    const duration = calculateShiftDuration();
    if (duration > 12) {
      errors.push("Shift duration cannot exceed 12 hours");
    }
    if (duration < 0.5) {
      errors.push("Shift duration must be at least 30 minutes");
    }
    
    // Check if shift is in the past
    const shiftDateTime = new Date(`${formData.shiftDate}T${formData.scheduledStartTime}`);
    if (shiftDateTime < new Date()) {
      errors.push("Cannot schedule shifts in the past");
    }
    
    return errors;
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
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Shift scheduled successfully.",
        });
        onShiftCreated();
      } else {
        throw new Error('Failed to create shift');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedHourlyRate = () => {
    if (formData.isSupervisorShift) return 18.00;
    if (formData.position.toLowerCase().includes('lead')) return 16.50;
    if (formData.position.toLowerCase().includes('manager')) return 20.00;
    return 15.00;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Shift
          </DialogTitle>
          <DialogDescription>
            Create a new shift assignment for an employee
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="personnelId">Employee *</Label>
              <Select value={formData.personnelId} onValueChange={(value) => handleInputChange('personnelId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      <div className="flex flex-col">
                        <span>{person.firstName} {person.lastName}</span>
                        <span className="text-xs text-muted-foreground">
                          {person.employeeId}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getSelectedPersonnel()?.roles && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Roles:</p>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedPersonnel()?.roles?.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role.roleName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="shiftDate">Date *</Label>
              <Input
                type="date"
                value={formData.shiftDate}
                onChange={(e) => handleInputChange('shiftDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="scheduledStartTime">Start Time *</Label>
              <Input
                type="time"
                value={formData.scheduledStartTime}
                onChange={(e) => handleInputChange('scheduledStartTime', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="scheduledEndTime">End Time *</Label>
              <Input
                type="time"
                value={formData.scheduledEndTime}
                onChange={(e) => handleInputChange('scheduledEndTime', e.target.value)}
              />
            </div>
          </div>

          {/* Shift Duration Display */}
          {formData.scheduledStartTime && formData.scheduledEndTime && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Shift Duration:</span>
                  </div>
                  <Badge variant="outline">
                    {calculateShiftDuration()} hours
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shift Type and Break */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="shiftType">Shift Type</Label>
              <Select value={formData.shiftType} onValueChange={(value: any) => handleInputChange('shiftType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduledBreakDurationMinutes">Break Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.scheduledBreakDurationMinutes}
                onChange={(e) => handleInputChange('scheduledBreakDurationMinutes', parseInt(e.target.value) || 0)}
                min="0"
                max="120"
                step="15"
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                type="number"
                value={formData.hourlyRate || suggestedHourlyRate()}
                onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || undefined)}
                min="0"
                step="0.25"
                placeholder={`Suggested: $${suggestedHourlyRate()}`}
              />
            </div>
          </div>

          {/* Supervisor Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Supervisor Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isSupervisorShift">This is a supervisor shift</Label>
                  <p className="text-xs text-muted-foreground">
                    Employee will have supervisory responsibilities
                  </p>
                </div>
                <Switch
                  checked={formData.isSupervisorShift}
                  onCheckedChange={(checked) => handleInputChange('isSupervisorShift', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requiresSupervisorPresent">Requires supervisor present</Label>
                  <p className="text-xs text-muted-foreground">
                    A supervisor must be present during this shift
                  </p>
                </div>
                <Switch
                  checked={formData.requiresSupervisorPresent}
                  onCheckedChange={(checked) => handleInputChange('requiresSupervisorPresent', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions..."
              rows={3}
            />
          </div>

          {/* Validation Warnings */}
          {formData.scheduledStartTime && formData.scheduledEndTime && calculateShiftDuration() > 8 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    This shift is longer than 8 hours. Consider scheduling additional breaks.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Scheduling..." : "Schedule Shift"}
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