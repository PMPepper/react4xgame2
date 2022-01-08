import React from 'react';

export default function isRenderable(element) {
  return typeof(element) === 'string' || React.isValidElement(element);
}
