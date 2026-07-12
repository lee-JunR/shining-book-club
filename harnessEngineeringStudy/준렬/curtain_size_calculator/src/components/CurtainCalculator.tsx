import { Switch } from '@toss/tds-mobile';
import type { CurtainResult } from '../domain/calculators';
import { curtainInnerUnitWidth } from '../domain/calculators';
import { formatNumber } from '../domain/format';
import { NumberField } from './NumberField';
import { MeasureDiagram } from './MeasureDiagram';

type CurtainCalculatorProps = {
  width: number;
  height: number;
  butterflyPleat: boolean;
  result: CurtainResult;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onButterflyPleatChange: (value: boolean) => void;
};

export function CurtainCalculator({
  width,
  height,
  butterflyPleat,
  result,
  onWidthChange,
  onHeightChange,
  onButterflyPleatChange,
}: CurtainCalculatorProps) {
  return (
    <>
      <section className="inputBand" aria-label="커튼 사이즈 입력">
        <MeasureDiagram width={width} height={height} />

        <div className="panelSurface">
          <div className="panelHeader">
            <div>
              <h2>커튼 실측</h2>
              <p>가로와 세로 실측값을 입력하세요.</p>
            </div>
          </div>

          <div className="fieldStack">
            <NumberField label="가로" value={width} suffix="cm" min={1} onChange={onWidthChange} />
            <NumberField label="세로" value={height} suffix="cm" min={1} onChange={onHeightChange} />
          </div>
        </div>
      </section>

      <section className="resultGrid curtainResultGrid" aria-label="커튼 계산 결과">
        <article className="resultCard resultCardWithControl">
          <p className="resultLabel">커튼(겉지)</p>
          <strong>{formatNumber(result.outerCount, 0)}폭</strong>
          <span>{butterflyPleat ? '나비주름' : '민자주름'} {formatNumber(result.outerFullness)}배 적용</span>
          <small>계산값 {formatNumber(result.outerRaw)}폭</small>

          <div className="switchRow">
            <div>
              <span className="switchTitle">나비주름</span>
              <p>켜면 2.0배 기준으로 계산합니다.</p>
            </div>
            <Switch
              checked={butterflyPleat}
              aria-label="나비주름"
              onChange={(_, checked) => onButterflyPleatChange(checked)}
            />
          </div>
        </article>

        <article className="resultCard">
          <p className="resultLabel">커튼(속지)</p>
          <strong>{formatNumber(result.innerMa, 0)}마</strong>
          <span>계산값 {formatNumber(result.innerRaw)}마</span>
          <small>가로 × 2 ÷ {curtainInnerUnitWidth}cm</small>
        </article>
      </section>
    </>
  );
}
