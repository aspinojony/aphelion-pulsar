import PostForm from '@/components/PostForm';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import DebugSession from '@/components/DebugSession';

export default async function NewPostPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <DebugSession />
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>发布新文章</h1>
            <PostForm />
        </div>
    );
}
