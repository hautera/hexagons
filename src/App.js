import logo from './logo.svg';
import './App.css';
import { useEffect, useRef } from 'react';


//inversed indexs of the hex
const n_inversed_ind = [3, 4, 5, 0, 1, 2];
const noNeighbors = [null, null, null, null, null, null];

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
  constructor (neighbors, x, y, horizontal=true) {
    this.x = x;
    this.y = y;
    this.n = neighbors.slice();
    this.horizontal = horizontal;
    this.explored = false;
    for (let i = 0; i < 6; i ++ ) {
      if (this.n[i]) {
        this.n[i].addNeighbor(this, n_inversed_ind[i]);
      }
    }
    return this;
  }

  //returns the list of neighbors this hex has listed 
  getNeighbors() {
    return this.n.slice();
  }

  //returns the x, y coordinates of this hexagon
  getCoords() {
    return [this.x, this.y];
  }

  // hex is a neighboring hexagon
  // 0 <= pos =< 5 is the position of the hexagon 
  addNeighbor(hex, pos) {
    if( !this.n[pos] ) {
      this.n[pos] = hex;
    } else {
      console.error("Already have this neighbor");
    }
  }

  //return euclidian distance from center of an
  //x,y coordinate
  dist (x, y) {
    const dx = (this.x - x);
    const dy = (this.y - y);
    return dx ** 2 + dy ** 2 
  }

  //returns true if x,y are in the hexagon
  contains(x,y) {
    for (let i = 0; i < 6; i ++ ) {
      if ( this.n[i] && this.n[i].dist(x,y) < this.dist(x,y)) { return false; }
    }
    return true;
  }

  //draws this hexagon on the screen 
  draw = (size, context, color, x_offset = 0, y_offset = 0) => {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(this.x,this.y);

    for(let i = 0; i < 7; i++){
      let x0, y0;
      if (this.horizontal){
        [x0, y0] = num_60rotations(i);
      } else {
        [y0, x0] = num_60rotations(i);
      }
      context.lineTo(size * (x0 + this.x) + x_offset, size * (y0 + this.y) + y_offset);
    }
    context.closePath();
    context.fill();
    context.restore();
  };

  //useful i promise 
  explore () { this.explored = true; }

  unexplore() { this.explored = false; }

  toString() {
    return `Hexagon centered at ${this.x}, ${this.y}`;
  }
}


class Map {
  //size represents the number of layers we will move from the center
  constructor (size) {
    this.root = new Hex(noNeighbors, 0, 0);
    if (size > 1) {  
      let hex1 = new Hex([null, null, null, this.root, null, null], 2 * 0.866 * num_60rotationsOffet30(0)[0], 2 * 0.866 * num_60rotationsOffet30(0)[1]);
      for( let i = 1; i < 6; i ++) {
        let temp_ls = [null, null, null, null, null, null];
        let j = (3 + i) % 6;
        let k = (4 + i) % 6;
        temp_ls[j] = this.root;
        temp_ls[k] = hex1;

        let [x, y] = num_60rotationsOffet30(i);
        x *= 2 * 0.866;
        y *= 2 * 0.866;
        hex1 = new Hex(temp_ls, x, y);
      }
    }
    //if size > 2 idk 
    //TODO proper coords 
    //Also might not want hex's to keep track of their neighbors :(
    //If we do proper coords, we probably don't need hexs to 
    return this;
  }

  draw(hexSize, center_x, center_y, context) {
    this.apply_function((hex) => {hex.draw(hexSize, context, 'white', center_x, center_y)})
  }

  //applies function to all hexes in map
  apply_function(func) {
    this.rmap(this.root, func);
    this.unexplore();
  }

  //resets all hexes to unexplored
  unexplore() {
    this.runexplore(this.root);
  }

  runexplore(hex) {
    if (hex && !hex.explored ) { return; }
    hex.unexplore();
    hex.getNeighbors().forEach( (n_hex) => {
      if (n_hex) { this.runexplore(n_hex); }
    });
  }

  //Actually the function that 
  //applies function to all hexes in map
  rmap(hex, func) {
    if( hex && hex.explored ) { return; }
    hex.explore();
    hex.getNeighbors().forEach( (n_hex) => {
      if ( n_hex ) { this.rmap(n_hex, func); }
    });
    func(hex);
  }

}

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const min = (a, b) => {
    if (a < b) { return a; }
    else { return b; }
  };

  useEffect(() => {
    const size = 100;
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

    let x = new Map(2);
    x.draw(100, 500, 500, context);
  }, []);

  const startCavas = () => {
    console.log()
  };

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          onLoad={startCavas}
          ref={canvasRef}
        />
      </header>
    </div>
  );
}

export default App;
