declare module 'react-svg-map' {
  import React from 'react';

  interface MapLocation {
    id: string;
    name?: string;
    path: string;
  }

  interface MapData {
    viewBox: string;
    locations: MapLocation[];
    label?: string;
  }

  interface SVGMapProps {
    map: MapData;
    className?: string;
    role?: string;
    locationClassName?: string | ((location: MapLocation, index: number) => string);
    locationTabIndex?: string | ((location: MapLocation, index: number) => string);
    locationRole?: string;
    locationAriaLabel?: (location: MapLocation, index: number) => string;
    onLocationMouseOver?: (event: React.MouseEvent<SVGPathElement>) => void;
    onLocationMouseOut?: (event: React.MouseEvent<SVGPathElement>) => void;
    onLocationMouseMove?: (event: React.MouseEvent<SVGPathElement>) => void;
    onLocationClick?: (event: React.MouseEvent<SVGPathElement>) => void;
    onLocationKeyDown?: (event: React.KeyboardEvent<SVGPathElement>) => void;
    onLocationFocus?: (event: React.FocusEvent<SVGPathElement>) => void;
    onLocationBlur?: (event: React.FocusEvent<SVGPathElement>) => void;
    isLocationSelected?: (location: MapLocation, index: number) => boolean;
    childrenBefore?: React.ReactNode;
    childrenAfter?: React.ReactNode;
  }

  export const SVGMap: React.FC<SVGMapProps>;
  export const CheckboxSVGMap: React.ComponentClass<SVGMapProps & { selectedLocationIds?: string[]; onChange?: (locations: Element[]) => void }>;
  export const RadioSVGMap: React.ComponentClass<SVGMapProps & { selectedLocationId?: string; onChange?: (location: Element) => void }>;
}
