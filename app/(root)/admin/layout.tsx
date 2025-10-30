import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-primary">SuperAdmin Panel</div>
            <div className="text-sm text-muted-foreground">
              System Administration & Control
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}