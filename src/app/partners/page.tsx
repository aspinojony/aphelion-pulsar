import Link from 'next/link';

export default function PartnersPage() {
    const partners = [
        { name: 'Vercel', desc: '最佳的前端部署平台', url: 'https://vercel.com', color: '#000' },
        { name: 'Next.js', desc: 'React 框架', url: 'https://nextjs.org', color: '#000' },
        { name: 'React', desc: '构建用户界面的库', url: 'https://react.dev', color: '#61dafb' },
        { name: 'Tailwind CSS', desc: '实用优先的 CSS 框架', url: 'https://tailwindcss.com', color: '#38bdf8' },
        { name: 'Prisma', desc: '下一代 ORM', url: 'https://www.prisma.io', color: '#2d3748' },
        { name: 'SQLite', desc: '轻量级数据库', url: 'https://www.sqlite.org', color: '#003b57' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">合作商家 & 技术栈</span>
            </h1>
            <p style={{ marginBottom: '3rem', color: '#888' }}>感谢以下技术和平台的支持</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {partners.map(partner => (
                    <a
                        key={partner.name}
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass"
                        style={{
                            display: 'block',
                            padding: '2rem',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            transition: 'transform 0.2s',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>{partner.name}</h3>
                        <p style={{ color: '#888' }}>{partner.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
