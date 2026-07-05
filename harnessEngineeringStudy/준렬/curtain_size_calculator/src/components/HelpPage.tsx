import windowMeasureGuide from '../assets/window-measure-guide.jpg';
import {
  blindHeightAllowance,
  blindMinimumArea,
  blindMinimumThreshold,
  blindSideAllowance,
  curtainOuterFabricWidth,
} from '../domain/calculators';

export function HelpPage() {
  return (
    <section className="helpPage" aria-label="계산 방법">
      <article className="helpIntro">
        <div className="helpIntroCopy">
          <span className="helpBadge">측정 가이드</span>
          <h2>커튼과 블라인드는 같은 창이라도 계산 기준이 다릅니다.</h2>
          <p>커튼은 벽 끝부터 끝까지 잰 전체 가로 길이로 폭수와 마수를 계산합니다.</p>
          <p>블라인드는 창 구간 수를 정하고, 각 구간의 가로와 설치 개수를 입력해 헤베를 합산합니다.</p>
        </div>
        <img src={windowMeasureGuide} alt="방 창문 가로와 세로를 줄자로 재는 모습" />
      </article>

      <article className="helpBlock">
        <span className="helpBadge">커튼</span>
        <h2>겉지는 주름 방식에 따라 배수가 달라집니다.</h2>
        <p>민자주름은 1.5배, 나비주름은 2.0배로 계산합니다.</p>
        <div className="formula">겉지 폭수 = ceil(가로 × 주름배수 ÷ {curtainOuterFabricWidth}cm)</div>
        <p>속지는 2배 기준으로 90cm 단위 마수를 계산하고, 소수점은 올림 처리합니다.</p>
      </article>

      <article className="helpBlock">
        <span className="helpBadge">블라인드</span>
        <h2>양끝 구간만 여유분을 더합니다.</h2>
        <p>양끝 바깥쪽 여유를 켜면 가로에 {blindSideAllowance}cm를 더하고, 세로는 항상 {blindHeightAllowance}cm를 더합니다.</p>
        <div className="formula">개별 헤베 = ceil(가로(m) × 높이(m) × 2) ÷ 2</div>
        <p>{blindMinimumThreshold}헤베 이하 결과는 {blindMinimumArea}헤베로 보정한 뒤, 설치 개수를 곱해 합산합니다.</p>
      </article>
    </section>
  );
}
