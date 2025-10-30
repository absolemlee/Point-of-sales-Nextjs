"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Coffee, LogOut, LogIn, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface TimeClockEntry {
  id: string;
  personnelId: string;
  clockType: 'CLOCK_IN' | 'BREAK_START' | 'BREAK_END' | 'CLOCK_OUT';
  clockTime: string;
  clockMethod: string;
  personnel?: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

interface TimeClockWidgetProps {
  personnel: Personnel[];
  onClockEvent: () => void;
  recentEntries: TimeClockEntry[];
}

export function TimeClockWidget({ personnel, onClockEvent, recentEntries }: TimeClockWidgetProps) {
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [clockType, setClockType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPersonnelStatus, setCurrentPersonnelStatus] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    // Calculate current status for each person based on recent entries
    const statusMap = new Map<string, string>();
    
    personnel.forEach(person => {
      const personEntries = recentEntries
        .filter(entry => entry.personnelId === person.id)
        .sort((a, b) => new Date(b.clockTime).getTime() - new Date(a.clockTime).getTime());
      
      if (personEntries.length > 0) {
        const lastEntry = personEntries[0];
        switch (lastEntry.clockType) {
          case 'CLOCK_IN':
            statusMap.set(person.id, 'CLOCKED_IN');
            break;
          case 'BREAK_START':
            statusMap.set(person.id, 'ON_BREAK');
            break;
          case 'BREAK_END':
            statusMap.set(person.id, 'CLOCKED_IN');
            break;
          case 'CLOCK_OUT':
            statusMap.set(person.id, 'CLOCKED_OUT');
            break;
          default:
            statusMap.set(person.id, 'CLOCKED_OUT');
        }
      } else {
        statusMap.set(person.id, 'CLOCKED_OUT');
      }
    });
    
    setCurrentPersonnelStatus(statusMap);
  }, [personnel, recentEntries]);

  const getPersonnelStatus = (personnelId: string) => {
    return currentPersonnelStatus.get(personnelId) || 'CLOCKED_OUT';
  };

  const getAvailableClockTypes = (personnelId: string) => {
    const status = getPersonnelStatus(personnelId);
    
    switch (status) {
      case 'CLOCKED_OUT':
        return [{ value: 'CLOCK_IN', label: 'Clock In', icon: LogIn }];
      case 'CLOCKED_IN':
        return [
          { value: 'BREAK_START', label: 'Start Break', icon: Coffee },
          { value: 'CLOCK_OUT', label: 'Clock Out', icon: LogOut }
        ];
      case 'ON_BREAK':
        return [
          { value: 'BREAK_END', label: 'End Break', icon: Coffee },
          { value: 'CLOCK_OUT', label: 'Clock Out', icon: LogOut }
        ];
      default:
        return [];
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CLOCKED_IN: { variant: "default" as const, color: "green", label: "Clocked In" },
      ON_BREAK: { variant: "secondary" as const, color: "yellow", label: "On Break" },
      CLOCKED_OUT: { variant: "outline" as const, color: "gray", label: "Clocked Out" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CLOCKED_OUT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleClockAction = async () => {
    if (!selectedPersonnel || !clockType) {
      toast({
        title: "Missing Information",
        description: "Please select an employee and clock action.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/timeclock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personnelId: selectedPersonnel,
          locationId: 'default-location', // This should come from context
          clockType: clockType,
          clockMethod: 'MANUAL',
          clockTime: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Clock action completed successfully.`,
        });
        
        // Reset form
        setSelectedPersonnel("");
        setClockType("");
        setShowConfirmDialog(false);
        
        // Refresh data
        onClockEvent();
      } else {
        throw new Error('Failed to record time clock entry');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record time clock entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPersonnel = () => {
    return personnel.find(p => p.id === selectedPersonnel);
  };

  const getSelectedClockTypeLabel = () => {
    if (!selectedPersonnel || !clockType) return "";
    
    const availableTypes = getAvailableClockTypes(selectedPersonnel);
    const selectedType = availableTypes.find(t => t.value === clockType);
    return selectedType?.label || "";
  };

  return (
    <div className="space-y-6">
      {/* Time Clock Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
          <CardDescription>
            Record employee clock in/out and break times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Employee</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{person.firstName} {person.lastName}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({person.employeeId})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPersonnel && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(getPersonnelStatus(selectedPersonnel))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Clock Action</label>
              <Select 
                value={clockType} 
                onValueChange={setClockType}
                disabled={!selectedPersonnel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedPersonnel && getAvailableClockTypes(selectedPersonnel).map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedPersonnel || !clockType || loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Record Time Clock Entry"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>
            Real-time employee clock status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {personnel.map((person) => {
              const status = getPersonnelStatus(person.id);
              const lastEntry = recentEntries
                .filter(entry => entry.personnelId === person.id)
                .sort((a, b) => new Date(b.clockTime).getTime() - new Date(a.clockTime).getTime())[0];

              return (
                <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{person.firstName} {person.lastName}</p>
                    <p className="text-sm text-muted-foreground">{person.employeeId}</p>
                    {lastEntry && (
                      <p className="text-xs text-muted-foreground">
                        Last: {lastEntry.clockType.replace('_', ' ')} at {new Date(lastEntry.clockTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Clock Activity</CardTitle>
          <CardDescription>
            Latest clock events from today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEntries.slice(0, 10).map((entry) => {
              const Icon = entry.clockType === 'CLOCK_IN' ? LogIn :
                          entry.clockType === 'CLOCK_OUT' ? LogOut : Coffee;
              
              return (
                <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.personnel?.firstName} {entry.personnel?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.clockType.replace('_', ' ')} • {entry.clockMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(entry.clockTime).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.clockTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {recentEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-6">
                No time clock entries for today
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Time Clock Entry</DialogTitle>
            <DialogDescription>
              Please confirm the following time clock action:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Employee:</span>
                <span>
                  {getSelectedPersonnel()?.firstName} {getSelectedPersonnel()?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Action:</span>
                <span>{getSelectedClockTypeLabel()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Method:</span>
                <span>Manual Entry</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleClockAction} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}