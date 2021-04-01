import './App.css';
import { useEffect, useRef, useState } from 'react';

//TODO MORE CLICK TESTS :/

const colorMap = (map, context) => {
  // select a hex
  // give it a color 
  //const nodes = map.hexes;
  const colors = ['blue', 'orange', 'green', 'yellow'];
  const rootHex = map.selectHex(0,0,0);
  rColor(rootHex, colors, map, context);
}

const rColor = (hex, colors, map, context) => {
  if( hex.color === null ) {
    const [x,y,z] = hex.getCoords();
    console.log(x,y,z);
    //we assume that the hex's color is null if it isn't idk
    const neighbors = map.getNeighbors(hex);
    for (let i = 0; i < colors.length; i ++) {
      let neighborColors = neighbors.map( (h) => h.color );
      const color = colors[i];
      console.log(color, neighborColors, [x,y,z]);
      if( !neighborColors.includes(color) ){
        hex.color = color; 
        //console.log(`Selected color: ${color}`)
        hex.draw(map.getSize(), context, map.center_x, map.center_y, true);
        //const isSol = neighbors.map( (h) => rColor(h, colors, map, context) );   
        // we have selected a color 
        //now we recursively calculate the other colors 
        let firstNull = neighborColors.indexOf(null);
        while ( firstNull !== -1 ) {
          if ( !rColor(neighbors[firstNull], colors, map, context) ) break;
          neighborColors = neighbors.map( (h) => h.color );
          firstNull = neighborColors.indexOf(null);
        }
        if ( !neighborColors.includes(null) ) {
          return true;
        }
      } 
    }
    hex.color = null;
    return false;
  }
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

class Hex {
  //creates a hex with specified neighbors 
  constructor (x, y, z, color=null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
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
  draw = (size, context, x_offset = 0, y_offset = 0, fill = false, color=null) => {
    if( color ) { context.fillStyle = color; }
    else if ( this.color ) { context.fillStyle = this.color; }
    let [center_x , center_y] = this.center();
    context.beginPath();
    for(let i = 0; i < 7; i++){
      let [x0, y0] = num_60rotations(i+2);
      context.lineTo(size * (x0 + center_x) + x_offset, size * (y0 + center_y) + y_offset);
    }
    context.closePath();
    if( fill ) { context.fill() } else { context.stroke(); }
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
  constructor (size, center_x, center_y, hexSize) {
    this.size = hexSize;
    this.center_x = center_x;
    this.center_y = center_y;
    this.hexes = [];
    for (let x = -size + 1; x < size ; x ++) {
      for (let y = -size + 1; y < size ; y ++) {
        let z = - (x + y);
        if (Math.abs(z) + Math.abs(x) + Math.abs(y) < size * 2) { this.hexes.push(new Hex(x,y,z)); }
      }
    }
    return this;
  }

  incCenter(x, y) {
    this.center_x = x;
    this.center_y = y;
  }

  setSize(newSize) {
    this.size = newSize;
  }

  getSize() {
    return this.size;
  }

  draw(context, drawAxis=false) {
    const hexSize = this.size;
    this.hexes.forEach( (hex) => hex.draw(hexSize, context, this.center_x, this.center_y, true) );
    if (drawAxis) {
      const axis_rot = [0, 2, 4];
      //const axis_name = ['x', 'y', 'z'];
      axis_rot.forEach( (a, index) => {
        const [x, y] = num_60rotations(a);
        context.beginPath();
        context.moveTo(this.center_x, this.center_y);
        context.lineWidth = 5; 
        context.strokeStyle = 'red';
        //context.lineTo(this.center_x - x * 500, this.center_y - y * 500);
        context.lineTo(this.center_x + x * 500, this.center_y + y * 500);
        context.stroke();
        context.closePath();
      });
    }
  }

  findHex(x_offset, y_offset) {
    //the map seems to be drawn 28 pixels too high :/
    //console.log(x_offset, y_offset);
    //console.log(x_offset - this.center_x, y_offset - this.center_y + 28)
    
    let euc_x = (x_offset - this.center_x)/(1.5*this.size);
    let euc_y = (y_offset - this.center_y)/(1.5*this.size);

    const x = euc_x * num_60rotations(0)[0] + euc_y * num_60rotations(0)[1];
    const y = euc_x * num_60rotations(2)[0] + euc_y * num_60rotations(2)[1];
    const z = euc_x * num_60rotations(4)[0] + euc_y * num_60rotations(4)[1];
    const rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
    // coordinates must add to zero 
    if ( rx + ry + rz === 0) { return [rx, ry, rz]; }
    // if we make it this far, there is a rounding error,
    // we fix by finding nearest solution 
    let c = (rx + ry + rz >= 0) ? -1 : 1;
    let minusX = this.distance(x,y,z, rx + c, ry, rz);
    let minusY = this.distance(x,y,z, rx, ry + c, rz);
    let minusZ = this.distance(x,y,z, rx, ry, rz + c);
    const minDistance = Math.min(minusX, minusY, minusZ);
    if (minDistance === minusX) { return [rx + c, ry, rz]; }
    if (minDistance === minusY) { return [rx, ry + c, rz]; }
    if (minDistance === minusZ) { return [rx, ry, rz + c]; }
    
    return [null, null, null];
  }

  hexDistance(hex1, hex2) {
    let [x1, x2, x3] = hex1.getCoords();
    let [y1, y2, y3] = hex2.getCoords();
    //console.log(x1, x2, x3, y1, y2, y3);
    return this.distance(x1, x2, x3, y1, y2, y3);
  }

  distance(x, y, z, rx, ry, rz) {
    return Math.abs(x - rx) + Math.abs(y - ry) + Math.abs(z - rz);
  }

  selectHex(x, y, z) {
    for(let hex of this.hexes.values()) {
      const [_x, _y, _z] = hex.getCoords();
      //console.log(_x,_y,_z);
      if(x === _x && y === _y && z === _z) {
        return hex;
      }
    }
    return null;
  }

  //returns a list of hexagons adjacent to the hexagon passed
  getNeighbors(hex) {
    if ( hex === null ) return null;
    //O(N)
    let result = this.hexes.filter( otherHex => this.hexDistance(hex, otherHex) === 2 );
    return result;
  }
}

const colorDict = (x,y,z) => {
  if ( x === 0  && y === 0 && z === 0 ) {return 'white';}
  if ( x === 0 && y === -1 && z === 1 ) {return 'red';}
  if ( x === -1 && y === 0 && z === 1 ) {return 'yellow';}
  if ( x === -1 && y === 1 && z === 0 ) {return 'orange';}
  if ( x === 1 && y === -1 && z === 0 ) {return 'orange';}
  if ( x === 0 && y === 1 && z === -1 ) {return 'red';}
  if ( x === 1 && y === 0 && z === -1 ) {return 'yellow';}
  return 'black';
}


const dot = (x, y, color, context) => {
  context.fillStyle = color;
  context.fillRect(x,y,1,1);
}

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const mapRef = useRef(new Map(5, 500, 400, 50));
  const map = mapRef.current;
  const [dragging, setDragging] = useState(false);

  const clearScreen = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px` ;
    canvas.style.height = `${window.innerHeight}px`;
    const context  = canvas.getContext("2d");
    context.scale(2,2);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const resize = (inc) => {
    clearScreen();
    const map = mapRef.current;
    map.setSize(map.getSize() + inc);
    map.draw(canvasRef.current.getContext('2d'), true);
  }

  useEffect(() => {
    clearScreen();
    const canvas = canvasRef.current;
    let map = mapRef.current;
    const context = canvas.getContext('2d');
    map.draw(context, true);
    //clickTest();
    //console.log(map.getNeighbors(map.selectHex(0,0,0)));
  }, []);

  const startDragging = () => {
    setDragging(true);
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const drag = (event) => {
    if (dragging) {
      clearScreen();
      let x_offset = event.clientX;
      let y_offset = event.clientY;
      const map = mapRef.current;
      map.incCenter(x_offset, y_offset);
      map.draw(canvasRef.current.getContext('2d'), true);
    }
  }

  const findHex = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const x = e.clientX;
    const y = e.clientY;
    const map = mapRef.current;
    clearScreen();
    map.draw(ctx, true);
    const [a,b,c] = map.findHex(x,y);
    console.log([a,b,c])
    const hex = map.selectHex(a,b,c);
    hex.draw(map.size, ctx, map.center_x, map.center_y, true, 'red');
  }

  //used for debugging 
  //makes a cool montecarlo picture tho
  const clickTest = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maxX = canvas.width;
    const maxY = canvas.height;
    const map = mapRef.current;
    console.log("Starting new click test");
    for (let i = 0; i < 1000000; i ++) {
      let rand_X = Math.random() * maxX;
      let rand_Y = Math.random() * maxY;
      const [x,y,z] = map.findHex(rand_X, rand_Y);
      const color = colorDict(x,y,z);
      //console.log(color);
      dot(rand_X, rand_Y, color, ctx);
    }
  }

  const getContext = () => {
    return canvasRef.current.getContext('2d');
  }

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          ref={canvasRef}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseMoveCapture={drag}
          onClick={findHex}
        />
        <div id='control-panel'>
          <button onClick={ () => {resize(10)}}>+</button>
          <button onClick={ () => {resize(-10)}}>-</button>
          <button onClick={ () => {colorMap(map, getContext())}}>Color</button>
        </div>
      </header>
    </div>
  );
}

export default App;
