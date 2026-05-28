'use client';

import * as React from 'react';
import { useMotionValue, useSpring, type SpringOptions } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/hooks/use-is-in-view';

type CountingNumberProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  thousandsSeparator?: string;
  decimalPlaces?: number;
  transition?: SpringOptions;
  delay?: number;
  initiallyStable?: boolean;
} & UseIsInViewOptions;

function applyThousands(intPart: string, sep: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function CountingNumber({
  ref,
  number,
  fromNumber = 0,
  padStart = false,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  decimalSeparator = '.',
  thousandsSeparator = '',
  transition = { stiffness: 90, damping: 50 },
  decimalPlaces = 0,
  delay = 0,
  initiallyStable = false,
  ...props
}: CountingNumberProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    { inView, inViewOnce, inViewMargin },
  );

  const numberStr = number.toString();
  const decimals =
    typeof decimalPlaces === 'number'
      ? decimalPlaces
      : numberStr.includes('.')
        ? (numberStr.split('.')[1]?.length ?? 0)
        : 0;

  const motionVal = useMotionValue(initiallyStable ? number : fromNumber);
  const springVal = useSpring(motionVal, transition);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInView) motionVal.set(number);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [isInView, number, motionVal, delay]);

  const formatNum = React.useCallback((val: number): string => {
    let raw = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
    let [intPart, fracPart] = raw.split('.');
    if (thousandsSeparator) intPart = applyThousands(intPart ?? '', thousandsSeparator);
    if (padStart) {
      const finalLen = Math.floor(Math.abs(number)).toString().length;
      intPart = (intPart ?? '').padStart(finalLen, '0');
    }
    return fracPart !== undefined
      ? `${intPart}${decimalSeparator}${fracPart}`
      : (intPart ?? '0');
  }, [decimals, decimalSeparator, thousandsSeparator, padStart, number]);

  React.useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (localRef.current) localRef.current.textContent = formatNum(latest);
    });
    return () => unsubscribe();
  }, [springVal, formatNum, localRef]);

  const finalIntLength = Math.floor(Math.abs(number)).toString().length;
  const zeroText = padStart
    ? '0'.padStart(finalIntLength, '0') + (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '')
    : '0' + (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '');

  return (
    <span ref={localRef} data-slot="counting-number" {...props}>
      {initiallyStable ? formatNum(number) : zeroText}
    </span>
  );
}

export { CountingNumber, type CountingNumberProps };
