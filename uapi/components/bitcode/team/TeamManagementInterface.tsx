'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { Badge } from "@/components/shadcn/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { Checkbox } from "@/components/shadcn/checkbox"
import { Textarea } from "@/components/shadcn/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs"
import { toast } from "sonner"
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Star, 
  Zap, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  DollarSign,
  Crown,
  AlertTriangle,
  Copy,
  ExternalLink,
  Filter,
  Download,
  Settings
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import menuStyles from '@/components/bitcode/menus/glassy-menu.module.css';

interface TeamMember {
  id: string
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'lead' | 'dev'
  status: 'active' | 'invited' | 'pending'
  btcFeeBudget: number
  btcFeesUsed: number
  joinedAt: string
  lastActive?: string
}

interface PendingInvitation {
  id: string
  email: string
  role: 'admin' | 'lead' | 'dev'
  btcFeeBudget: number
  createdAt: string
  expiresAt: string
  invitedBy: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

interface TeamManagementInterfaceProps {
  organizationId: string
  organizationName: string
  userRole: 'owner' | 'admin' | 'lead' | 'dev'
  emailDomain: string
  members: TeamMember[]
  pendingInvitations: PendingInvitation[]
  onRefresh: () => void
}

const roleConfig = {
  owner: {
    label: 'Owner',
    description: 'Full control over organization',
    icon: Crown,
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    textColor: 'text-yellow-600',
    canEdit: false
  },
  admin: {
    label: 'Admin',
    description: 'Manage team and organization settings',
    icon: Shield,
    color: 'bg-gradient-to-r from-red-400 to-pink-500',
    textColor: 'text-red-600',
    canEdit: true
  },
  lead: {
    label: 'Lead',
    description: 'Manage projects and team members',
    icon: Star,
    color: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    textColor: 'text-blue-600',
    canEdit: true
  },
  dev: {
    label: 'Developer',
    description: 'Access and contribute to projects',
    icon: Zap,
    color: 'bg-gradient-to-r from-green-400 to-emerald-500',
    textColor: 'text-green-600',
    canEdit: true
  }
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  invited: {
    label: 'Invited',
    color: 'bg-blue-100 text-blue-800',
    icon: Mail
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  }
}

export default function TeamManagementInterface({
  organizationId,
  organizationName,
  userRole,
  emailDomain,
  members: initialMembers,
  pendingInvitations: initialInvitations,
  onRefresh
}: TeamManagementInterfaceProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>(initialInvitations)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('members')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Invitation form state
  const [inviteForm, setInviteForm] = useState({
    emails: '',
    role: 'dev' as 'admin' | 'lead' | 'dev',
    btcFeeBudget: 50000,
    bulkMode: false
  })

  const canManageTeam = ['owner', 'admin'].includes(userRole)

  // Update state when props change
  useEffect(() => {
    setMembers(initialMembers)
    setPendingInvitations(initialInvitations)
  }, [initialMembers, initialInvitations])

  // Filter members and invitations
  const filteredMembers = members.filter(member =>
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvitations = pendingInvitations.filter(invitation =>
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInviteMembers = async () => {
    if (!canManageTeam) return

    setLoading(true)
    try {
      const emails = inviteForm.emails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'))

      if (emails.length === 0) {
        toast.error('Please enter at least one valid email address')
        return
      }

      // Validate email domains
      const invalidDomains = emails.filter(email => 
        email.split('@')[1] !== emailDomain
      )

      if (invalidDomains.length > 0) {
        toast.error(`All emails must use the @${emailDomain} domain`)
        return
      }

      const invitations = emails.map(email => ({
        email,
        role: inviteForm.role,
        btcFeeBudget: inviteForm.btcFeeBudget
      }))

      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          invitations.length === 1 
            ? invitations[0] 
            : { invitations }
        )
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitations')
      }

      const successCount = data.success?.length || (data.organization ? 1 : 0)
      const errorCount = data.errors?.length || 0

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}`)
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} invitation${errorCount > 1 ? 's' : ''} failed to send`)
      }

