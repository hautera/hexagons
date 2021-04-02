import './App.css';
import { useEffect, useRef, useState } from 'react';
import {animateBreadthFirst} from './pathFinder';
import {dot} from './util';
//import Hex from './hex';
import {colorMap, aniColorMap} from './color'
import Map from './map'

function App() {
  const canvasRef = useRef(null);
  //const contextRef = useRef(null);
  const mapRef = useRef(new Map(6, 500, 400, 50));
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
    clickTest();
    //console.log(map.getNeighbors(map.selectHex(0,0,0)));
    //const pathSearch = breadthFirst(map.selectHex(-9, 1, 8), map, map.selectHex(1, 7, -8));
   // pathSearch.forEach( (hex) => {
   //   hex.draw(map.getSize(), context, map.center_x, map.center_y, true, 'red');
   // });
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
      let y_offset = event.clientY + window.pageYOffset;
      const map = mapRef.current;
      map.incCenter(x_offset, y_offset);
      map.draw(canvasRef.current.getContext('2d'), true);
    }
  }

  const findHex = (e) => {
    console.log(window.pageYOffset)
    const map = mapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const x = e.clientX;
    const y = e.clientY + window.pageYOffset;
    //clearScreen();
    map.draw(ctx, true);
    const [a,b,c] = map.findHex(x,y);
    console.log([a,b,c])
    const hex = map.selectHex(a,b,c);
    if ( hex ) {
      const tempColor = hex.color
      hex.draw(map.size, ctx, map.center_x, map.center_y, 'red');
      hex.color = tempColor;
    }

  }

  //used for debugging 
  //makes a cool montecarlo picture tho
  const clickTest = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maxX = canvas.width;
    const maxY = canvas.height;
    const map = mapRef.current;
    console.log("Calculating Colors");
    colorMap(map);
    console.log("Starting new click test");
    for (let i = 0; i < 1000000; i ++) {
      let rand_X = Math.random() * maxX;
      let rand_Y = Math.random() * maxY ;
      const [x,y,z] = map.findHex(rand_X, rand_Y);
      const h = map.selectHex(x,y,z);
      const color = h !== null? h.color : 'black';
      //console.log(color);
      dot(rand_X, rand_Y, color, ctx);
      //document.getElementById('canvas').click();
    }
  }

  const getContext = () => {
    return canvasRef.current.getContext('2d');
  }

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          id='canvas'
          ref={canvasRef}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseMoveCapture={drag}
          onClick={ findHex }
        />
        <div id='control-panel'>
          <button onClick={ () => {resize(10)}}>+</button>
          <button onClick={ () => {resize(-10)}}>-</button>
          <button onClick={ () => {aniColorMap(map, getContext())}}>Color</button>
          <button onClick={ () => {animateBreadthFirst(map.selectHex(6, -3, -3), map, map.selectHex(0,0,0), getContext())}}>Breadth First</button>
        </div>
      </header>
    </div>
  );
}

export default App;
