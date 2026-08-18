import { Metadata } from 'next';
import { getContactMessages } from '@/app/actions/contact';
import MessagesInboxView from './messages-inbox-view';
import { RealtimeMessage } from '@/components/admin/messages/admin-messages-provider';

export const metadata: Metadata = {
  title: 'Real-Time Inbox - System Control Panel',
};

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const data = await getContactMessages({
    status: 'ALL',
    limit: 50,
  });

  return (
    <MessagesInboxView
      initialMessages={data.messages as RealtimeMessage[]}
      initialCounts={data.counts}
      initialTotal={data.total}
    />
  );
}
