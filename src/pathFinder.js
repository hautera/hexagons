'useStrict'; 

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const contains = (ls, hex) => {
    for( let i = 0; i < ls.length; i ++ ) {
        const n = ls[i];
        if ( hex.eqs(n) ) {
            return true;
        }
    }
    return false;
}

//returns a callback function
// (vertex) => path 
// where path is an array of vertices 
// and returns a callback function 
// (vertex1, vertex2) => boolean
// that adds a path
const paths = () => {
    let paths = []

    const findPath = (vertex) => {
        for (let i = 0; i < paths.length; i ++) {
            const path = paths[i];
            //console.log(path, vertex, contains(path, vertex))
            if ( contains(path, vertex) ) {
                return path;
            }
        }
        return null;
    }

    const newPath = (vertex1, connectingVertex) => {
        //console.log(paths)
        if (connectingVertex) {
            const path = findPath(connectingVertex);
            if ( path === null ) return false;
            let newPath = path.slice();
            newPath.push(vertex1);
            //console.log(newPath);
            paths.push(newPath);
        } else {
            //we are at the start vertex
            paths.push([vertex1]);
        }
    }

    return [findPath, newPath];
}

//breadthFirst Search 
//start is a vertex
//getVertices is a function f : V -> Powerset(V) best if f(v) = connections(v)
//returns 
const breadthFirst = (start, map, finish) => {
    let q = [start, ]
    let explored = []
    let [findPath, newPath] = paths();
    newPath(start);
    while(q.length > 0){
        const nextNode = q.shift();
        if (contains(explored, nextNode)) continue;
        //console.log(nextNode);
        explored.push(nextNode); 
        //console.log(nextNode, finish.eqs(nextNode));
        if ( finish.eqs(nextNode) ) {
            //console.log(`We found a path: ${findPath(nextNode)}` ); 
            return findPath(nextNode); 
        }
        const neighbors = map.getNeighbors(nextNode);
        for (let i = 0; i < neighbors.length; i ++ ) {
            const n = neighbors[i];
            if (!explored.includes(n)) {
                q.push(n);
                newPath(n, nextNode);
            }
        }
    }
    return null;
}

const animateBreadthFirst = async (start, map, finish, context) => {
    const exploredColor = 'teal';
    const poppedColor = 'grey';
    const curColor = 'purple'
    const pathColor = 'red';
    let q = [start, ]
    let explored = []
    let [findPath, newPath] = paths();
    newPath(start);
    start.color = pathColor;
    start.draw(map.getSize(), context, map.center_x, map.center_y, pathColor)
    while(q.length > 0){
        const nextNode = q.shift();
        if (contains(explored, nextNode)) continue;
        await sleep(100);
        if (!nextNode.eqs(start)) {
            nextNode.draw(map.getSize(), context, map.center_x, map.center_y, curColor);
        }
        //console.log(nextNode);
        explored.push(nextNode); 
        //console.log(nextNode, finish.eqs(nextNode));
        if ( finish.eqs(nextNode) ) {
            //console.log(`We found a path: ${findPath(nextNode)}` ); 
            const path = findPath(nextNode); 
            await path.forEach( async (hex) => {
                await sleep(100);
                hex.draw(map.getSize(), context, map.center_x, map.center_y, pathColor);
            });
            return;
        }
        const neighbors = map.getNeighbors(nextNode);
        for (let i = 0; i < neighbors.length; i ++ ) {
            const n = neighbors[i];
            if (!contains(explored, n)) {
                await sleep(100);
                n.color = poppedColor;
                n.draw(map.getSize(), context, map.center_x, map.center_y, poppedColor);
                q.push(n);
                newPath(n, nextNode);
            }
        }
        nextNode.draw(map.getSize(), context, map.center_x, map.center_y, exploredColor);
    }
    return null;
}

export {animateBreadthFirst, breadthFirst};