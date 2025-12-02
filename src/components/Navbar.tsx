import Link from 'next/link';
import styles from './Navbar.module.css';
import { getCurrentUser, logout } from '@/actions/auth';

export default async function Navbar() {
    const user = await getCurrentUser();

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <span className="text-gradient">aspinojony的小站</span>
                </Link>
                <div className={styles.links}>
                    <Link href="/" className={styles.link}>首页</Link>
                    <Link href="/blog" className={styles.link}>博客</Link>
                    <Link href="/about" className={styles.link}>关于</Link>

                    {user ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link href={`/user/${user.id}`} style={{ fontSize: '0.9rem', color: '#fff', textDecoration: 'none' }}>
                                {user.username}
                            </Link>
                            <form action={logout}>
                                <button type="submit" className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    退出
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/login" className={styles.link}>登录</Link>
                            <Link href="/register" className={styles.link}>注册</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
