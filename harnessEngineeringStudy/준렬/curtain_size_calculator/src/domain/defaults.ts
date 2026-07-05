import type { BlindWindow } from './calculators';

export const defaultCurtainWidth = 300;
export const defaultCurtainHeight = 230;

const baseBlindWindows: BlindWindow[] = [
  { id: 1, width: 100, height: 230, quantity: 1, hasOuterAllowance: true },
  { id: 2, width: 100, height: 230, quantity: 1, hasOuterAllowance: false },
  { id: 3, width: 100, height: 230, quantity: 1, hasOuterAllowance: true },
];

export function createDefaultBlindWindows() {
  return baseBlindWindows.map(window => ({ ...window }));
}

export function applyDefaultEdgeAllowance(windows: BlindWindow[]) {
  return windows.map((window, index) => ({
    ...window,
    hasOuterAllowance: index === 0 || index === windows.length - 1,
  }));
}

export function resizeBlindWindows(windows: BlindWindow[], count: number) {
  const nextCount = Math.max(1, Math.min(12, Math.floor(count)));

  if (nextCount === windows.length) {
    return windows;
  }

  if (nextCount < windows.length) {
    return applyDefaultEdgeAllowance(windows.slice(0, nextCount));
  }

  const nextWindows = [...windows];
  const lastWidth = windows.at(-1)?.width ?? 100;
  const lastHeight = windows.at(-1)?.height ?? 230;
  let nextId = Math.max(0, ...windows.map(window => window.id)) + 1;

  for (let index = windows.length; index < nextCount; index += 1) {
    nextWindows.push({
      id: nextId,
      width: lastWidth,
      height: lastHeight,
      quantity: 1,
      hasOuterAllowance: false,
    });
    nextId += 1;
  }

  return applyDefaultEdgeAllowance(nextWindows);
}
