export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground animate-pulse">Loading</p>
            </div>
        </div>
    );
}
