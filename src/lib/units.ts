import { useSettings } from './settings';

/**
 * Unit conversion for the Metric/Imperial preference. Storage is always canonical
 * (weight kg, length cm, water litres, bottle/pump millilitres); these helpers
 * convert to/from the user's chosen display unit so every screen reads the same.
 */
const LB_PER_KG = 2.2046226218;
const IN_PER_CM = 1 / 2.54;
const FLOZ_PER_L = 33.8140227;   // US fluid ounces
const FLOZ_PER_ML = 1 / 29.5735295625;

const rnd = (n: number, dp: number) => { const f = Math.pow(10, dp); return Math.round(n * f) / f; };
const trim = (n: number, dp: number) => String(rnd(n, dp)); // 1.50 -> "1.5", 1.0 -> "1"

export type UnitsApi = {
  imperial: boolean;
  weightUnit: string;
  lengthUnit: string;
  waterUnit: string;
  bottleUnit: string;
  // canonical -> display number
  weightFromKg: (kg: number) => number;
  lengthFromCm: (cm: number) => number;
  waterFromL: (l: number) => number;
  bottleFromMl: (ml: number) => number;
  // display value -> canonical for storage
  weightToKg: (v: number) => number;
  lengthToCm: (v: number) => number;
  waterToL: (v: number) => number;
  bottleToMl: (v: number) => number;
  // maternal water is stored in millilitres
  waterFromMl: (ml: number) => number;
  waterToMl: (v: number) => number;
  // sensible display-unit step sizes, returned in canonical units
  weightStepKg: number; // one weight tap
  waterStepL: number;   // one pregnancy-water tap
  // formatted "value unit" strings
  fmtWeight: (kg: number, dp?: number) => string;
  fmtLength: (cm: number, dp?: number) => string;
  fmtWater: (l: number, dp?: number) => string;
  fmtWaterMl: (ml: number, dp?: number) => string;
  fmtBottle: (ml: number, dp?: number) => string;
  fmtBabyWeight: (g: number) => string; // fetal reference weight (grams canonical)
};

export function unitsFor(imperial: boolean): UnitsApi {
  const weightUnit = imperial ? 'lb' : 'kg';
  const lengthUnit = imperial ? 'in' : 'cm';
  const waterUnit = imperial ? 'fl oz' : 'L';
  const bottleUnit = imperial ? 'fl oz' : 'ml';

  const weightFromKg = (kg: number) => (imperial ? kg * LB_PER_KG : kg);
  const lengthFromCm = (cm: number) => (imperial ? cm * IN_PER_CM : cm);
  const waterFromL = (l: number) => (imperial ? l * FLOZ_PER_L : l);
  const bottleFromMl = (ml: number) => (imperial ? ml * FLOZ_PER_ML : ml);

  const weightToKg = (v: number) => (imperial ? v / LB_PER_KG : v);
  const lengthToCm = (v: number) => (imperial ? v / IN_PER_CM : v);
  const waterToL = (v: number) => (imperial ? v / FLOZ_PER_L : v);
  const bottleToMl = (v: number) => (imperial ? v / FLOZ_PER_ML : v);

  // maternal water stored in millilitres → display L (metric) or fl oz (imperial)
  const waterFromMl = (ml: number) => (imperial ? ml * FLOZ_PER_ML : ml / 1000);
  const waterToMl = (v: number) => (imperial ? v / FLOZ_PER_ML : v * 1000);

  const fmtBabyWeight = (g: number) => {
    if (imperial) {
      const oz = g / 28.349523125;
      return oz >= 16 ? `${trim(oz / 16, 1)} lb` : `${Math.round(oz)} oz`;
    }
    return g >= 1000 ? `${trim(g / 1000, 2)} kg` : `${Math.round(g)} g`;
  };

  return {
    imperial, weightUnit, lengthUnit, waterUnit, bottleUnit,
    weightFromKg, lengthFromCm, waterFromL, bottleFromMl,
    weightToKg, lengthToCm, waterToL, bottleToMl,
    waterFromMl, waterToMl,
    weightStepKg: imperial ? 0.2 / LB_PER_KG : 0.1,   // 0.2 lb or 0.1 kg per tap
    waterStepL: imperial ? 8 / FLOZ_PER_L : 0.25,     // 8 fl oz or 0.25 L per tap
    fmtWeight: (kg, dp = 1) => `${trim(weightFromKg(kg), dp)} ${weightUnit}`,
    fmtLength: (cm, dp = 1) => `${trim(lengthFromCm(cm), dp)} ${lengthUnit}`,
    fmtWater: (l, dp = 0) => `${trim(waterFromL(l), dp)} ${waterUnit}`,
    fmtWaterMl: (ml, dp = 0) => `${trim(waterFromMl(ml), dp)} ${waterUnit}`,
    fmtBottle: (ml, dp = 0) => `${trim(bottleFromMl(ml), dp)} ${bottleUnit}`,
    fmtBabyWeight,
  };
}

export function useUnits(): UnitsApi {
  const { prefs } = useSettings();
  return unitsFor(prefs.units === 'imperial');
}
