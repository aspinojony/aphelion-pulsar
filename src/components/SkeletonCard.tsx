import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonHeader}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDate}></div>
            </div>
            <div className={styles.skeletonTags}>
                <div className={styles.skeletonTag}></div>
                <div className={styles.skeletonTag}></div>
            </div>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonTextShort}`}></div>
        </div>
    );
}
