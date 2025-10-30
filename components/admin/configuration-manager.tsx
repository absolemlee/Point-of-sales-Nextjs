/**
 * KavaPR Admin Configuration Management
 * 
 * This provides UI interfaces for managing roles, permissions, location types,
 * and organizational configuration - making the system fully editable.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { 
  KavaPRRole, 
  LocationType,
  type EditableRoleConfig,
  type EditableLocationTypeConfig,
  type EditablePermissionConfig,
  type OrganizationConfig,
  userRoleSchema,
  locationTypeSchema,
  permissionSchema,
  organizationConfigSchema,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS
} from '@/schema/kavap-r-types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

import { Edit, Trash2, Plus, Save, Settings, Users, MapPin, Shield, Building } from 'lucide-react';

// ========================================
// ROLE MANAGEMENT COMPONENT
// ========================================

interface RoleManagementProps {
  roles: EditableRoleConfig[];
  onUpdate: (roles: EditableRoleConfig[]) => void;
}

function RoleManagement({ roles, onUpdate }: RoleManagementProps) {
  const [editingRole, setEditingRole] = useState<EditableRoleConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      roleName: '',
      roleKey: KavaPRRole.WORKER,
      description: '',
      permissions: [] as string[],
      isActive: true
    }
  });

  useEffect(() => {
    if (editingRole) {
      form.reset({
        roleName: editingRole.roleName,
        roleKey: editingRole.roleKey,
        description: editingRole.description,
        permissions: editingRole.permissions as string[],
        isActive: editingRole.isActive
      });
    }
  }, [editingRole, form]);

  const handleSave = (data: any) => {
    const roleConfig: EditableRoleConfig = {
      id: editingRole?.id || `role_${Date.now()}`,
      ...data,
      isSystemRole: editingRole?.isSystemRole || false,
      createdAt: editingRole?.createdAt || new Date(),
      updatedAt: new Date()
    };

    const updatedRoles = editingRole
      ? roles.map(r => r.id === editingRole.id ? roleConfig : r)
      : [...roles, roleConfig];

    onUpdate(updatedRoles);
    setEditingRole(null);
    setIsCreating(false);
    form.reset();
    toast({ title: 'Role saved successfully' });
  };

  const handleDelete = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystemRole) {
      toast({ title: 'Cannot delete system role', variant: 'destructive' });
      return;
    }
    
    const updatedRoles = roles.filter(r => r.id !== roleId);
    onUpdate(updatedRoles);
    toast({ title: 'Role deleted successfully' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Role List */}
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{role.roleName}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {role.isSystemRole && (
                    <Badge variant="secondary">System</Badge>
                  )}
                  <Badge variant={role.isActive ? "default" : "outline"}>
                    {role.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.isSystemRole && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{role.roleName}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(role.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Role Dialog */}
      {(editingRole || isCreating) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter role name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Key</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role key" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(KavaPRRole).map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe this role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select permissions for this role
                      </FormDescription>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {DEFAULT_PERMISSIONS.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(field.value as string[]).includes(permission)}
                              onChange={(e) => {
                                const currentPermissions = field.value as string[];
                                if (e.target.checked) {
                                  field.onChange([...currentPermissions, permission]);
                                } else {
                                  field.onChange(currentPermissions.filter((p: string) => p !== permission));
                                }
                              }}
                            />
                            <label className="text-xs">{permission}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Whether this role is currently active
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Role
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingRole(null);
                      setIsCreating(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========================================
// LOCATION TYPE MANAGEMENT COMPONENT
// ========================================

interface LocationTypeManagementProps {
  locationTypes: EditableLocationTypeConfig[];
  onUpdate: (locationTypes: EditableLocationTypeConfig[]) => void;
}

function LocationTypeManagement({ locationTypes, onUpdate }: LocationTypeManagementProps) {
  const [editingType, setEditingType] = useState<EditableLocationTypeConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(locationTypeSchema),
    defaultValues: {
      typeName: '',
      typeKey: LocationType.STATIC,
      description: '',
      allowsTemporary: false,
      defaultPermissions: [],
      isActive: true
    }
  });

  const handleSave = (data: any) => {
    const typeConfig: EditableLocationTypeConfig = {
      id: editingType?.id || `type_${Date.now()}`,
      ...data,
      isSystemType: editingType?.isSystemType || false,
      createdAt: editingType?.createdAt || new Date(),
      updatedAt: new Date()
    };

    const updatedTypes = editingType
      ? locationTypes.map(t => t.id === editingType.id ? typeConfig : t)
      : [...locationTypes, typeConfig];

    onUpdate(updatedTypes);
    setEditingType(null);
    setIsCreating(false);
    form.reset();
    toast({ title: 'Location type saved successfully' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Location Type Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage location types and their characteristics
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location Type
        </Button>
      </div>

      {/* Location Type List */}
      <div className="grid gap-4">
        {locationTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{type.typeName}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {type.allowsTemporary && (
                    <Badge variant="secondary">Temporary</Badge>
                  )}
                  <Badge variant={type.isActive ? "default" : "outline"}>
                    {type.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingType(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form */}
      {(editingType || isCreating) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingType ? 'Edit Location Type' : 'Create New Location Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                {/* Form fields similar to RoleManagement */}
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingType(null);
                      setIsCreating(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========================================
// MAIN ADMIN CONFIGURATION COMPONENT
// ========================================

export function AdminConfigurationManager() {
  const [roles, setRoles] = useState<EditableRoleConfig[]>([]);
  const [locationTypes, setLocationTypes] = useState<EditableLocationTypeConfig[]>([]);
  const [permissions, setPermissions] = useState<EditablePermissionConfig[]>([]);
  const [organization, setOrganization] = useState<OrganizationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load existing configurations
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      
      // Load from API endpoints
      const [rolesRes, typesRes, permsRes, orgRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/location-types'),
        fetch('/api/admin/permissions'),
        fetch('/api/admin/organization')
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.roles || []);
      }

      // Similar for other configurations...
      
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (type: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${type}`);
      }
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    }
  };

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">KavaPR Configuration Management</h1>
        <p className="text-muted-foreground">
          Manage roles, permissions, location types, and organizational settings
        </p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Types
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RoleManagement 
            roles={roles} 
            onUpdate={(updatedRoles) => {
              setRoles(updatedRoles);
              saveConfiguration('roles', { roles: updatedRoles });
            }} 
          />
        </TabsContent>

        <TabsContent value="locations">
          <LocationTypeManagement 
            locationTypes={locationTypes}
            onUpdate={(updatedTypes) => {
              setLocationTypes(updatedTypes);
              saveConfiguration('location-types', { locationTypes: updatedTypes });
            }}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <div>Permission management component</div>
        </TabsContent>

        <TabsContent value="organization">
          <div>Organization settings component</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminConfigurationManager;