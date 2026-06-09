import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricSummaryWidget from '../MetricSummaryWidget';

describe('MetricSummaryWidget', () => {
  it('renders label and formatted value', () => {
    render(<MetricSummaryWidget label="Total Commits" value={1500} />);
    
    expect(screen.getByText('Total Commits')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });

  it('renders positive trend badge', () => {
    render(<MetricSummaryWidget label="Commits" value={100} change={15} />);
    
    const badge = screen.getByText(/15%/).closest('.metric-trend-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('up');
  });

  it('renders negative trend badge', () => {
    render(<MetricSummaryWidget label="Issues" value={50} change={-10} />);
    
    const badge = screen.getByText(/10%/).closest('.metric-trend-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('down');
  });
});
