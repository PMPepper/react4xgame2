import React from 'react';

export default function isRenderable(element: any): boolean {
  return typeof(element) === 'string' || React.isValidElement(element);
}
