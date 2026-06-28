import { formatNumber } from '../domain/format';

export function MeasureDiagram({ width, height }: { width: number; height: number }) {
  return (
    <div className="visualPanel" aria-hidden="true">
      <div className="roomDiagram">
        <div className="ceilingLabel">천장</div>
        <div className="curtainBox">커튼박스</div>
        <div className="pointBadge">벽 끝부터 끝까지</div>
        <div className="leftWallLabel">벽</div>
        <div className="rightWallLabel">벽</div>
        <div className="diagramWindow">
          <span />
          <span />
          <span />
        </div>
        <div className="floorLabel">바닥</div>
        <div className="marker markerHLeft" />
        <div className="marker markerHRight" />
        <div className="marker markerVTop" />
        <div className="marker markerVBottom" />
        <div className="diagramWidth">
          <span>
            <strong>1</strong>
            {formatNumber(width, 0)}cm
          </span>
        </div>
        <div className="diagramHeight">
          <span>
            <strong>2</strong>
            {formatNumber(height, 0)}cm
          </span>
        </div>
      </div>
    </div>
  );
}
