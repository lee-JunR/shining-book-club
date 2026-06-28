import { useMemo, useState } from 'react';
import { Button, Tab } from '@toss/tds-mobile';
import { BlindCalculator } from './components/BlindCalculator';
import { CurtainCalculator } from './components/CurtainCalculator';
import { HelpPage } from './components/HelpPage';
import {
  calculateBlindTotal,
  calculateCurtain,
  type BlindWindow,
  type CalculatorMode,
} from './domain/calculators';
import {
  createDefaultBlindWindows,
  defaultCurtainHeight,
  defaultCurtainWidth,
  resizeBlindWindows,
} from './domain/defaults';

function App() {
  const [mode, setMode] = useState<CalculatorMode>('curtain');
  const [showHelp, setShowHelp] = useState(false);
  const [curtainWidth, setCurtainWidth] = useState(defaultCurtainWidth);
  const [curtainHeight, setCurtainHeight] = useState(defaultCurtainHeight);
  const [butterflyPleat, setButterflyPleat] = useState(false);
  const [blindWindows, setBlindWindows] = useState<BlindWindow[]>(createDefaultBlindWindows);

  const curtainResult = useMemo(
    () =>
      calculateCurtain({
        width: curtainWidth,
        butterflyPleat,
      }),
    [butterflyPleat, curtainWidth],
  );

  const blindResult = useMemo(() => calculateBlindTotal(blindWindows), [blindWindows]);

  const reset = () => {
    setCurtainWidth(defaultCurtainWidth);
    setCurtainHeight(defaultCurtainHeight);
    setButterflyPleat(false);
    setBlindWindows(createDefaultBlindWindows());
    setShowHelp(false);
    setMode('curtain');
  };

  const updateBlindWindow = (id: number, patch: Partial<BlindWindow>) => {
    setBlindWindows(windows => {
      if (patch.height !== undefined) {
        return windows.map(window => ({
          ...window,
          height: patch.height ?? window.height,
          ...(window.id === id ? patch : {}),
        }));
      }

      return windows.map(window => (window.id === id ? { ...window, ...patch } : window));
    });
  };

  const updateBlindWindowCount = (count: number) => {
    setBlindWindows(windows => resizeBlindWindows(windows, count));
  };

  return (
    <main className="app">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Curtain Size</p>
            <h1>{showHelp ? '계산 방법' : mode === 'curtain' ? '커튼 사이즈 계산기' : '블라인드 사이즈 계산기'}</h1>
          </div>
          <div className="topActions">
            {showHelp ? (
              <Button variant="weak" size="small" onClick={() => setShowHelp(false)}>
                돌아가기
              </Button>
            ) : (
              <>
                <Button variant="weak" size="small" onClick={() => setShowHelp(true)}>
                  계산 방법
                </Button>
                <Button variant="weak" size="small" onClick={reset}>
                  초기화
                </Button>
              </>
            )}
          </div>
        </header>

        {showHelp ? (
          <HelpPage />
        ) : (
          <>
            <div className="tabsSurface">
              <Tab aria-label="계산기 선택" size="large" onChange={index => setMode(index === 0 ? 'curtain' : 'blind')}>
                <Tab.Item selected={mode === 'curtain'}>커튼 계산기</Tab.Item>
                <Tab.Item selected={mode === 'blind'}>블라인드 계산기</Tab.Item>
              </Tab>
            </div>

            {mode === 'curtain' ? (
              <CurtainCalculator
                width={curtainWidth}
                height={curtainHeight}
                butterflyPleat={butterflyPleat}
                result={curtainResult}
                onWidthChange={setCurtainWidth}
                onHeightChange={setCurtainHeight}
                onButterflyPleatChange={setButterflyPleat}
              />
            ) : (
              <BlindCalculator
                windows={blindWindows}
                result={blindResult}
                onWindowCountChange={updateBlindWindowCount}
                onWindowChange={updateBlindWindow}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
