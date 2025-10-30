export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">KavaPR Demo</h1>
              <p className="text-sm text-muted-foreground">
                Editable Configuration System
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Demo Environment
            </div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}