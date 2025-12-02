import { getCurrentUser } from '@/actions/auth';
import { getMessages, findUserById } from '@/lib/db';
import ChatWindow from '@/components/ChatWindow';
import { redirect, notFound } from 'next/navigation';

export default async function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    const { userId: otherUserId } = await params;
    const otherUser = await findUserById(otherUserId);

    if (!otherUser) {
        notFound();
    }

    const messages = await getMessages(user.id, otherUser.id);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <ChatWindow
                currentUser={user}
                otherUser={otherUser}
                messages={messages}
            />
        </div>
    );
}
