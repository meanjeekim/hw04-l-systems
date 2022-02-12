import {vec4, mat4, vec3} from 'gl-matrix';

class Turtle {
    position: vec4;
    orientation: vec4;  // not sure what this means... like degree?
    depth: number;

    constructor(position: vec4, orientation: vec4, depth: number) {
        this.position = position;
        this.orientation = orientation;
        this.depth = depth;
    }

    moveForward(dist: number) {
        // change position
        // this.position = vec3.transformMat3(this.position, this.position, ); // how to format the mat3 again...
        var translate = new mat4(0);
        this.position = vec4.transformMat4(this.position, this.position, mat4.fromTranslation(translate, new vec3([0, dist, 0])));
    }

    shiftDirection(deg: number) {
        // TODO: How to change direction relative to a vec3...? transform??
        // this.orientation * dir;

        var rotate = new mat4(0);
        this.orientation = vec4.transformMat4(this.orientation, this.orientation, mat4.fromRotation(rotate, deg, new vec3(this.orientation)))
    }

    copyOf(): Turtle {
        return new Turtle(this.position, this.orientation, this.depth + 1);
    }
}

export default Turtle