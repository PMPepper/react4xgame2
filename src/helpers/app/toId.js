export default function toId(val) {
  if(typeof(val) === 'object') {
    return val.id
  }

  return val;
}
