import { createClient } from '@supabase/supabase-js'
import type { 
  TeamNotificationEmailData, 
  EmailResponse,
  EmailServiceConfig 
} from '../types'

export class TeamEmailService {
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
   * Send role change notification email
   */
  async sendRoleChangeNotification(
    email: string,
    memberName: string,
    organizationName: string,
    oldRole: string,
    newRole: string,
    changedBy: string
  ): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-role-change-email', {
        body: {
          to: email,
          subject: `Your role has been updated in ${organizationName}`,
          templateData: {
            memberName,
            organizationName,
            oldRole: this.formatRole(oldRole),
            newRole: this.formatRole(newRole),
            changedBy,
            dashboardUrl: `${this.config.appUrl}/dashboard`,
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending role change notification:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send role change notification:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send team member removal notification
   */
  async sendMemberRemovalNotification(
    email: string,
    memberName: string,
    organizationName: string,
    removedBy: string,
    reason?: string
  ): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-member-removal-email', {
        body: {
          to: email,
          subject: `Access removed from ${organizationName}`,
          templateData: {
            memberName,
            organizationName,
            removedBy,
            reason,
            supportUrl: `${this.config.appUrl}/support`,
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending member removal notification:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send member removal notification:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send organization update notification
   */
  async sendOrganizationUpdateNotification(
    emails: string[],
    organizationName: string,
    updateType: string,
    updateDetails: string,
    updatedBy: string
  ): Promise<EmailResponse[]> {
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const { data: result, error } = await this.supabase.functions.invoke('send-organization-update-email', {
            body: {
              to: email,
              subject: `${organizationName} organization update`,
              templateData: {
                organizationName,
                updateType,
                updateDetails,
                updatedBy,
                dashboardUrl: `${this.config.appUrl}/dashboard`,
                appUrl: this.config.appUrl
              }
            }
          })

          if (error) {
            console.error('Error sending organization update notification:', error)
            return { success: false, error: error.message }
          }

          return { 
            success: true, 
            messageId: result?.messageId 
          }
        } catch (error: any) {
          console.error('Failed to send organization update notification:', error)
          return { 
            success: false, 
            error: error.message || 'Unknown error occurred' 
          }
        }
      })
    )

    return results
  }

  /**
   * Send generic team notification
   */
  async sendTeamNotification(data: TeamNotificationEmailData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-team-notification-email', {
        body: {
          to: data.email,
          subject: data.subject,
          templateData: {
            organizationName: data.organizationName,
            message: data.message,
            actionUrl: data.actionUrl,
            actionText: data.actionText,
            appUrl: this.config.appUrl
          }
        }
      })

      if (error) {
        console.error('Error sending team notification:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        messageId: result?.messageId 
      }
    } catch (error: any) {
      console.error('Failed to send team notification:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  }

  /**
   * Send bulk emails to multiple recipients
   */
  async sendBulkNotification(
    emails: string[],
    organizationName: string,
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<EmailResponse[]> {
    const results = await Promise.all(
      emails.map(async (email) => {
        return this.sendTeamNotification({
          email,
          organizationName,
          subject,
          message,
          actionUrl,
          actionText
        })
      })
    )

    return results
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
}

// Export singleton instance
export const teamEmailService = new TeamEmailService()