import BannerMedia from "./BannerMedia";

/** Banner section wrapper (Figma 5:5326) — toggleable independently of Profile. */
export default function BannerSection({ bannerUrl }) {
  return (
    <div className="px-6 pt-6">
      <BannerMedia bannerUrl={bannerUrl} />
    </div>
  );
}
