import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import PullRequestCard, { PullRequestData } from '@/components/shippables/PullRequestCard/PullRequestCard';
import IssueCard, { IssueData } from '@/components/shippables/IssueCard/IssueCard';
import ReviewCard, { ReviewData } from '@/components/shippables/ReviewCard/ReviewCard';
import CommentCard, { CommentData } from '@/components/shippables/CommentCard/CommentCard';

// ---------------------------------------------------------------------------
//  Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shippables/Rich Cards',
  component: PullRequestCard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0F172A' }] }, // slate-900
  },
} satisfies Meta<typeof PullRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
//  Mock data – intentionally short but shows all UI parts
// ---------------------------------------------------------------------------

const prData: PullRequestData = {
  number: 123,
  status: 'Open',
  createdAt: '2024-06-02',
  title: 'Implement Raft-based consensus protocol',
  description: `Adds leader election, log replication & automated membership changes.\n\n**Diff Summary**\n+ 155 additions\n- 35 deletions`,
  url: 'https://github.com/org/repo/pull/123',
  fileChanges: {
    edited: 5,
    created: 2,
    deleted: 1,
    fileDiffs: [
      { path: 'raft/core.rs', additions: 80, deletions: 5 },
      { path: 'raft/log.rs', additions: 40, deletions: 20 },
      { path: 'cluster/mod.rs', additions: 35, deletions: 10 },
    ],
  },
};

const issueData: IssueData = {
  number: 45,
  status: 'Open',
  createdAt: '2024-05-30',
  title: 'Performance degradation during node recovery',
  description:
    'Cluster throughput drops **35–40 %** for ~5 minutes after a node rejoins. Suspect aggressive log replay.',
  url: 'https://github.com/org/repo/issues/45',
  labels: ['Backend', 'Bug'],
};

const reviewData: ReviewData = {
  number: 1231,
  status: 'Approved',
  createdAt: '2024-06-01',
  content: 'Please implement exponential back-off in `handle_connection_error` and add tests for network partitions.',
  url: 'https://github.com/org/repo/pull/123#pullrequestreview-1231',
  referencedPr: 123,
};

const commentData: CommentData = {
  number: 789,
  createdAt: '2024-06-02',
  body: 'Consensus merged and deployed. Throughput stable during recovery now. Great work team! 🚀',
  url: 'https://github.com/org/repo/issues/45#issuecomment-789',
  referencedIssue: 45,
};

// ---------------------------------------------------------------------------
//  Story – one of each card in a row
// ---------------------------------------------------------------------------

export const AllCards: Story = {
  render: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-20 px-6">
      <div className="flex flex-col md:flex-row gap-8 items-start max-w-full overflow-x-auto">
        <PullRequestCard pr={prData} />
        <IssueCard issue={issueData} />
        <ReviewCard review={reviewData} />
        <CommentCard comment={commentData} />
      </div>
    </div>
  ),
};

// Individual card variants for finer-grained visual checks -------------------

export const PullRequestOpen: Story = {
  name: 'PullRequest – Open',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <PullRequestCard pr={{ ...prData, status: 'Open' }} />
    </div>
  ),
};

export const PullRequestMerged: Story = {
  name: 'PullRequest – Merged',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <PullRequestCard pr={{ ...prData, status: 'Merged' }} />
    </div>
  ),
};

export const IssueOpen: Story = {
  name: 'Issue – Open',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <IssueCard issue={{ ...issueData, status: 'Open' }} />
    </div>
  ),
};

export const IssueClosed: Story = {
  name: 'Issue – Closed',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <IssueCard issue={{ ...issueData, status: 'Closed' }} />
    </div>
  ),
};

export const ReviewApproved: Story = {
  name: 'PR Review – Approved',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <ReviewCard review={{ ...reviewData, status: 'Approved' }} />
    </div>
  ),
};

export const ReviewChangesRequested: Story = {
  name: 'PR Review – Changes requested',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <ReviewCard review={{ ...reviewData, status: 'Changes Requested' }} />
    </div>
  ),
};

export const Comment: Story = {
  name: 'Comment',
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-8">
      <CommentCard comment={commentData} />
    </div>
  ),
};
