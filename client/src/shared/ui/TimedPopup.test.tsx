import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimedPopup } from './TimedPopup';

describe('TimedPopup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes after exactly the given duration', () => {
    const onClose = vi.fn();
    render(<TimedPopup variant="success" title="Done" message="Saved" durationMs={3000} onClose={onClose} />);

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    act(() => vi.advanceTimersByTime(2999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not restart the timer when re-rendered with a new onClose', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <TimedPopup variant="error" title="Failed" message="Bad file" durationMs={3000} onClose={first} />,
    );

    act(() => vi.advanceTimersByTime(2000));
    rerender(<TimedPopup variant="error" title="Failed" message="Bad file" durationMs={3000} onClose={second} />);
    act(() => vi.advanceTimersByTime(1000));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
