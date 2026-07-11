'use client'

import React from 'react'
import { Button } from "@/components/shadcn/Button/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/Card/Card"
import { Badge } from "@/components/shadcn/Badge/Badge"
import { Avatar, AvatarFallback } from "@/components/shadcn/Avatar/Avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/Tabs/Tabs"
import { Progress } from "@/components/shadcn/Progress/Progress"
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Github,
  RefreshCw,
  Wallet,
  Waypoints,
  ShieldCheck,
} from 'lucide-react'
import { buildAuxillariesRoutePath, type ConcreteAuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta'

interface BtdSummary {
  totalBalance: number
  totalAllocated: number
  totalUsed: number
  totalAvailable: number
}

interface MemberAllocation {
  memberId: string
  memberName: string
  allocated: number
  used: number
  remaining: number
}

type TreasuryTransactionType =
  | 'issuance'
  | 'allocation'
  | 'usage'
  | 'settlement'
  | 'adjustment'
  | 'purchase'
  | 'refund'

interface BtdTransaction {
  id: string
  type: TreasuryTransactionType
  amount: number
  description: string
  createdAt: string
  user: {
    username: string
    displayName: string
  }
}

interface BTDTreasuryManagementProps {
  organizationId: string
  organizationName: string
  userRole: 'owner' | 'admin' | 'lead' | 'dev'
  summary: BtdSummary
  allocations: MemberAllocation[]
  transactions: BtdTransaction[]
  onRefresh: () => void
}

const transactionTypeConfig: Record<TreasuryTransactionType, {
  label: string
  color: string
  bgColor: string
  icon: typeof ArrowUpRight
}> = {
  issuance: {
    label: 'BTD Issuance',
    icon: ArrowUpRight,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  allocation: {
    label: 'Allocation',
    icon: ArrowUpRight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  usage: {
    label: 'Usage',
    icon: ArrowDownRight,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  settlement: {
    label: 'BTC Settlement',
    icon: Wallet,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  adjustment: {
    label: 'Adjustment',
    icon: RefreshCw,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  // Fixture mappings for transaction data captured before the current settlement taxonomy.
  purchase: {
    label: 'BTC Settlement',
    icon: Wallet,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  refund: {
    label: 'Adjustment',
    icon: RefreshCw,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
}

function openAuxillaryRoute(step: Extract<ConcreteAuxillaryPane, 'wallet' | 'externals'>) {
  if (typeof window !== 'undefined') {
    window.location.assign(buildAuxillariesRoutePath(step))
  }
}

export default function BTDTreasuryManagement({
  organizationName,
  userRole,
  summary,
  allocations,
  transactions,
  onRefresh,
}: BTDTreasuryManagementProps) {
  const canManageTreasury = ['owner', 'admin'].includes(userRole)
  const usagePercentage = summary.totalBalance > 0
    ? (summary.totalUsed / summary.totalBalance) * 100
    : 0
  const allocationPercentage = summary.totalBalance > 0
    ? (summary.totalAllocated / summary.totalBalance) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">$BTD Treasury</h2>
          <p className="text-slate-600">
            Review wallet-settled BTC inflow, issued $BTD, and allocation posture for {organizationName}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => openAuxillaryRoute('externals')}>
            <Github className="mr-2 h-4 w-4" />
            Open Externals
          </Button>
          <Button onClick={() => openAuxillaryRoute('wallet')}>
            <Wallet className="mr-2 h-4 w-4" />
            Open Wallet Auxillary
          </Button>
        </div>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="h-5 w-5" />
            Canonical Bitcode treasury boundary
          </CardTitle>
          <CardDescription className="text-emerald-900/80">
            Bitcode does not use prepaid spend bundles or Stripe checkout. Connected wallets settle in BTC and issued $BTD is then tracked,
            allocated, and audited through the auxillaries and protocol-facing execution surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 tablet:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wallet className="h-4 w-4 text-emerald-700" />
              Wallet required
            </div>
            <p className="text-sm text-slate-600">
              Treasury settlement starts from a connected wallet and observable BTC posture.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Github className="h-4 w-4 text-emerald-700" />
              GitHub required before transacting
            </div>
            <p className="text-sm text-slate-600">
              Read delivery and asset-pack execution require a connected repository surface before heavier activity runs.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Waypoints className="h-4 w-4 text-emerald-700" />
              SSO and entry policy live in Externals
            </div>
            <p className="text-sm text-slate-600">
              SSO posture, repository access, and future non-wallet provider policy are configured through the Externals auxillary.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Total $BTD Balance</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Allocated</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalAllocated.toLocaleString()}</p>
            <div className="mt-1 flex items-center">
              <Progress value={allocationPercentage} className="mr-2 h-2 w-16" />
              <span className="text-xs text-slate-500">{allocationPercentage.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Used</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalUsed.toLocaleString()}</p>
            <div className="mt-1 flex items-center">
              <Progress value={usagePercentage} className="mr-2 h-2 w-16" />
              <span className="text-xs text-slate-500">{usagePercentage.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Available</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.totalAvailable.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="allocations">Member Allocations</TabsTrigger>
          <TabsTrigger value="history">Treasury History</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Team $BTD Allocations</h3>
            {canManageTreasury ? (
              <Badge variant="secondary" className="px-3 py-1">
                Review or adjust allocations from the Wallet auxillary.
              </Badge>
            ) : null}
          </div>

          {allocations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No member allocations yet</h3>
                <p className="max-w-xl text-center text-slate-600">
                  Once the organization has wallet-connected BTC settlement and issued $BTD, member-level allocations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allocations.map((allocation) => {
                const memberUsagePercentage = allocation.allocated > 0
                  ? (allocation.used / allocation.allocated) * 100
                  : 0

                return (
                  <Card key={allocation.memberId} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-1 items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {allocation.memberName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{allocation.memberName}</h4>
                            <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                              <div>
                                {allocation.used.toLocaleString()} / {allocation.allocated.toLocaleString()} $BTD
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={memberUsagePercentage} className="h-2 w-24" />
                                <span className="text-xs text-slate-500">{memberUsagePercentage.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">{allocation.remaining.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">$BTD remaining</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Treasury History</h3>
            <Badge variant="outline">BTC settlement and $BTD issuance timeline</Badge>
          </div>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No treasury events yet</h3>
                <p className="max-w-xl text-center text-slate-600">
                  Treasury events will appear here once BTC settlement, issuance, or allocation activity has been observed by the protocol.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((transaction) => {
                    const config = transactionTypeConfig[transaction.type]
                    const Icon = config.icon
                    const isPositive = transaction.amount > 0

                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${config.bgColor}`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>{config.label}</span>
                              <span>•</span>
                              <span>by {transaction.user.displayName || transaction.user.username}</span>
                              <span>•</span>
                              <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-amber-700'}`}>
                            {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">$BTD</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
