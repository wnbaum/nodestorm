export interface Anchor {
	id: string;
	type: string;
	val: any;
}

export function set(arr: Anchor[], id: string, val: any) {
	const anchor = arr.find(x => x.id === id);
	if (anchor) anchor.val = val;
}

export function get(arr: Anchor[], id: string) {
	const anchor = arr.find(x => x.id === id);
	if (anchor) return anchor.val;
}

export function getAnchor(arr: Anchor[], id: string) {
	const anchor = arr.find(x => x.id === id);
	if (anchor) return anchor;
}