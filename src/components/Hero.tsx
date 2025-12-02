import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.glow} />
            <div className={styles.content}>
                <h1 className={styles.title}>
                    欢迎来到 <br />
                    <span className="text-gradient">aspinojony的小站</span>
                </h1>
                <p className={styles.subtitle}>
                    分享关于技术、设计与未来的思考与故事。
                </p>
                <Link href="/blog" className={styles.cta}>
                    开始阅读
                </Link>
            </div>
        </section>
    );
}
