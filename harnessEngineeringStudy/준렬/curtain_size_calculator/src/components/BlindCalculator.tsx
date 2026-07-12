import { Checkbox } from '@toss/tds-mobile';
import type { BlindResult, BlindWindow } from '../domain/calculators';
import { blindHeightAllowance, blindSideAllowance, canHaveOuterAllowance, getBlindAllowance } from '../domain/calculators';
import { formatBlindAllowance, formatBlindHeightFormula, formatNumber, getBlindGridTemplate } from '../domain/format';
import { NumberField } from './NumberField';

type BlindCalculatorProps = {
  windows: BlindWindow[];
  result: BlindResult;
  onWindowCountChange: (value: number) => void;
  onWindowChange: (id: number, patch: Partial<BlindWindow>) => void;
};

export function BlindCalculator({ windows, result, onWindowCountChange, onWindowChange }: BlindCalculatorProps) {
  return (
    <>
      <section className="panelSurface" aria-label="블라인드 입력">
        <div className="panelHeader">
          <div>
            <h2>블라인드 실측</h2>
            <p>창 구간 수와 각 구간 실측값을 입력하세요.</p>
          </div>
        </div>

        <div className="fieldStack">
          <NumberField label="창 구간 수" value={windows.length} suffix="개" min={1} step={1} onChange={onWindowCountChange} />
        </div>

        <BlindOverviewDiagram windows={windows} />

        <div className="blindWindowList">
          {windows.map((window, index) => {
            const allowance = getBlindAllowance(window, index, windows.length);

            return (
              <article className="blindWindowRow" key={window.id}>
                <div className="blindWindowIntro">
                  <BlindWindowDiagram windows={windows} index={index} allowance={allowance} height={window.height} />
                  <strong>창 구간 {index + 1}</strong>
                  <span>{formatBlindAllowance(window.hasOuterAllowance, allowance, windows.length, canHaveOuterAllowance(index, windows.length))}</span>
                </div>

                <NumberField label="가로" value={window.width} suffix="cm" min={1} onChange={value => onWindowChange(window.id, { width: value })} />
                <NumberField label="세로" value={window.height} suffix="cm" min={1} onChange={value => onWindowChange(window.id, { height: value })} />
                <NumberField
                  label="설치 개수"
                  value={window.quantity}
                  suffix="개"
                  min={1}
                  step={1}
                  onChange={value => onWindowChange(window.id, { quantity: Math.floor(value) })}
                />

                {canHaveOuterAllowance(index, windows.length) && (
                  <label className="checkboxRow">
                    <Checkbox.Line
                      checked={window.hasOuterAllowance}
                      aria-label="양끝 바깥쪽에 5cm 여유가 있나요?"
                      onCheckedChange={checked => onWindowChange(window.id, { hasOuterAllowance: checked })}
                    />
                    <span>양끝 바깥쪽에 5cm 여유가 있나요?</span>
                  </label>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="blindResultLayout" aria-label="블라인드 계산 결과">
        <article className="resultCard">
          <p className="resultLabel">블라인드</p>
          <strong>{formatNumber(result.totalArea)}헤베</strong>
          <span>전체 창 헤베 합산</span>
          <small>구간별 헤베를 모두 더한 값</small>
        </article>

        <div className="blindBreakdown">
          {result.windows.map((window, index) => (
            <article className="blindBreakdownItem" key={window.id}>
              <strong>창 구간 {index + 1}</strong>
              <span>{formatNumber(window.finalArea)}헤베 × {formatNumber(window.quantity, 0)}개</span>
              <small>세로 {formatBlindHeightFormula(window.height)} · 기본 {formatNumber(window.rawArea)}㎡ → {formatNumber(window.roundedArea)}㎡</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function BlindOverviewDiagram({ windows }: { windows: BlindWindow[] }) {
  const widths = windows.map(window => window.width);

  return (
    <div className="blindOverview" aria-hidden="true">
      <div className="blindOverviewHeader">
        <strong>블라인드 창 구간</strong>
        <span>{windows.length}개 구간</span>
      </div>
      <div className="blindOverviewWall" style={{ gridTemplateColumns: getBlindGridTemplate(widths, 52) }}>
        <div className="blindHeightMarker">
          <span>세로</span>
        </div>
        {windows.map((window, index) => (
          <div className="blindOverviewPane" key={window.id}>
            {canHaveOuterAllowance(index, windows.length) && window.hasOuterAllowance && windows.length === 1 ? (
              <>
                <span className="blindAllowanceMark isLeft">+{blindSideAllowance}cm</span>
                <span className="blindAllowanceMark isRight">+{blindSideAllowance}cm</span>
              </>
            ) : (
              canHaveOuterAllowance(index, windows.length) &&
              window.hasOuterAllowance && <span className="blindAllowanceMark isRight">+{blindSideAllowance}cm</span>
            )}
            <strong>{index + 1}</strong>
          </div>
        ))}
      </div>
      <div className="blindHeightNote">각 창 구간의 세로는 입력값에 {blindHeightAllowance}cm를 더해서 계산합니다.</div>
    </div>
  );
}

function BlindWindowDiagram({
  windows,
  index,
  allowance,
  height,
}: {
  windows: BlindWindow[];
  index: number;
  allowance: number;
  height: number;
}) {
  const widths = windows.map(window => window.width);
  const allowanceLabel = windows.length === 1 && allowance > 0 ? `좌우 +${blindSideAllowance}cm씩` : `+${allowance}cm 적용`;

  return (
    <div className="blindMiniDiagram" aria-hidden="true">
      <div className="blindMiniHeader">창 구간 {index + 1}</div>
      <div className="blindMiniWall" style={{ gridTemplateColumns: getBlindGridTemplate(widths, 22) }}>
        {windows.map((_, paneIndex) => (
          <span className={paneIndex === index ? 'isActive' : ''} key={paneIndex}>
            {paneIndex === index ? index + 1 : ''}
          </span>
        ))}
      </div>
      <div className="blindMiniBadges">
        <div className={`blindMiniAllowance ${allowance > 0 ? 'isChecked' : ''}`}>{allowance > 0 ? allowanceLabel : '실측 그대로'}</div>
        <div className="blindMiniHeight">세로 {formatBlindHeightFormula(height)}</div>
      </div>
    </div>
  );
}
