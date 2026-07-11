import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import NavBrand from '@/components/bitcode/layout/NavBrand';

describe('NavBrand', () => {
  it('renders product-surface copy for the terminal workspace', () => {
    render(<NavBrand surface="terminal" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.getByText('terminal')).toBeTruthy();
  });

  it('renders packs copy for mounted pack activity routes', () => {
    render(<NavBrand surface="network" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.getByText('packs')).toBeTruthy();
  });

  it('renders homepage copy for the public homepage', () => {
    render(<NavBrand surface="home" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.getByText('homepage')).toBeTruthy();
  });

  it('renders docs copy for mounted docs routes', () => {
    render(<NavBrand surface="docs" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.getByText('docs')).toBeTruthy();
  });

  it('renders auxillaries copy for mounted auxiliary routes', () => {
    render(<NavBrand surface="auxillaries" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.getByText('auxillaries')).toBeTruthy();
  });

  it('renders beta posture outside the product workspace and remains clickable', () => {
    const onClick = jest.fn();

    render(<NavBrand surface={null} onClick={onClick} />);

    fireEvent.click(screen.getByLabelText('Bitcode logo'));

    expect(screen.getByText('V26')).toBeTruthy();
    expect(screen.getByText('PRC')).toBeTruthy();
    expect(onClick).toHaveBeenCalled();
  });
});
