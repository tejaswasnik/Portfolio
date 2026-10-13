import BannerMedia from "./BannerMedia";

/** Banner section wrapper (Figma 5:5326) — toggleable independently of Profile. */
export default function BannerSection({ bannerUrl }) {
  return (
    <div className="relative px-6 pt-6">
      <BannerMedia bannerUrl={bannerUrl} />
      {/* Orbit dot (design.md §5/§8, docs/motion.md signature moment #1) —
          a continuous, slow ambient drift; removed entirely (not slowed)
          under prefers-reduced-motion by the global CSS override. */}
      <span
        aria-hidden="true"
        className="orbit-dot pointer-events-none absolute right-10 top-7 size-1.5 rounded-full bg-accent"
      />
    </div>
  );
}
