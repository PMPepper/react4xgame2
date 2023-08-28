import { ComponentType } from "react";

export default function isDOMComponent(obj: ComponentType) {
  return (typeof(obj) === 'string');
}
