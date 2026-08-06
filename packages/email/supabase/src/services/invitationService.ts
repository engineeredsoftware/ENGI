import { createClient } from '@supabase/supabase-js'
import type { 
  InvitationEmailData, 
  WelcomeEmailData, 
  BtdAllocationEmailData, 
  EmailResponse,
  EmailServiceConfig 
} from '../types'

export class InvitationEmailService {
  private supabase: any
  private config: EmailServiceConfig

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = {
      supabaseUrl: config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseServiceKey: config?.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      appUrl: config?.appUrl || process.env.NEXT_PUBLIC_APP_URL!
    }

    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
  }

  /**
   * Send a team invitation email with secure token
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<EmailResponse> {
    try {
      const inviteUrl = `${this.config.appUrl}/invite/${data.token}`
      
      // Use Supabase Edge Functions for email sending
      const { data: result, error } = await this.supabase.functions.invoke('send-invitation-email', {
        body: {
          to: data.email,
          subject: `You're invited to join ${data.organizationName} on Bitcode`,
          templateData: {
            organizationName: data.organizationName,
            organizationLogo: data.organizationLogo,
            inviterName: data.inviterName,
            inviterAvatar: data.inviterAvatar,
            role: this.formatRole(data.role),
            inviteUrl,
            expiresAt: this.formatExpirationDate(data.expiresAt),
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending invitation email:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send invitation email:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send a welcome email to newly joined team members
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-welcome-email', {
        body: {
          to: data.email,
          subject: `Welcome to ${data.organizationName}!`,
          templateData: {
            memberName: data.memberName,
            organizationName: data.organizationName,
            organizationLogo: data.organizationLogo,
            dashboardUrl: data.dashboardUrl,
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending welcome email:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send welcome email:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send BTD allocation notification email
   */
  async sendBtdAllocationEmail(data: BtdAllocationEmailData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-btd-allocation-email', {
        body: {
          to: data.email,
          subject: `BTD allocation update - ${data.organizationName}`,
          templateData: {
            memberName: data.memberName,
            organizationName: data.organizationName,
            btdAmount: data.btdAmount.toLocaleString(),
            reason: data.reason,
            dashboardUrl: data.dashboardUrl,
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending BTD allocation email:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send BTD allocation email:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send invitation reminder email
   */
  async sendInvitationReminder(data: InvitationEmailData): Promise<EmailResponse> {
    try {
      const inviteUrl = `${this.config.appUrl}/invite/${data.token}`
      
      const { data: result, error } = await this.supabase.functions.invoke('send-invitation-reminder', {
        body: {
          to: data.email,
          subject: `Reminder: Join ${data.organizationName} on Bitcode`,
          templateData: {
            organizationName: data.organizationName,
            organizationLogo: data.organizationLogo,
            inviterName: data.inviterName,
            role: this.formatRole(data.role),
            inviteUrl,
            expiresAt: this.formatExpirationDate(data.expiresAt),
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending invitation reminder:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send invitation reminder:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Format role for display in emails
   */
  private formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'lead': 'Team Lead',
      'dev': 'Developer',
      'owner': 'Owner'
    }
    return roleMap[role] || role
  }

  /**
   * Format expiration date for display in emails
   */
  private formatExpirationDate(expiresAt: string): string {
    return new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Export singleton instance
export const invitationEmailService = new InvitationEmailService()
