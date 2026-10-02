import { LotusIcon } from "@/components/ui/Lotus";

const RULE = { width: "60px", height: "1px", background: "rgba(var(--theme-color1-rgb), 0.45)" };

export type PackageIntroProps = {
  subTitle?: string;
  title?: string;
  text?: string;
  note?: string;
};

/** Centred intro above the spa packages — the live "package-intro-text". */
export default function PackageIntro({
  subTitle = "Spa & Home Service",
  title = "More Than a Single Treatment",
  text = "Above you'll find our individual treatments with clear, honest pricing. Below, discover our specially curated packages — thoughtful combinations of our most-loved treatments designed to give you a complete experience and the best value, whether you visit our Day Spa or invite us into the comfort of your home.",
  note = "Pick the package that suits your mood, and let our therapists take care of the rest.",
}: PackageIntroProps) {
  const intro = { subTitle, title, text, note };
  return (
    <section className="package-intro-text" style={{ padding: "70px 0" }}>
      <div className="container">
        <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
          {intro.subTitle && (
            <h4 className="sub-title wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
              {intro.subTitle}
            </h4>
          )}
          <h2 className="title wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms" style={{ marginBottom: 0 }}>
            {intro.title}
          </h2>
          <p
            className="text wow fadeInUp"
            data-wow-delay="300ms"
            data-wow-duration="1500ms"
            style={{ maxWidth: "720px", margin: "16px auto 0" }}
          >
            {intro.text}
          </p>
          <div
            className="wow fadeInUp"
            data-wow-delay="400ms"
            data-wow-duration="1500ms"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", margin: "22px 0" }}
          >
            <span style={RULE} />
            <LotusIcon className="brand-lotus-icon-svg" width={26} height={27} clip="clip0_intro" />
            <span style={RULE} />
          </div>
          {intro.note && (
            <p className="text wow fadeInUp" data-wow-delay="500ms" data-wow-duration="1500ms" style={{ maxWidth: "640px", margin: "0 auto" }}>
              {intro.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
