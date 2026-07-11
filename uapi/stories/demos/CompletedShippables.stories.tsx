import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import IssueCard, { IssueData } from '@/components/shippables/IssueCard/IssueCard';
import PullRequestCard, { PullRequestData } from '@/components/shippables/PullRequestCard/PullRequestCard';
import ReviewCard, { ReviewData } from '@/components/shippables/ReviewCard/ReviewCard';
import CommentCard, { CommentData } from '@/components/shippables/CommentCard/CommentCard';

// ---------------------------------------------------------------------------
//  Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Demos/Completed Shippables',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0F172A' }] }, // slate-900
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
//  Mock data
// ---------------------------------------------------------------------------

const issue: IssueData = {
  number: 45,
  status: 'Closed',
  createdAt: '2024-05-30',
  title: 'Performance degradation during node recovery',
  description:
    'Cluster throughput drops **35–40 %** for ~5 minutes after a node rejoins. Suspect aggressive log replay.',
  url: 'https://github.com/org/repo/issues/45',
  labels: ['Backend', 'Bug'],
};

const pr1: PullRequestData = {
  number: 123,
  status: 'Merged',
  createdAt: '2024-06-02',
  title: 'Implement Raft-based consensus protocol',
  description: 'Adds leader election, log replication & automated membership changes.',
  url: 'https://github.com/org/repo/pull/123',
  fileChanges: {
    edited: 5,
    created: 2,
    deleted: 1,
    fileDiffs: [
      { path: 'raft/core.rs', additions: 80, deletions: 5 },
      { path: 'raft/log.rs', additions: 40, deletions: 20 },
    ],
  },
};

const pr2: PullRequestData = {
  number: 130,
  status: 'Open',
  createdAt: '2024-06-04',
  title: 'Add exponential back-off to connection retries',
  description: 'Addresses feedback from first PR review. Implements configurable back-off curve.',
  url: 'https://github.com/org/repo/pull/130',
  fileChanges: {
    edited: 2,
    created: 1,
    deleted: 0,
    fileDiffs: [{ path: 'net/retry.rs', additions: 55, deletions: 3 }],
  },
};

const review1: ReviewData = {
  number: 9001,
  status: 'Changes Requested',
  createdAt: '2024-06-03',
  content:
    'Looks solid overall but please implement exponential back-off in `handle_connection_error` and add tests for network partitions.',
  url: 'https://github.com/org/repo/pull/123#pullrequestreview-9001',
  referencedPr: 123,
};

const review2: ReviewData = {
  number: 9002,
  status: 'Approved',
  createdAt: '2024-06-05',
  content: 'Back-off implemented – LGTM ✅',
  url: 'https://github.com/org/repo/pull/130#pullrequestreview-9002',
  referencedPr: 130,
};

const comment1: CommentData = {
  number: 8001,
  createdAt: '2024-06-06',
  body: 'Consensus merged and deployed. Throughput stable during recovery now. Great work team! 🚀',
  url: 'https://github.com/org/repo/issues/45#issuecomment-8001',
  referencedIssue: 45,
};

const comment2: CommentData = {
  number: 8002,
  createdAt: '2024-06-07',
  body: 'Issue auto-closed as health metrics remain stable for 72h.',
  url: 'https://github.com/org/repo/issues/45#issuecomment-8002',
  referencedIssue: 45,
};

// ---------------------------------------------------------------------------
//  Story implementation – grid similar to page header (3 cols on lg)
// ---------------------------------------------------------------------------

export const CompletedSet: Story = {
  render: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-20 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {/* Issue */}
        <IssueCard issue={issue} />

        {/* Pull Requests */}
        <PullRequestCard pr={pr1} />
        <PullRequestCard pr={pr2} />

        {/* Reviews */}
        <ReviewCard review={review1} />
        <ReviewCard review={review2} />

        {/* Comments (stacked) */}
        <div className="flex flex-col space-y-4 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
          <CommentCard comment={comment1} />
          <CommentCard comment={comment2} />
        </div>
      </div>
    </div>
  ),
};
