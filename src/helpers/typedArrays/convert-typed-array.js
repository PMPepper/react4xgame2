export default function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}