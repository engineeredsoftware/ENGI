# @bitcode/email

Professional email service package for Bitcode team management and notifications.

## Features

- **Team Invitations**: Secure invitation emails with branded templates
- **Welcome Messages**: Onboarding emails for new team members
- **BTD Notifications**: BTD allocation and usage notifications
- **Role Changes**: Role update notifications with audit trail
- **Organization Updates**: Bulk notifications for organizational changes
- **Flexible Templates**: Customizable email templates with organization branding

## Installation

```bash
npm install @bitcode/email
```

## Usage

### Invitation Emails

```typescript
import { invitationEmailService } from '@bitcode/email'

await invitationEmailService.sendInvitationEmail({
  email: 'user@company.com',
  organizationName: 'Acme Corp',
  organizationLogo: 'https://acme.com/logo.png',
  inviterName: 'John Doe',
  role: 'dev',
  token: 'secure-invitation-token',
  expiresAt: '2024-01-15T00:00:00Z'
})
```

### Welcome Emails

```typescript
await invitationEmailService.sendWelcomeEmail({
  email: 'user@company.com',
  memberName: 'Jane Smith',
  organizationName: 'Acme Corp',
  dashboardUrl: 'https://app.bitcode.example/dashboard'
})
```

### BTD Allocation

```typescript
await invitationEmailService.sendBtdAllocationEmail({
  email: 'user@company.com',
  memberName: 'Jane Smith',
  organizationName: 'Acme Corp',
  btdAmount: 50000,
  reason: 'Monthly allocation',
  dashboardUrl: 'https://app.bitcode.example/dashboard'
})
```

### Team Notifications

```typescript
import { teamEmailService } from '@bitcode/email'

await teamEmailService.sendRoleChangeNotification(
  'user@company.com',
  'Jane Smith',
  'Acme Corp',
  'dev',
  'lead',
  'John Doe'
)
```

### Bulk Notifications

```typescript
await teamEmailService.sendBulkNotification(
  ['user1@company.com', 'user2@company.com'],
  'Acme Corp',
  'Important Update',
  'Please review the new security policies.',
  'https://app.bitcode.example/policies',
  'Review Policies'
)
```

## Configuration

Set the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://app.bitcode.example
```

Or configure programmatically:

```typescript
import { InvitationEmailService } from '@bitcode/email'

const emailService = new InvitationEmailService({
  supabaseUrl: 'your_supabase_url',
  supabaseServiceKey: 'your_service_key',
  appUrl: 'https://app.bitcode.example'
})
```

## Email Templates

The package uses Supabase Edge Functions with the following email templates:

- `send-invitation-email` - Team invitation emails
- `send-welcome-email` - Welcome emails for new members
- `send-btd-allocation-email` - BTD allocation notifications
- `send-role-change-email` - Role change notifications
- `send-member-removal-email` - Member removal notifications
- `send-organization-update-email` - Organization update notifications
- `send-team-notification-email` - Generic team notifications

## API Reference

### InvitationEmailService

#### `sendInvitationEmail(data: InvitationEmailData): Promise<EmailResponse>`

Send a team invitation email with secure token.

#### `sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResponse>`

Send a welcome email to newly joined team members.

#### `sendBtdAllocationEmail(data: BtdAllocationEmailData): Promise<EmailResponse>`

Send BTD allocation notification email.

#### `sendInvitationReminder(data: InvitationEmailData): Promise<EmailResponse>`

Send invitation reminder email.

### TeamEmailService

#### `sendRoleChangeNotification(...): Promise<EmailResponse>`

Send role change notification email.

#### `sendMemberRemovalNotification(...): Promise<EmailResponse>`

Send team member removal notification.

#### `sendOrganizationUpdateNotification(...): Promise<EmailResponse[]>`

Send organization update notification to multiple recipients.

#### `sendTeamNotification(data: TeamNotificationEmailData): Promise<EmailResponse>`

Send generic team notification.

#### `sendBulkNotification(...): Promise<EmailResponse[]>`

Send bulk emails to multiple recipients.

## Types

```typescript
interface InvitationEmailData {
  email: string
  organizationName: string
  organizationLogo?: string
  inviterName: string
  inviterAvatar?: string
  role: string
  token: string
  expiresAt: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}
```

## Error Handling

All email methods return an `EmailResponse` object with success status and optional error details:

```typescript
const result = await invitationEmailService.sendInvitationEmail(data)

if (!result.success) {
  console.error('Email failed:', result.error)
} else {
  console.log('Email sent:', result.messageId)
}
```

## Integration with Supabase Edge Functions

This package requires Supabase Edge Functions for email delivery. Deploy the corresponding edge functions to handle email template rendering and delivery through your preferred email service (SendGrid, AWS SES, etc.).

## License

PROPRIETARY - Internal Bitcode package
