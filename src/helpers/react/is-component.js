import {Component} from 'react';

export default function isComponent(obj) {
  return (typeof(obj) === 'string') || (obj instanceof Function) || (obj instanceof Component);
}
