import { inferNotificationActivityTitle } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';

export type NotificationTone = 'emerald' | 'sky' | 'amber' | 'rose' | 'slate';

export interface NotificationPresentation {
  label: string;
  title: string;
  tone: NotificationTone;
}

const DEFAULT_PRESENTATION: NotificationPresentation = {
  label: 'Bitcode',
  title: 'Bitcode update',
  tone: 'slate',
};

function normalizeType(type: string | null | undefined) {
  return String(type || '').trim().toLowerCase();
}

export function getNotificationPresentation(
  type: string | null | undefined,
  title?: string | null,
): NotificationPresentation {
  const normalizedType = normalizeType(type);

  let base = DEFAULT_PRESENTATION;

  if (normalizedType.includes('proof') || normalizedType.includes('verification')) {
    base = {
      label: 'Proof',
      title: 'Proof update',
      tone: 'emerald',
    };
  } else if (
    normalizedType.includes('repo') ||
    normalizedType.includes('github') ||
    normalizedType.includes('repository')
  ) {
    base = {
      label: 'Repository',
      title: 'Repository event',
      tone: 'sky',
    };
  } else if (normalizedType.includes('review')) {
    base = {
      label: 'Review',
      title: 'Review prompt',
      tone: 'amber',
    };
  } else if (normalizedType.includes('closure') || normalizedType.includes('settlement')) {
    base = {
      label: 'Closure',
      title: 'Closure update',
      tone: 'amber',
    };
  } else if (normalizedType.includes('error') || normalizedType.includes('fail')) {
    base = {
      label: 'Attention',
      title: 'Attention required',
      tone: 'rose',
    };
  }

  return {
    ...base,
    title: inferNotificationActivityTitle(type, title) || base.title,
  };
}

export function formatNotificationTimestamp(value: string | null | undefined) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
