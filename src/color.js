import {sleep} from './util'

const colorMap = (map) => {
  const colors = ['blue', 'teal', 'green', 'purple'];
    const rootHex = map.selectHex(0,0,0);
    rColor(rootHex, colors, map);
}

const rColor = (hex, colors, map) => {
  if( hex.color === null ) {
    //const [x,y,z] = hex.getCoords();
    //console.log(x,y,z);
    //we assume that the hex's color is null if it isn't idk
    const neighbors = map.getNeighbors(hex);
    for (let i = 0; i < colors.length; i ++) {
      let neighborColors = neighbors.map( (h) => h.color );
      const color = colors[i];
      //await sleep(100);
      //hex.draw(map.getSize(), context, map.center_x, map.center_y, color);
      if( !neighborColors.includes(color) ){
        hex.color = color; 
        //console.log(`Selected color: ${color}`)
        //const isSol = neighbors.map( (h) => rColor(h, colors, map, context) );   
        // we have selected a color 
        //now we recursively calculate the other colors 
        let firstNull = neighborColors.indexOf(null);
        while ( firstNull !== -1 ) {
          if ( !rColor(neighbors[firstNull], colors, map) ) break;
          neighborColors = neighbors.map( (h) => h.color );
          firstNull = neighborColors.indexOf(null);
        }
        if ( !neighborColors.includes(null) ) {
          return true;
        }
      } 
    }
    hex.color = null;
    //hex.draw(map.getSize(), context, map.center_x, map.center_y, 'noColor');
    return false;
  }
};

//Calculates coloration of the map
//assumes a planar map (i.e. there are only four colors required) :) 
const aniColorMap = (map, context) => {
    // select a hex
    // give it a color 
    //const nodes = map.hexes;
    const colors = ['blue', 'teal', 'green', 'purple'];
    const rootHex = map.selectHex(0,0,0);
    aniRColor(rootHex, colors, map, context);
  }
  
  const aniRColor = async (hex, colors, map, context) => {
    if( hex.color === null ) {
      //const [x,y,z] = hex.getCoords();
      //console.log(x,y,z);
      //we assume that the hex's color is null if it isn't idk
      const neighbors = map.getNeighbors(hex);
      for (let i = 0; i < colors.length; i ++) {
        let neighborColors = neighbors.map( (h) => h.color );
        const color = colors[i];
        await sleep(100);
        hex.draw(map.getSize(), context, map.center_x, map.center_y, color);
        if( !neighborColors.includes(color) ){
          hex.color = color; 
          //console.log(`Selected color: ${color}`)
          //const isSol = neighbors.map( (h) => rColor(h, colors, map, context) );   
          // we have selected a color 
          //now we recursively calculate the other colors 
          let firstNull = neighborColors.indexOf(null);
          while ( firstNull !== -1 ) {
            if ( !await aniRColor(neighbors[firstNull], colors, map, context) ) break;
            neighborColors = neighbors.map( (h) => h.color );
            firstNull = neighborColors.indexOf(null);
          }
          if ( !neighborColors.includes(null) ) {
            return true;
          }
        } 
      }
      hex.color = null;
      hex.draw(map.getSize(), context, map.center_x, map.center_y, 'noColor');
      return false;
    }
  }

export {aniColorMap, colorMap};