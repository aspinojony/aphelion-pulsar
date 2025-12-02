import { getCurrentUser } from '@/actions/auth';
import { getShopItems, getUserItems } from '@/lib/db';
import ShopItemCard from '@/components/ShopItemCard';
import Link from 'next/link';

export default async function ShopPage() {
    const user = await getCurrentUser();
    const shopItems = await getShopItems();
    const userItems = user ? await getUserItems(user.id) : [];
    const ownedItemIds = new Set(userItems.map(ui => ui.itemId));

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    <span className="text-gradient">积分商城</span>
                </h1>
                <p style={{ color: '#888' }}>消耗 XP 兑换稀有道具与特权</p>
                {user && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'inline-block' }}>
                        当前余额: <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.2rem' }}>{user.experience} XP</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {shopItems.map(item => (
                    <ShopItemCard key={item.id} item={item} userXp={user?.experience || 0} />
                ))}
            </div>

            <div style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    我的背包 ({userItems.length})
                </h2>
                {userItems.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {userItems.map(ui => (
                            <div key={ui.id} className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>{ui.item.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{ui.item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(ui.purchasedAt).toLocaleDateString()} 购入</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#888', textAlign: 'center' }}>暂无物品，快去选购吧！</p>
                )}
            </div>
        </div>
    );
}
