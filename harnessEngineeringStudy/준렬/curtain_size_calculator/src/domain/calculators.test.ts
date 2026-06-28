import { describe, expect, it } from 'vitest';
import {
  calculateBlindTotal,
  calculateBlindWindow,
  calculateCurtain,
  getBlindAllowance,
} from './calculators';

describe('calculateCurtain', () => {
  it('calculates plain pleat curtain counts from the documented example', () => {
    expect(
      calculateCurtain({
        width: 300,
        butterflyPleat: false,
      }),
    ).toMatchObject({
      outerFullness: 1.5,
      outerCount: 4,
      innerMa: 7,
    });
  });

  it('calculates butterfly pleat curtain counts from the documented example', () => {
    expect(
      calculateCurtain({
        width: 300,
        butterflyPleat: true,
      }),
    ).toMatchObject({
      outerFullness: 2,
      outerCount: 5,
      innerMa: 7,
    });
  });
});

describe('getBlindAllowance', () => {
  it('applies 10cm total allowance for a single window when enabled', () => {
    expect(getBlindAllowance({ hasOuterAllowance: true }, 0, 1)).toBe(10);
  });

  it('applies 5cm to the first and last window only in multi-window mode', () => {
    expect(getBlindAllowance({ hasOuterAllowance: true }, 0, 3)).toBe(5);
    expect(getBlindAllowance({ hasOuterAllowance: false }, 1, 3)).toBe(0);
    expect(getBlindAllowance({ hasOuterAllowance: true }, 2, 3)).toBe(5);
  });
});

describe('calculateBlindWindow', () => {
  it('rounds to 0.5 area units and enforces the 2.0 minimum', () => {
    expect(
      calculateBlindWindow({
        widthCm: 50,
        heightCm: 100,
        quantity: 1,
        sideAllowanceCm: 0,
      }),
    ).toMatchObject({
      roundedArea: 1,
      finalArea: 2,
      totalArea: 2,
    });
  });
});

describe('calculateBlindTotal', () => {
  it('matches the documented three-window example total', () => {
    const result = calculateBlindTotal([
      { id: 1, width: 100, height: 230, quantity: 1, hasOuterAllowance: true },
      { id: 2, width: 100, height: 230, quantity: 1, hasOuterAllowance: false },
      { id: 3, width: 100, height: 230, quantity: 1, hasOuterAllowance: true },
    ]);

    expect(result.totalArea).toBe(8.5);
    expect(result.windows.map(window => window.finalArea)).toEqual([3, 2.5, 3]);
  });
});
