// a utility for creating CSS transforms, which we use for virtually all of
// our animations. there are individual methods for building various types
// (translate3d, rotate, etc.) which return strings that can be assigned to
// an element's style attribute.
//
// note that it's not "feature complete" ... i shaved this down to only
// include transforms we're actually using in the game.
//
let translate3d = (x=0, y=0, z=0) => `translate3d(${x}vw, ${y}vw, ${z}vw)`;
let rotateX = (deg=0) => `rotateX(${deg}deg)`;
let rotateY = (deg=0) => `rotateY(${deg}deg)`;
let rotateZ = (deg=0) => `rotateZ(${deg}deg)`;
let perspective = (focalPoint) => `perspective(${focalPoint}vw)`;
let scale3d = (x=1, y=1, z=1) => `scale3d(${x}, ${y}, ${z})`;

export {
    translate3d,
    rotateX,
    rotateY,
    rotateZ,
    perspective,
    scale3d,
};
