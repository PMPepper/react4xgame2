export default function base64Decode(sBase64: string): string {
  	const sBinaryString = atob(sBase64);
	const aBinaryView = new Uint8Array(sBinaryString.length);

	Array.prototype.forEach.call(aBinaryView, function (el, idx, arr) { arr[idx] = sBinaryString.charCodeAt(idx); });
	return String.fromCharCode.apply(null, new Uint16Array(aBinaryView.buffer));
}
