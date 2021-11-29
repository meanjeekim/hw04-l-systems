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
}

export default Turtle