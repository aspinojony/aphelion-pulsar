import Link from 'next/link';

export default function LinksPage() {
    const links = [
        { name: '阮一峰的网络日志', url: 'http://www.ruanyifeng.com/blog/' },
        { name: '酷 壳 – CoolShell', url: 'https://coolshell.cn/' },
        { name: '廖雪峰的官方网站', url: 'https://www.liaoxuefeng.com/' },
        { name: 'Overreacted (Dan Abramov)', url: 'https://overreacted.io/' },
        { name: 'Robin Wieruch', url: 'https://www.robinwieruch.de/' },
        { name: 'Josh Comeau', url: 'https://www.joshwcomeau.com/' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">友站链接</span>
            </h1>
            <p style={{ marginBottom: '3rem', color: '#888' }}>推荐一些优秀的博客和网站</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {links.map(link => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: '#fff',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {link.name}
                    </a>
                ))}
            </div>

            <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1rem' }}>申请友链</h3>
                <p style={{ color: '#ccc', marginBottom: '1rem' }}>如果您也拥有一个优秀的个人博客，欢迎申请交换友链。</p>
                <p style={{ color: '#888' }}>请发送邮件至: <a href="mailto:contact@example.com" style={{ color: 'var(--primary)' }}>contact@example.com</a></p>
            </div>
        </div>
    );
}
