import {num_60rotations} from './util';

class Hex {
    //creates a hex with specified neighbors 
    constructor (x, y, z, color=null) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
    }
  
    //returns the x, y coordinates of this hexagon
    getCoords() {
      return [this.x, this.y, this.z];
    }
  
    //return euclidian distance from center of an
    //x,y coordinate
    //todo make three coordinate distances 
    dist (x, y) {
      const dx = (this.x - x);
      const dy = (this.y - y);
      return dx ** 2 + dy ** 2 
    }
  
    //given the 3-coordinate hex grid and a hexagon size,
    //calculate the center of this hexagon
    center() {
      let x_center = 0, y_center = 0;
      const coords = this.getCoords();
      for (let axis = 0; axis < coords.length; axis ++) {
        let [i, j] = num_60rotations(2*axis);
        x_center += i * coords[axis];
        y_center += j * coords[axis];
      }
      return [x_center, y_center];
    }
  
    //draws this hexagon on the screen 
    draw = (size, context, x_offset = 0, y_offset = 0, color=null) => {
      if ( color === 'noColor' ) { this.color = null; }
      else if( color ) { this.color = color; }
      if ( this.color ) { context.fillStyle = this.color; }
      let [center_x , center_y] = this.center();
      context.beginPath();
      for(let i = 0; i < 7; i++){
        let [x0, y0] = num_60rotations(i+2);
        context.lineTo(size * (x0 + center_x) + x_offset, size * (y0 + center_y) + y_offset);
      }
      context.closePath();
      if( this.color === null ) {
        context.strokeStyle = 'black';
        context.fillStyle = 'white';
        context.lineWidth = 2;
        context.stroke(); 
      }
      context.fill();
      context.fillStyle = 'black';
      context.fillText(this.toString(), center_x * size + x_offset, center_y * size + y_offset, size)
    };
  
    toString() {
      return `${this.x}, ${this.y}, ${this.z}`;
    }
  
    //identifies if this hex is at the same coordinates as another hex
    eqs(other) {
      if ( other === null ) return false;
      return this.x === other.x && this.y === other.y && this.z === other.z;
    }
}
export default Hex;