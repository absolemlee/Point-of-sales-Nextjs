/* eslint-disable react/no-unescaped-entities */
'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';
import {
  IconWifi,
  IconClock,
  IconCloud,
  IconCalendarMonth,
  IconTableColumn,
} from '@tabler/icons-react';
import DigitalClock from '../clock/clock';
import DateComponent from '../date/date';
import WeatherComponent from '../weather/weather';
import DashboardCard from '../card/card';
import NetworkSpeed from '../networkspeed/networkspeed';
import { ServiceStatsCard } from '../card/service-stats';
import { QuickAccessPanel } from '../card/quick-access';
import { ServiceExchangeQuickAccess } from '../card/service-quick-access';
import { POSQuickAccess } from '../card/pos-quick-access';
import { LocationOverview } from '../card/location-overview';
import { POSSystemStatus } from '../card/pos-system-status';
import { ShiftSummaryWidget } from '../shift/shift-summary-widget';
export function BentoGridHome() {
  return (
    <BentoGrid className="w-full mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn('[&>p:text-lg]', item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const items = [
  {
    title: "Don't Forget To Rest Your Soul",
    description: <span className="text-sm">Experience the power of time.</span>,
    header: <DigitalClock />,
    className: 'md:col-span-1',
    icon: <IconClock className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'POS Quick Access',
    description: <span className="text-sm">Access key retail management functions.</span>,
    header: <POSQuickAccess />,
    className: 'md:col-span-1',
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Current Shift Status',
    description: <span className="text-sm">Monitor active shift operations and worker status.</span>,
    header: <ShiftSummaryWidget locationId="loc-downtown-cafe" showActions={true} />,
    className: 'md:col-span-1',
    icon: <IconClock className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Location Performance',
    description: <span className="text-sm">Real-time metrics across all store locations.</span>,
    header: <LocationOverview />,
    className: 'md:col-span-2',
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Business Analysis',
    description: <span className="text-sm">Understand sales & service performance.</span>,
    header: <DashboardCard />,
    className: 'md:col-span-2',
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'System Status',
    description: <span className="text-sm">Monitor POS infrastructure health.</span>,
    header: <POSSystemStatus />,
    className: 'md:col-span-2',
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Service Hub',
    description: <span className="text-sm">Quick access to service management.</span>,
    header: <ServiceExchangeQuickAccess />,
    className: 'md:col-span-1',
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Network Speed',
    description: <span className="text-sm">Summarize your Network Speed.</span>,
    header: <NetworkSpeed />,
    className: 'md:col-span-1',
    icon: <IconWifi className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Tomorrow is Tomorrow not Today',
    description: <span className="text-sm">Every Day is Amazing</span>,
    header: <DateComponent />,
    className: 'md:col-span-1',
    icon: <IconCalendarMonth className="h-4 w-4 text-neutral-500" />,
  },
];
