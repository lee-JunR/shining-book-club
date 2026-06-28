import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Children, cloneElement, isValidElement, type ChangeEvent, type ReactElement, type ReactNode } from 'react';
import App from './App';

vi.mock('@toss/tds-mobile-ait', () => ({
  TDSMobileAITProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@toss/tds-mobile', () => {
  const Tab = ({
    children,
    onChange,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    onChange?: (index: number) => void;
    'aria-label'?: string;
  }) => (
    <div role="tablist" aria-label={ariaLabel}>
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ onSelect?: () => void }>, { onSelect: () => onChange?.(index) })
          : child,
      )}
    </div>
  );

  Tab.Item = ({
    children,
    selected,
    onSelect,
  }: {
    children: ReactNode;
    selected?: boolean;
    onSelect?: () => void;
  }) => (
    <button role="tab" aria-selected={selected} onClick={onSelect}>
      {children}
    </button>
  );

  return {
    Button: ({
      children,
      onClick,
      ...props
    }: {
      children: ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Tab,
    Switch: ({
      checked,
      onChange,
      ...props
    }: {
      checked?: boolean;
      onChange?: (_event: unknown, checked: boolean) => void;
      [key: string]: unknown;
    }) => (
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange?.(event, event.currentTarget.checked)}
        {...props}
      />
    ),
    Checkbox: {
      Line: ({
        checked,
        onCheckedChange,
        ...props
      }: {
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        [key: string]: unknown;
      }) => (
        <input
          type="checkbox"
          checked={checked}
          onChange={event => onCheckedChange?.(event.currentTarget.checked)}
          {...props}
        />
      ),
    },
    TextField: ({
      label,
      value,
      onChange,
      onBlur,
      suffix,
      type = 'text',
      variant: _variant,
      labelOption: _labelOption,
      ...props
    }: {
      label?: string;
      value?: string | number;
      onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
      onBlur?: () => void;
      suffix?: string;
      type?: string;
      variant?: string;
      labelOption?: string;
      [key: string]: unknown;
    }) => (
      <label>
        <span>{label}</span>
        <input type={type} value={value} onChange={onChange} onBlur={onBlur} aria-label={label} {...props} />
        {suffix ? <span>{suffix}</span> : null}
      </label>
    ),
  };
});
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

afterEach(() => {
  cleanup();
});

function renderApp() {
  return render(
    <TDSMobileAITProvider brandPrimaryColor="#2f7d6d">
      <App />
    </TDSMobileAITProvider>,
  );
}

describe('App', () => {
  it('keeps curtain inputs when switching tabs', async () => {
    const user = userEvent.setup();
    renderApp();

    const curtainSection = screen.getByLabelText('커튼 사이즈 입력');
    const curtainWidthInput = within(curtainSection).getAllByRole('spinbutton')[0];
    await user.clear(curtainWidthInput);
    await user.type(curtainWidthInput, '345');

    await user.click(screen.getByRole('tab', { name: '블라인드 계산기' }));
    await user.click(screen.getByRole('tab', { name: '커튼 계산기' }));

    expect(within(screen.getByLabelText('커튼 사이즈 입력')).getAllByRole('spinbutton')[0]).toHaveValue(345);
  });

  it('synchronizes blind window heights across all window sections', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: '블라인드 계산기' }));

    const rows = screen.getAllByRole('article');
    const [firstWindowRow, secondWindowRow] = rows;

    expect(firstWindowRow).not.toBeNull();
    expect(secondWindowRow).not.toBeNull();

    const firstHeightInput = within(firstWindowRow!).getAllByRole('spinbutton')[1];
    await user.clear(firstHeightInput);
    await user.type(firstHeightInput, '260');

    expect(within(secondWindowRow!).getAllByRole('spinbutton')[1]).toHaveValue(260);
  });

  it('restores minimum value when a numeric field is blurred empty', async () => {
    const user = userEvent.setup();
    renderApp();

    const curtainSection = screen.getByLabelText('커튼 사이즈 입력');
    const curtainWidthInput = within(curtainSection).getAllByRole('spinbutton')[0];
    await user.clear(curtainWidthInput);
    await user.tab();

    expect(within(curtainSection).getAllByRole('spinbutton')[0]).toHaveValue(1);
  });

  it('recomputes blind edge allowances when window count changes', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: '블라인드 계산기' }));

    const countInput = screen.getAllByRole('spinbutton')[0];
    await user.clear(countInput);
    await user.type(countInput, '1');

    expect(screen.getAllByLabelText('양끝 바깥쪽에 5cm 여유가 있나요?')).toHaveLength(1);
    expect(screen.getAllByText('좌우 +5cm씩').length).toBeGreaterThan(0);
  });
});
