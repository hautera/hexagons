
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//returns the unit vector turned 60 * a degrees where a is an integer 
//returns null if a < 0
const num_60rotations = (a) => {
    if (a === 0) {
      return [1,0];
    } else if (a === 1) {
      return [0.5, 0.866];
    } else if (a === 2) {
      return [-0.5, 0.866];
    } else if (a >= 3) {
      let [al,be] = num_60rotations(a - 3);
      return [-al, -be]; //beautiful 
    } 
}

const dot = (x, y, color, context) => {
    context.fillStyle = color;
    context.fillRect(x,y,1,1);
}

export {num_60rotations, sleep, dot};