      setShowInviteModal(false)
      setInviteForm({
        emails: '',
        role: 'dev',
        btcFeeBudget: 50000,
        bulkMode: false
      })
      onRefresh()

    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: 'admin' | 'lead' | 'dev') => {
    if (!canManageTeam) return

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update member role')
      }

      toast.success('Member role updated successfully')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member role')
    }
  }

  const handleUpdateBtcFeeBudget = async (memberId: string, btcFeeBudget: number) => {
    if (!canManageTeam) return

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ btcFeeBudget })
      })

      if (!response.ok) {
        throw new Error('Failed to update BTC fee budget')
      }

      toast.success('BTC fee budget updated successfully')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update BTC fee budget')
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!canManageTeam) return

    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations/${invitationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete invitation')
      }

      toast.success('Invitation deleted successfully')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invitation')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!canManageTeam) return

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      toast.success('Member removed successfully')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const copyInviteLink = (invitationId: string, token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success('Invite link copied to clipboard')
  }

  const MemberCard = ({ member }: { member: TeamMember }) => {
    const roleInfo = roleConfig[member.role]
    const statusInfo = statusConfig[member.status]
    const RoleIcon = roleInfo.icon
    const StatusIcon = statusInfo.icon

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {canManageTeam && member.role !== 'owner' && (
                <Checkbox
                  checked={selectedMemberIds.includes(member.id)}
                  onCheckedChange={() => {
                    setSelectedMemberIds(prev =>
                      prev.includes(member.id)
                        ? prev.filter(id => id !== member.id)
                        : [...prev, member.id]
                    )
                  }}
                />
              )}
              <Avatar className="w-12 h-12">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {member.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-slate-900">{member.displayName}</h3>
                  <Badge variant="secondary" className={`text-xs ${roleInfo.textColor}`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">@{member.username}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <StatusIcon className="w-3 h-3" />
                    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    {member.btcFeesUsed.toLocaleString()} / {member.btcFeeBudget.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {canManageTeam && member.role !== 'owner' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={menuStyles.menu}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const newRole = prompt('New role (admin, lead, dev):', member.role)
                    if (newRole && ['admin', 'lead', 'dev'].includes(newRole)) {
                      handleUpdateMemberRole(member.id, newRole as any)
                    }
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const newBudget = prompt('New BTC fee budget:', member.btcFeeBudget.toString())
                    if (newBudget && !isNaN(Number(newBudget))) {
                      handleUpdateBtcFeeBudget(member.id, Number(newBudget))
                    }
                  }}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Update BTC Fees
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const InvitationCard = ({ invitation }: { invitation: PendingInvitation }) => {
    const roleInfo = roleConfig[invitation.role]
    const RoleIcon = roleInfo.icon
    const isExpired = new Date(invitation.expiresAt) < new Date()

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-slate-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-slate-900">{invitation.email}</h3>
                  <Badge variant="secondary" className={`text-xs ${roleInfo.textColor}`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Invited by {invitation.invitedBy.displayName || invitation.invitedBy.username}
                  </div>
                  <div>
                    BTC fee budget: {invitation.btcFeeBudget.toLocaleString()}
                  </div>
                  <div>
                    Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {canManageTeam && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={menuStyles.menu}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => copyInviteLink(invitation.id, 'token-placeholder')}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Invite Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.open(`mailto:${invitation.email}?subject=Team Invitation&body=You've been invited to join ${organizationName}`)
                  }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Send Reminder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteInvitation(invitation.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
          <p className="text-slate-600">
            Manage your team members and invitations for {organizationName}
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setShowInviteModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search members or invitations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedMemberIds.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {selectedMemberIds.length} selected
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Members ({members.length})</span>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Pending Invitations ({pendingInvitations.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {filteredMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members found</h3>
                <p className="text-slate-600 text-center mb-4">
                  {searchQuery ? 'Try adjusting your search query.' : 'Get started by inviting your first team member.'}
                </p>
                {canManageTeam && !searchQuery && (
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMembers.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {filteredInvitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending invitations</h3>
                <p className="text-slate-600 text-center mb-4">
                  {searchQuery ? 'Try adjusting your search query.' : 'All team invitations have been accepted or expired.'}
                </p>
                {canManageTeam && !searchQuery && (
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send New Invitations
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredInvitations.map(invitation => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="tablet:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Invite new team members to join {organizationName}. All emails must use the @{emailDomain} domain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                placeholder={`user1@${emailDomain}\nuser2@${emailDomain}\nuser3@${emailDomain}`}
                value={inviteForm.emails}
                onChange={(e) => setInviteForm(prev => ({ ...prev, emails: e.target.value }))}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter one email per line for bulk invitations
              </p>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Developer - Access and contribute to projects</SelectItem>
                  <SelectItem value="lead">Lead - Manage projects and team members</SelectItem>
                  <SelectItem value="admin">Admin - Manage team and organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="btcFeeBudget">BTC Fee Budget</Label>
              <Input
                id="btcFeeBudget"
                type="number"
                min="0"
                step="1000"
                value={inviteForm.btcFeeBudget}
                onChange={(e) => setInviteForm(prev => ({ ...prev, btcFeeBudget: Number(e.target.value) }))}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Initial BTC fee allocation for each invited member
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMembers} disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
