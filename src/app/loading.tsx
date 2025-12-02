import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
