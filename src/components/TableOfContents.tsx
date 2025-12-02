'use client';

import { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ content }: { content: string }) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Simple regex to extract headings from markdown
        const regex = /^(#{1,3})\s+(.*)$/gm;
        const items: TOCItem[] = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            // Ensure unique ID by appending a counter if necessary
            let baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!baseId) baseId = 'heading'; // Fallback for empty or non-latin headings

            let id = baseId;
            let counter = 1;
            while (items.some(item => item.id === id)) {
                id = `${baseId}-${counter}`;
                counter++;
            }

            items.push({ id, text, level });
        }

        setHeadings(items);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0px 0px -80% 0px' }
        );

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [content]);

    if (headings.length === 0) return null;

    return (
        <nav className={styles.toc}>
            <h3 className={styles.title}>目录</h3>
            <ul className={styles.list}>
                {headings.map((item) => (
                    <li key={item.id} style={{ marginLeft: `${(item.level - 1) * 10}px` }}>
                        <a
                            href={`#${item.id}`}
                            className={`${styles.link} ${activeId === item.id ? styles.active : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                setActiveId(item.id);
                            }}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
