'use client'

import React, { useState } from 'react'
import { Button } from "@/components/shadcn/Button/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/Card/Card"
import { Input } from "@/components/shadcn/Input/Input"
import { Label } from "@/components/shadcn/Label/Label"
import { Badge } from "@/components/shadcn/Badge/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/Avatar/Avatar"
import { Switch } from "@/components/shadcn/Switch/Switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/Tabs/Tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcn/AlertDialog/AlertDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/Select/Select"
import { toast } from "sonner"
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Github,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  Users,
  Wallet,
  Waypoints,
} from 'lucide-react'
import { buildAuxillariesRoutePath, type ConcreteAuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta'

interface Organization {
  id: string
  name: string
  slug: string
  emailDomain: string
  logoUrl?: string
  settings: {
    allowPublicSignup?: boolean
    requireApproval?: boolean
    defaultRole?: 'dev' | 'lead'
    maxMembers?: number
    billingEmail?: string
    webhookUrl?: string
  }
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  btdBalance?: number
  memberCount: number
  createdAt: string
  updatedAt: string
}

interface OrganizationSettingsProps {
  organization: Organization
  userRole: 'owner' | 'admin' | 'lead' | 'dev'
  onUpdate: (updates: Partial<Organization>) => Promise<void>
  onDelete?: () => Promise<void>
}

const operatingTiers = {
  free: {
    label: 'Foundation',
    description: 'Minimal Bitcode posture for early treasury and team coordination.',
    maxMembers: 5,
    btdGuidance: 'Bring a connected wallet and GitHub surface before heavier transactions.',
    features: ['Identity and access posture', 'Wallet + GitHub prerequisite guidance', 'Core team coordination'],
    color: 'bg-slate-100 text-slate-800',
  },
  pro: {
    label: 'Operator',
    description: 'Expanded Bitcode operating posture for repeatable team and transaction flow.',
    maxMembers: 50,
    btdGuidance: 'Sustain repeatable BTC settlement and governed $BTD allocation across the team.',
    features: ['Treasury review surfaces', 'Execution and activity visibility', 'Priority operator support'],
    color: 'bg-blue-100 text-blue-800',
  },
  enterprise: {
    label: 'Network',
    description: 'Broad Bitcode operating posture for governed organizations and larger transaction volume.',
    maxMembers: -1,
    btdGuidance: 'Coordinate treasury, policy, and audited transaction posture across the network.',
    features: ['Unlimited members', 'Network-grade policy posture', 'Dedicated operator coordination'],
    color: 'bg-purple-100 text-purple-800',
  },
}

function openAuxillaryRoute(step: Extract<ConcreteAuxillaryPane, 'wallet' | 'externals'>) {
  if (typeof window !== 'undefined') {
    window.location.assign(buildAuxillariesRoutePath(step))
  }
}

export default function OrganizationSettings({
  organization,
  userRole,
  onUpdate,
  onDelete,
}: OrganizationSettingsProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    emailDomain: organization.emailDomain,
    logoUrl: organization.logoUrl || '',
    allowPublicSignup: organization.settings.allowPublicSignup || false,
    requireApproval: organization.settings.requireApproval || false,
    defaultRole: organization.settings.defaultRole || 'dev',
    maxMembers: organization.settings.maxMembers || 10,
    billingEmail: organization.settings.billingEmail || '',
    webhookUrl: organization.settings.webhookUrl || '',
  })

  const canManageOrganization = ['owner', 'admin'].includes(userRole)
  const canDeleteOrganization = userRole === 'owner'
  const operatingTier = operatingTiers[organization.subscriptionTier]
  const btdBalance = organization.btdBalance ?? 0

  const handleUpdateOrganization = async () => {
    if (!canManageOrganization) return

    setLoading(true)
    try {
      await onUpdate({
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        settings: {
          ...organization.settings,
          allowPublicSignup: formData.allowPublicSignup,
          requireApproval: formData.requireApproval,
          defaultRole: formData.defaultRole,
          maxMembers: formData.maxMembers,
          billingEmail: formData.billingEmail,
          webhookUrl: formData.webhookUrl,
        },
      })
      toast.success('Organization settings updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadLogo = async (file: File) => {
    if (!canManageOrganization) return

    setLogoUploading(true)
    try {
      void file
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      toast.error('Failed to upload logo')
    } finally {
      setLogoUploading(false)
    }
  }

  const generateApiKey = () => {
    const apiKey = `bitcode_${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  const handleDeleteOrganization = async () => {
    if (!canDeleteOrganization || !onDelete) return

    try {
      await onDelete()
      toast.success('Organization deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete organization')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.logoUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl text-white">
              {organization.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{organization.name}</h1>
            <div className="mt-1 flex items-center space-x-4">
              <Badge variant="secondary">@{organization.emailDomain}</Badge>
              <Badge className={operatingTier.color}>{operatingTier.label}</Badge>
              <span className="text-sm text-slate-600">
                {organization.memberCount} member{organization.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        {canManageOrganization ? (
          <Button onClick={handleUpdateOrganization} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Details</span>
              </CardTitle>
              <CardDescription>
                Basic metadata and access defaults for this Bitcode organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!canManageOrganization}
                  />
                </div>
                <div>
                  <Label htmlFor="org-slug">URL Slug</Label>
                  <Input
                    id="org-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    disabled={!canManageOrganization}
                  />
                  <p className="mt-1 text-xs text-slate-500">app.bitcode.ai/{formData.slug}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="email-domain">Email Domain</Label>
                <Input id="email-domain" value={formData.emailDomain} disabled className="bg-slate-50" />
                <p className="mt-1 text-xs text-slate-500">Contact support to change your email domain.</p>
              </div>

              <div>
                <Label>Organization Logo</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.logoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {canManageOrganization ? (
                    <div>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadLogo(file)
                        }}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload">
                        <Button variant="outline" size="sm" disabled={logoUploading} asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            {logoUploading ? 'Uploading...' : 'Upload Logo'}
                          </span>
                        </Button>
                      </label>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Settings</span>
              </CardTitle>
              <CardDescription>
                Configure who can enter and how member roles are assigned.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow public signup</Label>
                  <p className="text-sm text-slate-600">
                    Let anyone with your email domain request access automatically.
                  </p>
                </div>
                <Switch
                  checked={formData.allowPublicSignup}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowPublicSignup: checked }))}
                  disabled={!canManageOrganization}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require approval</Label>
                  <p className="text-sm text-slate-600">
                    New members require admin approval before they can transact.
                  </p>
                </div>
                <Switch
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireApproval: checked }))}
                  disabled={!canManageOrganization}
                />
              </div>

              <div>
                <Label htmlFor="default-role">Default Role</Label>
                <Select
                  value={formData.defaultRole}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, defaultRole: value }))}
                  disabled={!canManageOrganization}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Developer</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-slate-500">Role assigned to new members by default.</p>
              </div>

              <div>
                <Label htmlFor="max-members">Maximum Members</Label>
                <Input
                  id="max-members"
                  type="number"
                  min="1"
                  max={operatingTier.maxMembers === -1 ? 1000 : operatingTier.maxMembers}
                  value={formData.maxMembers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: Number(e.target.value) }))}
                  disabled={!canManageOrganization}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {operatingTier.maxMembers === -1
                    ? 'Unlimited members on the Network operating tier.'
                    : `Maximum ${operatingTier.maxMembers} members on ${operatingTier.label}.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Organization Treasury</span>
              </CardTitle>
              <CardDescription>
                Treasury posture is wallet-settled in BTC and issued in $BTD. Bitcode does not use Stripe or prepaid checkout units.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{operatingTier.label}</h3>
                    <p className="text-slate-600">{operatingTier.description}</p>
                  </div>
                  <Badge className={operatingTier.color}>{operatingTier.label}</Badge>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">$BTD Balance</p>
                    <p className="text-2xl font-bold text-emerald-600">{btdBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Members</p>
                    <p className="text-2xl font-bold">
                      {organization.memberCount}
                      {operatingTier.maxMembers !== -1 ? ` / ${operatingTier.maxMembers}` : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Operating posture:</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {operatingTier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 tablet:grid-cols-3">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Wallet className="h-4 w-4 text-emerald-700" />
                    Connected wallet
                  </div>
                  <p className="text-sm text-slate-600">
                    BTC settlement and issued BTD posture are reviewed from Wallet.
                  </p>
                </div>
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Github className="h-4 w-4 text-emerald-700" />
                    GitHub before transacting
                  </div>
                  <p className="text-sm text-slate-600">
                    Reads, asset packs, and repository delivery stay blocked until GitHub posture is connected.
                  </p>
                </div>
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Waypoints className="h-4 w-4 text-emerald-700" />
                    Externals governs entry
                  </div>
                  <p className="text-sm text-slate-600">
                    SSO variety, external-provider posture, and repository access are configured in the Externals auxillary.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => openAuxillaryRoute('wallet')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Open Wallet Auxillary
                </Button>
                <Button variant="outline" onClick={() => openAuxillaryRoute('externals')}>
                  <Github className="mr-2 h-4 w-4" />
                  Open Externals Auxillary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>API Access</span>
              </CardTitle>
              <CardDescription>
                Manage API keys and webhook delivery for organization integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>API Key</Label>
                  <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input type={showApiKey ? 'text' : 'password'} value="bitcode_1234567890abcdef" readOnly className="font-mono" />
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText('bitcode_1234567890abcdef')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateApiKey}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Keep your API key secure. It provides full access to your organization.
                </p>
              </div>

              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-app.com/webhooks/bitcode"
                  disabled={!canManageOrganization}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Receive notifications about member posture, treasury events, and execution activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
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
                        This action cannot be undone. This will permanently delete the <strong>{organization.name}</strong> organization and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteOrganization} className="bg-red-600 hover:bg-red-700">
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
