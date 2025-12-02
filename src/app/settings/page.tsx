import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/SettingsForm';

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">账户设置</span>
            </h1>

            <SettingsForm user={user} />
        </div>
    );
}
