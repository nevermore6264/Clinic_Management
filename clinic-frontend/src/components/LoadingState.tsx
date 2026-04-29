export function LoadingState({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="loading-state py-5 text-center">
      <div className="loading-state__spinner mx-auto mb-3" aria-hidden />
      <p className="text-muted mb-0">{label}</p>
    </div>
  );
}
