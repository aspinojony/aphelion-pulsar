'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchFriends, fetchFriendRequests, handleFriendRequest } from '@/actions/social';
import { createMessage, getMessages } from '@/actions/chat';
import { Friend } from '@/lib/db';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    senderName?: string;
    senderAvatar?: string;
}

export default function ChatWindow({ currentUser }: { currentUser: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'contacts'>('chat');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<Friend[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Polling for data (optimized for production)
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const loadData = async () => {
            const [friendsData, requestsData, messagesData] = await Promise.all([
                fetchFriends(),
                fetchFriendRequests(),
                getMessages()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
            setMessages(messagesData);
        };

        loadData();
        const interval = setInterval(loadData, 10000); // 10 seconds for production
        return () => clearInterval(interval);
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        await createMessage(newMessage);
        setNewMessage('');
        setIsSending(false);
        // Optimistic update could be added here
        const msgs = await getMessages();
        setMessages(msgs);
    };

    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        await handleFriendRequest(requestId, action);
        // Refresh lists
        const [f, r] = await Promise.all([fetchFriends(), fetchFriendRequests()]);
        setFriends(f);
        setRequests(r);
    };

    if (!currentUser) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
            }}
        >
            {/* Main Window */}
            {isOpen && (
                <div
                    className="glass"
                    style={{
                        width: '350px',
                        height: '500px',
                        marginBottom: '15px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '15px',
                        background: 'rgba(0,0,0,0.4)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setActiveTab('chat')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === 'chat' ? '#fff' : '#888',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    textShadow: activeTab === 'chat' ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                                }}
                            >
                                公共频道
                            </button>
                            <button
                                onClick={() => setActiveTab('contacts')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === 'contacts' ? '#fff' : '#888',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    textShadow: activeTab === 'contacts' ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                                }}
                            >
                                好友列表
                                {requests.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-10px',
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        {requests.length}
                                    </span>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeTab === 'chat' ? (
                            <>
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                                            maxWidth: '80%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px', marginLeft: '5px' }}>
                                            {msg.senderName}
                                        </span>
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            background: msg.senderId === currentUser.id ? 'linear-gradient(135deg, #4f46e5, #ec4899)' : 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                            borderTopRightRadius: msg.senderId === currentUser.id ? '2px' : '12px',
                                            borderTopLeftRadius: msg.senderId === currentUser.id ? '12px' : '2px'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <>
                                {/* Friend Requests */}
                                {requests.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>新的请求</h3>
                                        {requests.map(req => (
                                            <div key={req.id} style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                                        {req.friend?.avatar ? <img src={req.friend.avatar} alt="" style={{ width: '100%' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>}
                                                    </div>
                                                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>{req.friend?.username}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => handleRequestAction(req.id, 'accept')} style={{ background: '#10b981', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}>✓</button>
                                                    <button onClick={() => handleRequestAction(req.id, 'reject')} style={{ background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Friends List */}
                                <div>
                                    <h3 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>我的好友 ({friends.length})</h3>
                                    {friends.map(f => (
                                        <div key={f.id} style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid #10b981' }}>
                                                {f.friend?.avatar ? <img src={f.friend.avatar} alt="" style={{ width: '100%' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontSize: '0.95rem' }}>{f.friend?.username}</div>
                                                <div style={{ color: '#666', fontSize: '0.75rem' }}>Lv.{f.friend?.level} • 在线</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Input Area (Only for Chat) */}
                    {activeTab === 'chat' && (
                        <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="发送消息..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '20px',
                                        padding: '8px 15px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    style={{
                                        background: 'var(--primary)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#000'
                                    }}
                                >
                                    ➤
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                    border: 'none',
                    boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                    transition: 'transform 0.2s',
                    position: 'relative'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                💬
                {requests.length > 0 && !isOpen && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '15px',
                        height: '15px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid #000'
                    }} />
                )}
            </button>
        </div>
    );
}
