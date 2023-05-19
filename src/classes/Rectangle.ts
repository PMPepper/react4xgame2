


export default class Rectangle{
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }

    //Getter/setters

    get top() {
        return this.y;
    }

    set top(newTop) {
        if(newTop !== this.y) {
            this.height = this.bottom - newTop;
            this.y = newTop;
        }
    }

    get right() {
        return this.x + this.width;
    }

    set right(newRight) {
        if(newRight !== this.right) {
            this.width = newRight - this.x;
        }
    }

    get bottom() {
        return this.y + this.height
    }

    set bottom(newBottom) {
        if(newBottom !== this.bottom) {
            this.height = newBottom - this.y;
        }
    }

    get left() {
        return this.x;
    }

    set left(newLeft) {
        if(newLeft !== this.y) {
            this.width = this.right - newLeft;
            this.x = newLeft;
        }
    }

    get area() {
        return this.width * this.height;
    }

    //Public methods
    translateBy(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    contains(rect: Rectangle) {
        return this.x <= rect.x && this.y <= rect.y && this.right >= rect.right && this.bottom >= rect.bottom;
    }

    //Static methods
    static fromEdges(top: number, left: number, bottom: number, right: number) {
        return new Rectangle(left, top, right - left, bottom - top);
    }

    static fromObj({x = 0, y = 0, width = 0, height = 0}: {x?: number, y?: number, width?: number, height?: number}) {
        return new Rectangle(x, y, width, height);
    }
}