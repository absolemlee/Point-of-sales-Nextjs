"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Calendar, Settings, Plus, CheckCircle, AlertCircle, Timer, Award, FileText } from "lucide-react";
// TODO: Create associate-specific components
// import { AssociateForm } from "./associate-form";
// import { ServiceScheduler } from "./service-scheduler";
// import { ServiceTimeWidget } from "./service-time-widget";
// import { ServiceCalendar } from "./service-calendar";

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

export function AssociateDashboard() {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [serviceTimeEntries, setServiceTimeEntries] = useState<ServiceTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAssociateForm, setShowAssociateForm] = useState(false);
  const [showServiceScheduler, setShowServiceScheduler] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load associates
      const associatesResponse = await fetch('/api/associates');
      const associatesData = await associatesResponse.json();
      setAssociates(associatesData.personnel || []);

      // Load today's service schedules
      const today = new Date().toISOString().split('T')[0];
      const schedulesResponse = await fetch(`/api/service-schedules?date=${today}`);
      const schedulesData = await schedulesResponse.json();
      setServiceSchedules(schedulesData.shifts || []);

      // Load today's service time entries
      const timeEntriesResponse = await fetch(`/api/service-time?date=${today}`);
      const timeEntriesData = await timeEntriesResponse.json();
      setServiceTimeEntries(timeEntriesData.entries || []);
    } catch (error) {
      console.error('Error loading associate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { variant: "outline" as const, color: "blue" },
      CONFIRMED: { variant: "secondary" as const, color: "blue" },
      IN_PROGRESS: { variant: "default" as const, color: "green" },
      COMPLETED: { variant: "secondary" as const, color: "gray" },
      NO_SHOW: { variant: "destructive" as const, color: "red" },
      CANCELLED: { variant: "outline" as const, color: "red" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    return <Badge variant={config.variant}>{status.replace('_', ' ')}</Badge>;
  };

  const getAssociateStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default" as const, color: "green" },
      PENDING: { variant: "secondary" as const, color: "yellow" },
      INACTIVE: { variant: "outline" as const, color: "gray" },
      SUSPENDED: { variant: "destructive" as const, color: "red" },
      TERMINATED: { variant: "destructive" as const, color: "red" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{status}</Badge>;
  };

  const getActiveAssociates = () => {
    return associates.filter(a => a.associateStatus === 'ACTIVE');
  };

  const getTodaysSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return serviceSchedules.filter(s => s.scheduleDate === today);
  };

  const getCurrentlyServing = () => {
    // Find associates who have started service but not ended it today
    const serviceStarted = new Set<string>();
    const serviceEnded = new Set<string>();
    
    serviceTimeEntries.forEach(entry => {
      if (entry.entryType === 'SERVICE_START') {
        serviceStarted.add(entry.associateId);
      } else if (entry.entryType === 'SERVICE_END') {
        serviceEnded.add(entry.associateId);
      }
    });

    return Array.from(serviceStarted).filter(id => !serviceEnded.has(id)).length;
  };

  const getScheduledSupervision = () => {
    return getTodaysSchedules().filter(s => s.requiresSupervision && s.serviceStatus !== 'CANCELLED');
  };

  const getCertifiedAssociates = () => {
    return associates.filter(a => 
      a.certifications?.some(cert => cert.certificationStatus === 'CERTIFIED')
    ).length;
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
          <h1 className="text-3xl font-bold tracking-tight">Associate Management</h1>
          <p className="text-muted-foreground">
            Manage professional kava associates, service agreements, and certifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowServiceScheduler(true)} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Service
          </Button>
          <Button onClick={() => setShowAssociateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Associate
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Associates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveAssociates().length}</div>
            <p className="text-xs text-muted-foreground">
              {associates.filter(a => a.associateStatus !== 'ACTIVE').length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Serving</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCurrentlyServing()}</div>
            <p className="text-xs text-muted-foreground">
              {getTodaysSchedules().length} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTodaysSchedules().length}</div>
            <p className="text-xs text-muted-foreground">
              {getScheduledSupervision().length} requiring supervision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified Professionals</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCertifiedAssociates()}</div>
            <p className="text-xs text-muted-foreground">
              Professional certifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="associates">Associates</TabsTrigger>
          <TabsTrigger value="schedules">Service Schedules</TabsTrigger>
          <TabsTrigger value="timetracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Today's Service Schedules */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Service Schedules</CardTitle>
                <CardDescription>
                  Current service status and coverage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTodaysSchedules().length === 0 ? (
                    <p className="text-sm text-muted-foreground">No service schedules for today</p>
                  ) : (
                    getTodaysSchedules().map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">
                            {schedule.associate?.firstName} {schedule.associate?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.serviceRole} • {schedule.scheduledStartTime} - {schedule.scheduledEndTime}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.associate?.professionalTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {schedule.requiresSupervision && (
                            <Badge variant="outline" className="text-xs">Supervised</Badge>
                          )}
                          {getServiceStatusBadge(schedule.serviceStatus)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Service Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Activity</CardTitle>
                <CardDescription>
                  Latest service time entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceTimeEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">
                          {entry.associate?.firstName} {entry.associate?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.entryType.replace('_', ' ')} • {entry.entryMethod}
                        </p>
                        {entry.serviceDescription && (
                          <p className="text-xs text-muted-foreground">
                            {entry.serviceDescription}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(entry.entryTime).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.entryTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="associates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Associates</CardTitle>
              <CardDescription>
                Manage associate information and professional credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {associates.map((associate) => (
                  <div key={associate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {associate.firstName} {associate.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {associate.associateCode}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {associate.professionalTitle} • {associate.yearsExperience} years experience
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {associate.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {associate.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAssociateStatusBadge(associate.associateStatus)}
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
          <Card>
            <CardHeader>
              <CardTitle>Service Schedules</CardTitle>
              <CardDescription>Service scheduling interface (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service calendar component will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Time Tracking</CardTitle>
              <CardDescription>Time tracking interface (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service time widget component will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Certifications</CardTitle>
              <CardDescription>
                Track associate certifications and professional development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {associates.map((associate) => (
                  <div key={associate.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{associate.firstName} {associate.lastName}</h4>
                        <p className="text-sm text-muted-foreground">{associate.associateCode}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Award className="h-4 w-4 mr-2" />
                        Manage Certs
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {associate.certifications && associate.certifications.length > 0 ? (
                        associate.certifications.map((cert) => (
                          <div key={cert.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{cert.certification?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.certification?.issuingOrganization}
                              </p>
                            </div>
                            <Badge 
                              variant={cert.certificationStatus === 'CERTIFIED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {cert.certificationStatus}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No certifications on record</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Agreements</CardTitle>
              <CardDescription>
                Manage partnership agreements and service contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {associates.map((associate) => (
                  <div key={associate.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{associate.firstName} {associate.lastName}</h4>
                        <p className="text-sm text-muted-foreground">{associate.associateCode}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Agreement
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {associate.agreements && associate.agreements.length > 0 ? (
                        associate.agreements.map((agreement) => (
                          <div key={agreement.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{agreement.agreementTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {agreement.agreementType.replace('_', ' ')} • {agreement.paymentStructure}
                                {agreement.baseRate && ` • $${agreement.baseRate}/hr`}
                              </p>
                            </div>
                            <Badge 
                              variant={agreement.agreementStatus === 'ACTIVE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {agreement.agreementStatus}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No agreements on record</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals - TODO: Implement associate-specific forms */}
      {showAssociateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Associate</CardTitle>
              <CardDescription>Associate form coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAssociateForm(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showServiceScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule Service</CardTitle>
              <CardDescription>Service scheduler coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowServiceScheduler(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}