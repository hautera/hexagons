import {num_60rotations} from './util';
import Hex from './hex';

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
      this.hexes.forEach( (hex) => hex.draw(hexSize, context, this.center_x, this.center_y) );
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

export default Map;