/**
 * Advanced organization analytics exports and danger-zone delete.
 */

import React from 'react';
import { Button } from '@/components/shadcn/Button/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadcn/AlertDialog/AlertDialog';
import { AlertTriangle, BarChart3, Calendar, Shield, Trash2, Users } from 'lucide-react';

export interface OrganizationAdvancedTabProps {
  organizationName: string;
  canDeleteOrganization: boolean;
  onDelete?: () => Promise<void>;
  onDeleteOrganization: () => void;
}

export default function OrganizationAdvancedTab({
  organizationName,
  canDeleteOrganization,
  onDelete,
  onDeleteOrganization,
}: OrganizationAdvancedTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analytics & Reports</span>
          </CardTitle>
          <CardDescription>
            Export organization data and audit-facing reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Users className="mb-2 h-6 w-6" />
            <span>Export Members</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="mb-2 h-6 w-6" />
            <span>Treasury Report</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="mb-2 h-6 w-6" />
            <span>Activity Log</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Shield className="mb-2 h-6 w-6" />
            <span>Audit Trail</span>
          </Button>
        </CardContent>
      </Card>

      {canDeleteOrganization && onDelete ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              Irreversible actions that will permanently affect your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the <strong>{organizationName}</strong> organization and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteOrganization} className="bg-red-600 hover:bg-red-700">
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
