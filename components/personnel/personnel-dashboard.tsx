"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Calendar, Settings, Plus, CheckCircle, AlertCircle, Timer } from "lucide-react";
import { PersonnelForm } from "./personnel-form";
import { ShiftScheduler } from "./shift-scheduler";
import { TimeClockWidget } from "./time-clock-widget";
import { ShiftCalendar } from "./shift-calendar";

interface Associate {
  id: string;
  associateCode: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phoneNumber?: string;
  professionalTitle?: string;
  specializations: string[];
  yearsExperience: number;
  associateStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
  backgroundCheckStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  networkJoinDate: string;
  certifications?: AssociateCertification[];
  agreements?: Agreement[];
  authorizations?: LocationAuthorization[];
}

interface AssociateCertification {
  id: string;
  associateId: string;
  certificationStatus: 'IN_PROGRESS' | 'CERTIFIED' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  startDate: string;
  completionDate?: string;
  expirationDate?: string;
  certification?: {
    name: string;
    type: string;
    issuingOrganization: string;
    isRequiredForService: boolean;
  };
}

interface Agreement {
  id: string;
  associateId: string;
  locationId: string;
  agreementType: 'PARTNERSHIP' | 'SCOPED_PROJECT' | 'JUNIOR_ASSOCIATION' | 'CONSULTING' | 'SEASONAL' | 'EVENT_BASED';
  agreementTitle: string;
  agreementStatus: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
  paymentStructure: 'HOURLY' | 'DAILY' | 'PROJECT' | 'REVENUE_SHARE' | 'PARTNERSHIP_DRAW';
  baseRate?: number;
}

interface LocationAuthorization {
  id: string;
  associateId: string;
  locationId: string;
  authorizationType: 'FULL_ACCESS' | 'SERVICE_ONLY' | 'TRAINING' | 'RESTRICTED' | 'EMERGENCY_ONLY';
  canAccessPOS: boolean;
  canSuperviseOthers: boolean;
  canWorkAlone: boolean;
  requiresSupervision: boolean;
  authorizationStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
}

interface ServiceSchedule {
  id: string;
  locationId: string;
  associateId: string;
  scheduleDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  serviceType: 'REGULAR_SERVICE' | 'OPENING_SERVICE' | 'CLOSING_SERVICE' | 'TRAINING_SESSION' | 'SPECIAL_EVENT' | 'CONSULTING';
  serviceRole: string;
  serviceStatus: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  requiresSupervision: boolean;
  associate?: {
    firstName: string;
    lastName: string;
    associateCode: string;
    professionalTitle?: string;
  };
}

interface ServiceTimeEntry {
  id: string;
  associateId: string;
  entryType: 'SERVICE_START' | 'BREAK_START' | 'BREAK_END' | 'SERVICE_END' | 'CONSULTATION_START' | 'CONSULTATION_END';
  entryTime: string;
  entryMethod: string;
  serviceDescription?: string;
  associate?: {
    firstName: string;
    lastName: string;
    associateCode: string;
  };
}

export function PersonnelDashboard() {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [timeClockEntries, setTimeClockEntries] = useState<any[]>([]);
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [serviceTimeEntries, setServiceTimeEntries] = useState<ServiceTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAssociateForm, setShowAssociateForm] = useState(false);
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showServiceScheduler, setShowServiceScheduler] = useState(false);
  const [showShiftScheduler, setShowShiftScheduler] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load personnel
      const personnelResponse = await fetch('/api/personnel');
      const personnelData = await personnelResponse.json();
      setPersonnel(personnelData.personnel || []);

      // Load today's shifts
      const today = new Date().toISOString().split('T')[0];
      const shiftsResponse = await fetch(`/api/shifts?date=${today}`);
      const shiftsData = await shiftsResponse.json();
      setShifts(shiftsData.shifts || []);

      // Load today's time clock entries
      const timeClockResponse = await fetch(`/api/timeclock?date=${today}`);
      const timeClockData = await timeClockResponse.json();
      setTimeClockEntries(timeClockData.entries || []);
    } catch (error) {
      console.error('Error loading personnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { variant: "outline" as const, color: "blue" },
      IN_PROGRESS: { variant: "default" as const, color: "green" },
      COMPLETED: { variant: "secondary" as const, color: "gray" },
      NO_SHOW: { variant: "destructive" as const, color: "red" },
      CANCELLED: { variant: "outline" as const, color: "red" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    return <Badge variant={config.variant}>{status.replace('_', ' ')}</Badge>;
  };

  const getActivePersonnel = () => {
    return personnel.filter(p => p.employmentStatus === 'ACTIVE');
  };

  const getTodaysShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(s => s.shiftDate === today);
  };

  const getClockedInPersonnel = () => {
    // Find personnel who have clocked in but not clocked out today
    const clockedIn = new Set();
    const clockedOut = new Set();
    
    timeClockEntries.forEach(entry => {
      if (entry.clockType === 'CLOCK_IN') {
        clockedIn.add(entry.personnelId);
      } else if (entry.clockType === 'CLOCK_OUT') {
        clockedOut.add(entry.personnelId);
      }
    });

    return Array.from(clockedIn).filter(id => !clockedOut.has(id)).length;
  };

  const getScheduledSupervisors = () => {
    return getTodaysShifts().filter(s => s.isSupervisorShift && s.shiftStatus !== 'CANCELLED');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personnel Management</h1>
          <p className="text-muted-foreground">
            Manage staff, schedules, and time tracking across all locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowShiftScheduler(true)} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Shift
          </Button>
          <Button onClick={() => setShowPersonnelForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActivePersonnel().length}</div>
            <p className="text-xs text-muted-foreground">
              {personnel.filter(p => p.employmentStatus !== 'ACTIVE').length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Clocked In</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getClockedInPersonnel()}</div>
            <p className="text-xs text-muted-foreground">
              {getTodaysShifts().length} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTodaysShifts().length}</div>
            <p className="text-xs text-muted-foreground">
              {getScheduledSupervisors().length} supervisor shifts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Clock Events</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeClockEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Today's activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="timeclock">Time Clock</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Today's Shifts */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Shifts</CardTitle>
                <CardDescription>
                  Current shift status and coverage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTodaysShifts().length === 0 ? (
                    <p className="text-sm text-muted-foreground">No shifts scheduled for today</p>
                  ) : (
                    getTodaysShifts().map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">
                            {shift.personnel?.firstName} {shift.personnel?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shift.position} • {shift.scheduledStartTime} - {shift.scheduledEndTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {shift.isSupervisorShift && (
                            <Badge variant="outline" className="text-xs">Supervisor</Badge>
                          )}
                          {getShiftStatusBadge(shift.shiftStatus)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Time Clock Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Clock Activity</CardTitle>
                <CardDescription>
                  Latest clock in/out events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeClockEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                Manage employee information and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {personnel.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeId} • {employee.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hired: {new Date(employee.hireDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {employee.employmentStatus}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <ShiftCalendar shifts={shifts} personnel={personnel} onShiftUpdate={loadData} />
        </TabsContent>

        <TabsContent value="timeclock" className="space-y-4">
          <TimeClockWidget 
            personnel={personnel} 
            onClockEvent={loadData}
            recentEntries={timeClockEntries}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <ShiftCalendar shifts={shifts} personnel={personnel} onShiftUpdate={loadData} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPersonnelForm && (
        <PersonnelForm
          onClose={() => setShowPersonnelForm(false)}
          onPersonnelCreated={() => {
            setShowPersonnelForm(false);
            loadData();
          }}
        />
      )}

      {showShiftScheduler && (
        <ShiftScheduler
          personnel={personnel}
          onClose={() => setShowShiftScheduler(false)}
          onShiftCreated={() => {
            setShowShiftScheduler(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}