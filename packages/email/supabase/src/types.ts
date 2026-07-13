export interface InvitationEmailData {
  email: string
  organizationName: string
  organizationLogo?: string
  inviterName: string
  inviterAvatar?: string
  role: string
  token: string
  expiresAt: string
}

export interface WelcomeEmailData {
  email: string
  memberName: string
  organizationName: string
  organizationLogo?: string
  dashboardUrl: string
}

export interface BtdAllocationEmailData {
  email: string
  memberName: string
  organizationName: string
  btdAmount: number
  reason?: string
  dashboardUrl: string
}

export interface TeamNotificationEmailData {
  email: string
  organizationName: string
  subject: string
  message: string
  actionUrl?: string
  actionText?: string
}

export interface EmailServiceConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  appUrl: string
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}
