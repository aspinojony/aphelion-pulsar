import Link from 'next/link';
import styles from './SidebarLeft.module.css';

const MENU_ITEMS = [
    { label: '日常', icon: '☕', href: '/?category=daily' },
    { label: '技术', icon: '💻', href: '/?category=tech' },
    { label: '情报', icon: '📡', href: '/?category=info' },
    { label: '测评', icon: '📊', href: '/?category=review' },
    { label: '交易', icon: '💰', href: '/?category=trade' },
    { label: '拼车', icon: '🚗', href: '/?category=share' },
    { label: '推广', icon: '📢', href: '/?category=promo' },
    { label: '生活', icon: '🏠', href: '/?category=life' },
    { label: 'Dev', icon: '👨‍💻', href: '/?category=dev' },
    { label: '贴图', icon: '🖼️', href: '/?category=gallery' },
    { label: '曝光', icon: '☀️', href: '/?category=exposure' },
    { label: '内版', icon: '🔒', href: '/?category=internal' },
    { label: '沙盒', icon: '📦', href: '/?category=sandbox' },
    { label: '星系', icon: '🌌', href: '/galaxy' },
];

export default function SidebarLeft() {
    return (
        <aside className={styles.sidebar}>
            <div className={`glass ${styles.container}`}>
                <nav className={styles.nav}>
                    {MENU_ITEMS.map((item) => (
                        <Link key={item.label} href={item.href} className={styles.link}>
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
