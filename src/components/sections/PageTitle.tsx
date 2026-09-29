import Link from "next/link";
import type { CSSProperties } from "react";

const S = "jsx-page-title";

/**
 * Title band with breadcrumb at the top of the blog and text pages — the live
 * "page-title". With a background photo, phones get its `-sm` file (both
 * preloaded with media queries, as live).
 */
export default function PageTitle({ pageName, backgroundImage }: { pageName: string; backgroundImage?: string }) {
  const large = backgroundImage || "/images/bg/page-title-bg.jpg";
  const small = backgroundImage ? backgroundImage.replace(/(\.[a-z0-9]+)$/i, "-sm$1") : null;
  const style = (
    small ? { "--pt-bg-lg": `url(${large})`, "--pt-bg-sm": `url(${small})` } : { backgroundImage: `url(${large})` }
  ) as CSSProperties;
  return (
    <>
      {small ? (
        <>
          <link rel="preload" as="image" href={small} media="(max-width: 767px)" fetchPriority="high" />
          <link rel="preload" as="image" href={large} media="(min-width: 768px)" fetchPriority="high" />
        </>
      ) : (
        <link rel="preload" as="image" href={large} fetchPriority="high" />
      )}
      <section style={style} className={`${S} page-title`}>
        <div className={`${S} auto-container`}>
          <div className={`${S} title-outer text-center`}>
            <h1 className={`${S} title`}>{pageName}</h1>
            <ul className={`${S} page-breadcrumb`}>
              <li className={S}>
                <Link href="/">Home</Link>
              </li>
              <li className={S}>{pageName}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
