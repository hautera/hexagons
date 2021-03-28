import './App.css';
import { useEffect, useRef } from 'react';

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

//returns unit vector of 60 * a + 30 deg rotation
const num_60rotationsOffet30 = (a) => {
  if (a === 0) { return [0.866, 0.5]; }
  if (a === 1) { return [0, 1]; }
  if (a === 2) { return [-0.866, 0.5]; }
  if (a >= 3) { 
    let [al, be] = num_60rotationsOffet30(a - 3);
    return [-al, -be];
  }
  
}

class Hex {
  //creates a hex with specified neighbors 
  constructor (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
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

  //returns true if x,y are in the hexagon
  //TODO make this work 
  contains(x,y) {
    return false;
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
  draw = (size, context, color, x_offset = 0, y_offset = 0) => {
    context.fillStyle = color;
    let [center_x , center_y] = this.center();
    context.beginPath();
    for(let i = 0; i < 7; i++){
      let [x0, y0] = num_60rotations(i);
      context.lineTo(size * (x0 + center_x) + x_offset, size * (y0 + center_y) + y_offset);
    }
    context.closePath();
    context.stroke();
    context.fillText(this.toString(), center_x * size + x_offset, center_y * size + y_offset, size)
  };

  toString() {
    return `${this.x}, ${this.y}, ${this.z}`;
  }

  //identifies if this hex is at the same coordinates as another hex
  eqs(other) {
    return other && this.x === other.x && this.y === other.y && this.x === other.z;
  }
}


class Map {
  //size represents the number of layers we will move from the center
  constructor (size) {
    this.hexes = new Set();
    for (let x = -size + 1; x < size ; x ++) {
      for (let y = -size + 1; y < size ; y ++) {
        let z = - (x + y);
        if ( Math.abs(z) + Math.abs(x) + Math.abs(y) < size * 2) { this.hexes.add(new Hex(x,y,z)); }
      }
    }
    return this;
  }

  draw(hexSize, center_x, center_y, context) {
    this.hexes.forEach( (hex) => hex.draw(hexSize, context, 'white', center_x, center_y) );
    const axis_rot = [0,2,4];
    const axis_name = ['x', 'y', 'z'];
    axis_rot.forEach( (a, index) => {
      const [x, y] = num_60rotations(a);
      context.beginPath();
      context.moveTo(center_x, center_y);
      context.lineWidth = 5; 
      context.strokeStyle = 'red';
      context.lineTo(center_x - x * 500, center_y - y * 500);
      context.fillText(axis_name[index], center_x - x * 500, center_y - y * 500);
      //context.lineTo(center_x + x * 500, center_y + y * 500);
      context.stroke();
      context.closePath();
    });
  }

  //returns a list of hexagons adjacent to the hexagon passed
  getConnections(hex) {

  }
}

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    const size = 50;
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px` ;
    canvas.style.height = `${window.innerHeight}px`;
    const context  = canvas.getContext("2d");
    context.scale(2,2);
    contextRef.current = context;
    context.fillStyle = "blue";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let x = new Map(9);
    x.draw(size, 500, 300, context);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          ref={canvasRef}
        />
      </header>
    </div>
  );
}

export default App;
