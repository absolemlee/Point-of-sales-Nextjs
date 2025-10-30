import { HoverEffect } from '../ui/card-hover-effect';
import { Card } from '@/components/ui/card';
export function CardHoverEffectDemo() {
  return (
    <Card className="h-full w-full">
      <HoverEffect items={projects} />
    </Card>
  );
}
export const projects = [
  {
    title: 'Service Exchange System',
    description: 'Revolutionary project-based service delivery platform enabling associates to offer specialized services with fixed compensation and duration ranges.',
    link: '/services',
  },
  {
    title: 'Location Management',
    description: 'Comprehensive location-centered management system with real-time analytics, inventory tracking, and personnel coordination.',
    link: '/locations',
  },
  {
    title: 'Associate Network',
    description: 'Advanced personnel management with service specializations, certifications, and performance tracking across multiple locations.',
    link: '/personnel',
  },
  {
    title: 'Next.js Framework',
    description: 'Built on Next.js 14 with App Router, TypeScript, and modern React patterns for enterprise-grade performance.',
    link: 'https://nextjs.org',
  },
  {
    title: 'Prisma ORM',
    description: 'Type-safe database operations with PostgreSQL backend, featuring comprehensive service exchange models and relationships.',
    link: 'https://www.prisma.io',
  },
  {
    title: 'Shadcn/ui Components',
    description: 'Modern, accessible UI components with dark mode support, responsive design, and consistent design system.',
    link: 'https://ui.shadcn.com',
  },
];
