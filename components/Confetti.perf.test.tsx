import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import Confetti from './Confetti';

describe('Confetti Performance', () => {
  it('should not regenerate particles on every render', () => {
    const { rerender, container } = render(<Confetti active={true} />);

    // Get the initial particles
    const initialParticles = Array.from(container.querySelectorAll('div > div')).map(
      el => (el as HTMLElement).style.left
    );

    // Force a re-render with the same props
    rerender(<Confetti active={true} />);

    // Get the particles after re-render
    const newParticles = Array.from(container.querySelectorAll('div > div')).map(
      el => (el as HTMLElement).style.left
    );

    // If particles are regenerated, their random 'left' positions will change
    expect(initialParticles).toEqual(newParticles);
  });
});
