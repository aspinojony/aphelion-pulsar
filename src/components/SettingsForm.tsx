'use client';

import { updateProfileAction } from '@/actions/user';
import { useTransition, useState, useRef } from 'react';

export default function SettingsForm({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user.avatar);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
                setSelectedAvatar(null); // Clear preset if file selected
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const res = await updateProfileAction(null, formData);
            if (res?.message) {
                setMessage(res.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="glass" style={{ padding: '2rem', borderRadius: '12px', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                个人资料设置
            </h2>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: message.includes('成功') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: message.includes('成功') ? '#4ade80' : '#f87171',
                    border: `1px solid ${message.includes('成功') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>用户名</label>
                <input
                    type="text"
                    value={user.username}
                    disabled
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #333',
                        background: '#222',
                        color: '#888',
                        cursor: 'not-allowed'
                    }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>用户名暂不支持修改</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>邮箱</label>
                <input
                    type="text"
                    value={user.email}
                    disabled
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #333',
                        background: '#222',
                        color: '#888',
                        cursor: 'not-allowed'
                    }}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', color: '#ccc' }}>选择头像</label>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {['Felix', 'Aneka', 'Zack', 'Midnight', 'Sky', 'Lilac'].map((seed) => {
                        const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
                        const isSelected = selectedAvatar === url;
                        return (
                            <div
                                key={seed}
                                onClick={() => {
                                    setSelectedAvatar(url);
                                    setPreviewImage(null);
                                    // Clear file input
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                                    transition: 'transform 0.2s',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                <img src={url} alt={seed} style={{ width: '100%', height: '100%' }} />
                            </div>
                        );
                    })}
                </div>

                <input type="hidden" name="avatarUrl" value={selectedAvatar || ''} />

                {/* File Upload */}
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>或者上传自定义图片 (最大 2MB)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        name="avatarFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            background: '#111',
                            color: '#fff',
                            border: '1px solid #333'
                        }}
                    />
                </div>

                {/* Preview */}
                {(previewImage || selectedAvatar) && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>预览</p>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto',
                            border: '2px solid var(--secondary)'
                        }}>
                            <img
                                src={previewImage || selectedAvatar || ''}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>个人简介</label>
                <textarea
                    name="bio"
                    defaultValue={user.bio || ''}
                    placeholder="介绍一下你自己..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #333',
                        background: '#111',
                        color: '#fff',
                        resize: 'vertical'
                    }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>最多 160 个字符</p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                }}
            >
                {isPending ? '保存中...' : '保存更改'}
            </button>
        </form>
    );
}
