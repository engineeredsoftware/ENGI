"use client";

import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@bitcode/styling';
import '@/styles/bitcode-header-shiny-text.css';

interface BitcodeHeaderShinyTextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'as' | 'children' | 'className'> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'p';
  enable3dEffect?: boolean;
}

const BitcodeHeaderShinyText: FC<BitcodeHeaderShinyTextProps> = ({
  children,
  className,
  as = 'h1',
  enable3dEffect = false,
  style,
  ...rest
}) => {
  const textRef = useRef<HTMLElement | null>(null);
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    if (textRef.current) {
      if (typeof children === 'string') setTextContent(children);
      else setTextContent(textRef.current.textContent || '');
    }
  }, [children, textRef.current?.textContent]);

  const Component = as;
  return (
    <Component
      ref={textRef as React.Ref<any>}
      className={cn('bitcode-header-text', enable3dEffect && 'bitcode-header-text-3d', className)}
      data-text={enable3dEffect ? textContent : undefined}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default BitcodeHeaderShinyText;
 
