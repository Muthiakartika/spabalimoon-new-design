import type { ComponentType } from "react";
import LymphaticDrainageMassageBenefitsTechniquesWhatToExpectArticle from "./lymphatic-drainage-massage-benefits-techniques-what-to-expect";
import WhatIsABalineseMassageArticle from "./what-is-a-balinese-massage";
import WhatIsThaiMassageArticle from "./what-is-thai-massage";
import UnderstandingOfFacialMassageArticle from "./understanding-of-facial-massage";
import UnderstandingSlimmingMassageArticle from "./understanding-slimming-massage";
import BestMassagesAfterALongFlightArticle from "./best-massages-after-a-long-flight";
import IvDripArticle from "./iv-drip";

/** Body of each guide article, keyed by slug — generated from the live pages. */
export const guideArticles: Record<string, ComponentType> = {
  "lymphatic-drainage-massage-benefits-techniques-what-to-expect": LymphaticDrainageMassageBenefitsTechniquesWhatToExpectArticle,
  "what-is-a-balinese-massage": WhatIsABalineseMassageArticle,
  "what-is-thai-massage": WhatIsThaiMassageArticle,
  "understanding-of-facial-massage": UnderstandingOfFacialMassageArticle,
  "understanding-slimming-massage": UnderstandingSlimmingMassageArticle,
  "best-massages-after-a-long-flight": BestMassagesAfterALongFlightArticle,
  "iv-drip": IvDripArticle,
};
