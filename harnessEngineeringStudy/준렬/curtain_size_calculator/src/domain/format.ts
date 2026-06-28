import { blindHeightAllowance, blindSideAllowance } from './calculators';

export function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
  }).format(value);
}

export function formatBlindAllowance(hasAllowance: boolean, allowance: number, total: number, canHaveAllowance: boolean) {
  if (!canHaveAllowance) {
    return '가운데 구간은 여유분 없음';
  }

  if (!hasAllowance) {
    return '여유분 없음';
  }

  return total === 1 ? `좌우 +${blindSideAllowance}cm씩` : `바깥쪽 여유 +${blindSideAllowance}cm`;
}

export function formatBlindHeightFormula(height: number) {
  return `${formatNumber(height, 0)}+${blindHeightAllowance}cm(하단 ${blindHeightAllowance}cm여유)`;
}

export function getBlindGridTemplate(widths: number[], minWidthPx: number) {
  return widths.map(width => `minmax(${minWidthPx}px, ${Math.max(width, 1)}fr)`).join(' ');
}
