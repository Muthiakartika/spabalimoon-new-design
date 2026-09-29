import type { ComponentType } from "react";
import AntiCelluliteMassagePage from "./anti-cellulite-massage";
import BalineseMassagePage from "./balinese-massage";
import BodyScrubPage from "./body-scrub";
import CoconutOilMassagePage from "./coconut-oil-massage";
import CoupleSpaPage from "./couple-spa";
import CreambathPage from "./creambath";
import DaySpaPage from "./day-spa";
import DeepTissueMassagePage from "./deep-tissue-massage";
import EarWaxRemovalPage from "./ear-wax-removal";
import FacialPage from "./facial";
import FootMassagePage from "./foot-massage";
import FootReflexologyPage from "./foot-reflexology";
import HairBraidingPage from "./hair-braiding";
import HeadMassagePage from "./head-massage";
import HotStoneMassagePage from "./hot-stone-massage";
import LymphaticDrainageMassagePage from "./lymphatic-drainage-massage";
import ManicurePedicurePage from "./manicure-pedicure";
import NailSpaPage from "./nail-spa";
import ShiatsuMassagePage from "./shiatsu-massage";
import SportMassagePage from "./sport-massage";
import SunburnMassagePage from "./sunburn-massage";
import ThaiMassagePage from "./thai-massage";
import TraditionalMassagePage from "./traditional-massage";
import WaxingSalonPage from "./waxing-salon";

/**
 * Body of every treatment page, keyed by slug. Each file is generated from
 * the live page (tools/live-port) and composes the shared live sections.
 */
export const treatmentPages: Record<string, ComponentType> = {
  "anti-cellulite-massage": AntiCelluliteMassagePage,
  "balinese-massage": BalineseMassagePage,
  "body-scrub": BodyScrubPage,
  "coconut-oil-massage": CoconutOilMassagePage,
  "couple-spa": CoupleSpaPage,
  "creambath": CreambathPage,
  "day-spa": DaySpaPage,
  "deep-tissue-massage": DeepTissueMassagePage,
  "ear-wax-removal": EarWaxRemovalPage,
  "facial": FacialPage,
  "foot-massage": FootMassagePage,
  "foot-reflexology": FootReflexologyPage,
  "hair-braiding": HairBraidingPage,
  "head-massage": HeadMassagePage,
  "hot-stone-massage": HotStoneMassagePage,
  "lymphatic-drainage-massage": LymphaticDrainageMassagePage,
  "manicure-pedicure": ManicurePedicurePage,
  "nail-spa": NailSpaPage,
  "shiatsu-massage": ShiatsuMassagePage,
  "sport-massage": SportMassagePage,
  "sunburn-massage": SunburnMassagePage,
  "thai-massage": ThaiMassagePage,
  "traditional-massage": TraditionalMassagePage,
  "waxing-salon": WaxingSalonPage,
};
