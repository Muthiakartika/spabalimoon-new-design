import FaqSection from "@/components/sections/FaqSection";
import { home } from "@/data/pages/home";

/** "Time to Unwind" / FAQ on the homepage. */
export default function Faq() {
  return (
    <div className="jsx-home homepage-faq-section">
      <FaqSection {...home.faq} />
    </div>
  );
}
