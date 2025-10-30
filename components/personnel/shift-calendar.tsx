"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, AlertTriangle } from "lucide-react";

interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface Shift {
  id: string;
  locationId: string;
  personnelId: string;
  shiftDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  shiftType: 'REGULAR' | 'OPENING' | 'CLOSING' | 'SPLIT' | 'DOUBLE';
  position: string;
  shiftStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  isSupervisorShift: boolean;
  requiresSupervisorPresent: boolean;
  personnel?: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

interface ShiftCalendarProps {
  shifts: Shift[];
  personnel: Personnel[];
  onShiftUpdate: () => void;
}

export function ShiftCalendar({ shifts, personnel, onShiftUpdate }: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [weeklyShifts, setWeeklyShifts] = useState<Shift[]>([]);

  useEffect(() => {
    loadWeeklyShifts();
  }, [currentDate, shifts]);

  const loadWeeklyShifts = async () => {
    try {
      const startOfWeek = getStartOfWeek(currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      // For now, filter from existing shifts
      const filteredShifts = shifts.filter(shift => 
        shift.shiftDate >= startDate && shift.shiftDate <= endDate
      );
      
      setWeeklyShifts(filteredShifts);
    } catch (error) {
      console.error('Error loading weekly shifts:', error);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day; // Sunday = 0
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getDaysOfWeek = () => {
    const days = [];
    const startOfWeek = getStartOfWeek(currentDate);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getShiftsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return weeklyShifts.filter(shift => shift.shiftDate === dateString);
  };

  const getShiftStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status as keyof typeof colors] || colors.SCHEDULED;
  };

  const getShiftTypeColor = (type: string) => {
    const colors = {
      OPENING: 'bg-yellow-100 text-yellow-800',
      CLOSING: 'bg-purple-100 text-purple-800',
      REGULAR: 'bg-blue-100 text-blue-800',
      SPLIT: 'bg-orange-100 text-orange-800',
      DOUBLE: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || colors.REGULAR;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const calculateShiftDuration = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    
    let diff = endTime.getTime() - startTime.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000; // Handle overnight shifts
    
    return Math.round(diff / (1000 * 60 * 60) * 100) / 100;
  };

  const getWeekSummary = () => {
    const summary = {
      totalShifts: weeklyShifts.length,
      supervisorShifts: weeklyShifts.filter(s => s.isSupervisorShift).length,
      totalHours: weeklyShifts.reduce((acc, shift) => 
        acc + calculateShiftDuration(shift.scheduledStartTime, shift.scheduledEndTime), 0
      ),
      uniqueEmployees: new Set(weeklyShifts.map(s => s.personnelId)).size
    };
    return summary;
  };

  const getDayCoverage = (date: Date) => {
    const dayShifts = getShiftsForDate(date);
    const hasOpening = dayShifts.some(s => s.shiftType === 'OPENING');
    const hasClosing = dayShifts.some(s => s.shiftType === 'CLOSING');
    const hasSupervisor = dayShifts.some(s => s.isSupervisorShift);
    
    return { hasOpening, hasClosing, hasSupervisor, shiftCount: dayShifts.length };
  };

  const weekSummary = getWeekSummary();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shift Calendar</h2>
          <p className="text-muted-foreground">
            Week of {getStartOfWeek(currentDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shifts</p>
                <p className="text-2xl font-bold">{weekSummary.totalShifts}</p>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisor Shifts</p>
                <p className="text-2xl font-bold">{weekSummary.supervisorShifts}</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{weekSummary.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{weekSummary.uniqueEmployees}</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Click on a shift to view details or edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysOfWeek().map((date, index) => {
              const dayShifts = getShiftsForDate(date);
              const coverage = getDayCoverage(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const dateString = date.toISOString().split('T')[0];

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg space-y-1 cursor-pointer hover:bg-muted/50 ${
                    isToday ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedDate(dateString)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : ''
                    }`}>
                      {date.getDate()}
                    </span>
                    {coverage.shiftCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {coverage.shiftCount}
                      </Badge>
                    )}
                  </div>

                  {/* Coverage Indicators */}
                  <div className="flex gap-1">
                    {!coverage.hasOpening && coverage.shiftCount > 0 && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full" title="No opening shift" />
                    )}
                    {!coverage.hasClosing && coverage.shiftCount > 0 && (
                      <div className="w-2 h-2 bg-red-400 rounded-full" title="No closing shift" />
                    )}
                    {!coverage.hasSupervisor && coverage.shiftCount > 0 && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" title="No supervisor" />
                    )}
                  </div>

                  {/* Shifts */}
                  <div className="space-y-1">
                    {dayShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getShiftStatusColor(shift.shiftStatus)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShift(shift);
                        }}
                      >
                        <div className="font-medium truncate">
                          {shift.personnel?.firstName} {shift.personnel?.lastName}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatTime(shift.scheduledStartTime)}-{formatTime(shift.scheduledEndTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={`text-xs ${getShiftTypeColor(shift.shiftType)}`}>
                            {shift.shiftType}
                          </Badge>
                          {shift.isSupervisorShift && (
                            <Badge variant="outline" className="text-xs">S</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayShifts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shift Detail Dialog */}
      {selectedShift && (
        <Dialog open={true} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
              <DialogDescription>
                {new Date(selectedShift.shiftDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Employee</label>
                  <p className="text-sm">
                    {selectedShift.personnel?.firstName} {selectedShift.personnel?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedShift.personnel?.employeeId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <p className="text-sm">{selectedShift.position}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Scheduled Time</label>
                  <p className="text-sm">
                    {formatTime(selectedShift.scheduledStartTime)} - {formatTime(selectedShift.scheduledEndTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {calculateShiftDuration(selectedShift.scheduledStartTime, selectedShift.scheduledEndTime)} hours
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedShift.shiftStatus.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className={getShiftTypeColor(selectedShift.shiftType)}>
                      {selectedShift.shiftType}
                    </Badge>
                  </div>
                </div>
              </div>

              {(selectedShift.isSupervisorShift || selectedShift.requiresSupervisorPresent) && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Supervisor Information</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedShift.isSupervisorShift && (
                      <p>• This is a supervisor shift</p>
                    )}
                    {selectedShift.requiresSupervisorPresent && (
                      <p>• Requires supervisor present</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Edit Shift
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel Shift
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}