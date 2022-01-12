


export default class Rectangle{
    constructor(x, y, width, height) {
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
    translateBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    //Static methods
    static fromEdges(top, left, bottom, right) {
        return new Rectangle(left, top, right - left, bottom - top);
    }
}