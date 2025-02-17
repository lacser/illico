import React from 'react';

interface IconsProviderProps {
  fill?: number;
  grade?: number;
  weight?: number;
  iconSize?: string;
  color?: string;
  classname?: string;
  children: React.ReactNode;
}

const IconsProvider: React.FC<IconsProviderProps> = ({
  fill = 0,
  grade = 0,
  weight = 400,
  iconSize = '24px',
  color = undefined,
  classname = '',
  children,
}) => {
  const [parentElement, setElement] = React.useState<HTMLElement | null>(null);
  const ref = React.useRef<HTMLSpanElement>(null);

  // Support for sizing units (rem, em)
  React.useEffect(() => {
    if (ref.current) {
      setElement(ref.current.parentElement);
    }
  }, []);

  let parsedOpsz = 24;
  if (typeof window !== 'undefined') {
    // `document` element is not available in SSR
    if (parentElement || document?.body) {
      parsedOpsz = convertToPx({
        size: iconSize,
        parentElement: parentElement || document.body,
      });
    }
  }
  const opsz = Math.min(48, Math.max(20, parsedOpsz));

  // Validate parameters
  if (fill !== 0 && fill !== 1) {
    console.error('IconsProvider: fill must be 0 or 1');
  }

  if (grade < -25 || grade > 200) {
    console.error('IconsProvider: grade must be between -25 and 200');
  }

  if (weight < 100 || weight > 700) {
    console.error('IconsProvider: weight must be between 100 and 700');
  }

  if (!iconSize.match(/^[\d.]+(?:px|rem|em)$/u)) {
    console.error(
      'IconsProvider: iconSize must be a valid CSS size with px, rem,'
       + 'or em units'
    );
  }

  return (
    <span
      className={`material-symbols-rounded ${classname}`}
      ref={ref}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'GRAD' ${grade}, 
        'opsz' ${opsz}, 'wght' ${weight}`,
        fontSize: iconSize,
        color: color || undefined
      }}
    >
      {children}
    </span>
  );
};

export default IconsProvider;

interface ConvertToPxProps {
  size: string;
  parentElement: HTMLElement;
}
function convertToPx({ size, parentElement }: ConvertToPxProps) {
  // Extract numeric part and unit (px, rem, or em)
  const match = size.trim().match(/^([\d.]+)(px|rem|em)$/u);
  if (!match) {
    console.error(
      `Invalid or unsupported size: "${size}". Must include px, rem, or em. 
      Using default size 24px.`
    );
    return 24;
  }

  const [, numericPart, unit] = match; // e.g., "16px" => ["16px", "16", "px"]
  const value = parseFloat(numericPart);

  if (unit === 'px') {
    return value;
  }

  if (unit === 'rem') {
    const rootFontSize = parseFloat(
      window.getComputedStyle(document.documentElement).fontSize
    );
    return value * rootFontSize;
  }

  // unit === 'em'
  const parentFontSize = parseFloat(
    window.getComputedStyle(parentElement).fontSize
  );
  return value * parentFontSize;
}
