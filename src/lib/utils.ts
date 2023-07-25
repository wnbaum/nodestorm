export class GraphConfig {
	style: Style = new Style();
	width: string = "1280px";
	height: string = "720px";
	nodeTypes: { [type: string]: ConstructorOfATypedSvelteComponent } = {};
	anchorColor = (type: string): string => {
		return this.style.accent.stringify();
	};
}

class Style {
	primary: Color = new Color(20, 20, 20);
	gridcolor: Color = this.primary.lighten(40);
	nodecolor: Color = this.primary.lighten(10);
	noderadius: string = "20px";
	accent: Color = new Color(0, 0, 255);
	textcolor: Color = new Color(255, 255, 255);
	font: string = "Arial";
}

class Color {
	r: number;
	g: number;
	b: number;
	a: number;

	constructor(r: number, g: number, b: number, a: number = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	set(r: number, g: number, b: number, a: number = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	stringify(): string {
		const rgb = `${this.r}, ${this.g}, ${this.b}`;
		if (this.a === 1) {
			return `rgb(${rgb})`
		} else {
			return `rgba(${rgb}, ${this.a})`;
		}
	}

	lighten(a: number): Color {
		return new Color(this.r + a, this.g + a, this.b + a, this.a);
	}

	invert(): Color {
		return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
	}
}

export interface Category {
	name: string;
	objects: Array<Category | string>;
}

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

	len(): number {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	angle(): number {
		return Math.atan2(this.y, this.x);
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

export interface FullConnection {
	fromNodeId: string;
	fromAnchorId: string;
	toNodeId: string;
	toAnchorId: string;
}