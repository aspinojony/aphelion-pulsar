import { getCurrentUser } from '@/actions/auth';
import { getUserInviteCodes, generateInviteCode } from '@/lib/db';
import { redirect } from 'next/navigation';
import InviteClient from './InviteClient';

export default async function InvitePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const inviteCodes = getUserInviteCodes(user.id);

    // Server Action to generate code
    async function generateCodeAction() {
        'use server';
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.level < 2) return;
        generateInviteCode(currentUser.id);
        redirect('/invite');
    }

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
                <span className="text-gradient">邀请好友</span>
            </h1>
            <p style={{ marginBottom: '3rem', color: '#888', fontSize: '1.2rem' }}>邀请好友加入，共同探索未来！</p>

            <div className="glass" style={{ padding: '3rem', borderRadius: '20px', maxWidth: '600px', width: '100%' }}>

                {user.level >= 2 ? (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ marginBottom: '1rem', color: '#ccc' }}>您的邀请码列表</p>
                            {inviteCodes.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {inviteCodes.map(invite => (
                                        <InviteClient key={invite.code} code={invite.code} isUsed={!!invite.isUsed} />
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#666' }}>暂无邀请码</p>
                            )}
                        </div>

                        <form action={generateCodeAction}>
                            <button
                                type="submit"
                                style={{
                                    padding: '1rem 2rem',
                                    fontSize: '1.2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: '#000',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                    margin: '0 auto'
                                }}
                            >
                                ✨ 生成新邀请码
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ padding: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '10px', border: '1px solid rgba(255,0,0,0.2)' }}>
                        <h3 style={{ color: '#f87171', marginBottom: '1rem' }}>权限不足</h3>
                        <p style={{ color: '#ccc' }}>您当前等级为 Lv {user.level}，需要达到 Lv 2 才能生成邀请码。</p>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>可以通过发布文章、评论互动来获取经验值升级。</p>
                    </div>
                )}

                <div style={{ marginTop: '3rem', textAlign: 'left', color: '#888', fontSize: '0.9rem' }}>
                    <p>邀请规则：</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>需要达到 Lv 2 才能生成邀请码。</li>
                        <li>每成功邀请一位好友，双方各获得 50 经验值。</li>
                        <li>好友需在注册时填写您的邀请码。</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
