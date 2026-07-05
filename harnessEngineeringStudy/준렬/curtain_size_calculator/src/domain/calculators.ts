export type CalculatorMode = 'curtain' | 'blind';

export type BlindWindow = {
  id: number;
  width: number;
  height: number;
  quantity: number;
  hasOuterAllowance: boolean;
};

export type CurtainInput = {
  width: number;
  butterflyPleat: boolean;
};

export type CurtainResult = {
  outerFullness: number;
  outerRaw: number;
  outerCount: number;
  innerRaw: number;
  innerMa: number;
};

export type BlindWindowCalculationInput = {
  widthCm: number;
  heightCm: number;
  quantity: number;
  sideAllowanceCm: number;
};

export type BlindWindowResult = BlindWindow & {
  allowance: number;
  appliedWidthM: number;
  appliedHeightM: number;
  rawArea: number;
  roundedArea: number;
  finalArea: number;
  totalArea: number;
};

export type BlindResult = {
  windows: BlindWindowResult[];
  totalArea: number;
};

export const curtainOuterFabricWidth = 140;
export const curtainPlainFullness = 1.5;
export const curtainButterflyFullness = 2;
export const curtainInnerUnitWidth = 90;
export const curtainInnerFullness = 2;

export const blindSideAllowance = 5;
export const blindHeightAllowance = 10;
export const blindRoundUnit = 0.5;
export const blindMinimumThreshold = 1.5;
export const blindMinimumArea = 2;

export function ceilTo(value: number, unit: number) {
  return Math.ceil((value + Number.EPSILON) / unit) * unit;
}

export function calculateCurtain({ width, butterflyPleat }: CurtainInput): CurtainResult {
  const outerFullness = butterflyPleat ? curtainButterflyFullness : curtainPlainFullness;
  const outerRaw = width > 0 ? (width * outerFullness) / curtainOuterFabricWidth : 0;
  const innerRaw = width > 0 ? (width * curtainInnerFullness) / curtainInnerUnitWidth : 0;

  return {
    outerFullness,
    outerRaw,
    outerCount: Math.ceil(outerRaw),
    innerRaw,
    innerMa: Math.ceil(innerRaw),
  };
}

export function canHaveOuterAllowance(index: number, total: number) {
  return total === 1 || index === 0 || index === total - 1;
}

export function getBlindAllowance(
  window: Pick<BlindWindow, 'hasOuterAllowance'>,
  index: number,
  total: number,
) {
  if (!canHaveOuterAllowance(index, total) || !window.hasOuterAllowance) {
    return 0;
  }

  return total === 1 ? blindSideAllowance * 2 : blindSideAllowance;
}

export function calculateBlindWindow({
  widthCm,
  heightCm,
  quantity,
  sideAllowanceCm,
}: BlindWindowCalculationInput) {
  const appliedWidthM = (widthCm + sideAllowanceCm) / 100;
  const appliedHeightM = (heightCm + blindHeightAllowance) / 100;
  const rawArea = appliedWidthM * appliedHeightM;
  const roundedArea = ceilTo(rawArea, blindRoundUnit);
  const finalArea = roundedArea <= blindMinimumThreshold ? blindMinimumArea : roundedArea;
  const totalArea = finalArea * quantity;

  return {
    appliedWidthM,
    appliedHeightM,
    rawArea,
    roundedArea,
    finalArea,
    totalArea,
  };
}

export function calculateBlindTotal(windows: BlindWindow[]): BlindResult {
  const calculatedWindows = windows.map((window, index) => {
    const allowance = getBlindAllowance(window, index, windows.length);
    const result = calculateBlindWindow({
      widthCm: window.width,
      heightCm: window.height,
      quantity: window.quantity,
      sideAllowanceCm: allowance,
    });

    return {
      ...window,
      allowance,
      ...result,
    };
  });

  return {
    windows: calculatedWindows,
    totalArea: calculatedWindows.reduce((sum, window) => sum + window.totalArea, 0),
  };
}
