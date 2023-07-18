export class Vec {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	copy(): Vec {
		return new Vec(this.x, this.y)
	}

	add(v: Vec): Vec {
		return new Vec(this.x + v.x, this.y + v.y);
	}

	subtract(v: Vec): Vec {
		return new Vec(this.x - v.x, this.y - v.y);
	}

	scale(a: number): Vec {
		return new Vec(this.x * a, this.y * a);
	}

	div(a: number): Vec {
		return new Vec(this.x / a, this.y / a);
	}
}

export function worldToCamera(pos: Vec, cameraPos: Vec, zoom: number): Vec {
	return pos.subtract(cameraPos).scale(zoom)
}

export function cameraToWorld(pos: Vec, cameraPos: Vec, zoom: number): Vec {
	return pos.div(zoom).add(cameraPos)
}

export function offsetToCamera(pos: Vec, main: Element): Vec {
	const rect: DOMRect = main.getBoundingClientRect()
	return pos.subtract(new Vec(rect.width * 0.5, rect.height * 0.5));
}

export function cameraToOffset(pos: Vec, main: Element): Vec {
	const rect: DOMRect = main.getBoundingClientRect()
	return pos.add(new Vec(rect.width * 0.5, rect.height * 0.5))
}