import {vec3, mat4} from 'gl-matrix';

class Turtle {
    position: vec3;
    orientation: vec3;  // not sure what this means... like degree?
    depth: number;

    constructor(position: vec3, orientation: vec3, depth: number) {
        this.position = position;
        this.orientation = orientation;
        this.depth = depth;
    }

    draw() {
        // return relevant info for getting a DrawingRule
    }

    moveForward() {
        // change position
    }

    shiftDirection(dir: vec3) {
        // TODO: How to change direction relative to a vec3...? transform??
        // this.orientation * dir;
    }

    copyOf(): Turtle {
        return new Turtle(this.position, this.orientation, this.depth + 1);
    }
}

export default Turtle