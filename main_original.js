// Using and SVG API for getting Intersections between the polygon and the line.
// Added with : npm install svg-intersections.

// Using Browserify to add svg-intersections node module to the webpage.
// Added with : npm install -g browserify.
// npm command for browserify : browserify q.js -o question.js

var svgIntersections = require('svg-intersections');
var intersect = svgIntersections.intersect;
var shape = svgIntersections.shape;

var isDrawing = false; // Variable to keep the Drawing Status

var lineStartPoint = {}; // For storage of initial point of the line.
var lineEndPoint = {}; // For end point of the line.

var mouseMoveStart = false; // For checking the first move after mouseDown event.

function onMouseDown(event) {
    isDrawing = true;

    // Saving the initial point of the line.
    lineStartPoint = {
        x: event.pageX,
        y: event.pageY
    };

    mouseMoveStart = true;
}

function onMouseMove(event) {
    if(isDrawing) {

        // Checking For First Move After mouseDown event.
        if(mouseMoveStart) {
            mouseMoveStart = false;
        }
        else {
            removeUserLine(); // Removing the old line for creation of a new line with new coordinates.
        }

        // Saving the end point of the line.
        lineEndPoint = {
            x: event.pageX,
            y: event.pageY
        };
    
        addLine(lineStartPoint, lineEndPoint, "red");
    }
}

function onMouseUp(event) {

    const content = document.getElementById("content");

    // Extracting the paths of the polygon and the line created by the user.
    var polygonPath = content.firstChild.firstChild.getAttribute("d");
    var linePath = content.lastChild.firstChild.getAttribute("d");

    // Creating shpes for svg-intersection to get intersections.
    var polygonShape = shape("path", {d: polygonPath});
    var lineShape = shape("path", {d: linePath});

    // Fetching the intersections from shapes using intersect function.
    var shapeIntersections = intersect(polygonShape, lineShape);
    
    var intersectionPoints = shapeIntersections.points;

    var leftPolyPoints = [], rightPolyPoints = []; // Left and Right are to signify the position of the polygon with respect to line.

    if(intersectionPoints.length > 1) {
        var isLeftPolyActive = false, isRightPolyActive = false; // Flag vriables to track polygon point assignment.

        // Fetching Points for New Polygons using Old Polygon Points and the Intersection Points.
        points.forEach(function(point, index) {
            // taking any two points from the intersectio array to form the line and fint point position.
            var pointPosition = findPointPositionWithLine(intersectionPoints[0], intersectionPoints[1], point);

            if(pointPosition < 0) { // For left Polygon.
                if(isRightPolyActive) { // For shifting from one polygon to another.
                    // For finding the correct intersection between previous and current point of the Old Polygon.

                    // Setting first postition as a dummy for checking with other values.
                    var currentIntersectionPosition = Math.abs(findPointPositionWithLine(points[index - 1], points[index], intersectionPoints[0]));

                    var intersection = intersectionPoints.reduce(function(prevIntersection, intersectPoint) {
                        intersectionPosition = Math.abs(findPointPositionWithLine(points[index - 1], points[index], intersectPoint));

                        if(intersectionPosition < currentIntersectionPosition) {
                            currentIntersectionPosition = intersectionPosition;
                            return intersectPoint;
                        }
                        else {
                            return prevIntersection;
                        }

                    }, intersectionPoints[0]);

                    // Pushing the intersection point to both the polygons.
                    rightPolyPoints.push(intersection);
                    leftPolyPoints.push(intersection);

                    isRightPolyActive = false;
                }

                // Pushing Current point to left polygon.
                leftPolyPoints.push(point);
                isLeftPolyActive = true;
            }
            else if(pointPosition > 0) { // For Right Polygon.
                if(isLeftPolyActive) { // For shifting from one polygon to another.
                    // For finding the correct intersection between previous and current point of the Old Polygon.

                    // Setting first postition as a dummy for checking with other values.
                    var currentIntersectionPosition = Math.abs(findPointPositionWithLine(points[index - 1], points[index], intersectionPoints[0]));

                    var intersection = intersectionPoints.reduce(function(prevIntersection, intersectPoint) {
                        intersectionPosition = Math.abs(findPointPositionWithLine(points[index - 1], points[index], intersectPoint));

                        if(intersectionPosition < currentIntersectionPosition) {
                            currentIntersectionPosition = intersectionPosition;
                            return intersectPoint;
                        }
                        else {
                            return prevIntersection;
                        }

                    }, intersectionPoints[0]);

                    // Pushing the intersection point to both the polygons.
                    rightPolyPoints.push(intersection);
                    leftPolyPoints.push(intersection);

                    isLeftPolyActive = false;
                }

                // Pushing Current Point to Right Polygon.
                rightPolyPoints.push(point);
                isRightPolyActive = true;
            }
            else if(pointPosition == 0) { // For Point at the User Drawn Line.
                // Pushing the Point to both the polygons.
                rightPolyPoints.push(point);
                leftPolyPoints.push(point);

                // Flagging no polygon as active because the Point is on the User Drawn Line.
                isRightPolyActive = false;
                isLeftPolyActive = false;
            }
            else {
                console.log("Error : ", pointPosition);
            }

        });

        clearPoly();
        addPoly(leftPolyPoints, 'blue');
        addPoly(rightPolyPoints, 'green');
    }
    else {
        removeUserLine(); // For Removing the line created by the user.
    }

    isDrawing = false;
}

// Function to find the relative position of a point with respect to the user drawn line.
function findPointPositionWithLine(lineStart, lineEnd, point) {
    // Using the mathematical equation for a line between two points.
    // (y - y1) = ((y2 - y1) / (x2 - x1)) * (x - x1)
    //            <------slope---------->
    // 0 = (slope * (x - x1)) - (y - y1)

    var x1 = Math.round(lineStart.x), y1 = Math.round(lineStart.y), x2 = Math.round(lineEnd.x), y2 = Math.round(lineEnd.y);
    var x = Math.round(point.x), y = Math.round(point.y);

    var slope = ((y2 - y1) / (x2 - x1));

    var pointPosition = (slope * (x - x1)) - (y - y1); 
    // if pointPosition is 
    // 0 : the point is on the line.
    // >0 : the point is on say right side of the line.
    // <0 : the point is on say left side of the line.

    return Math.round(pointPosition);
}

/*
	Code below this line shouldn't need to be changed
*/

//Draws a polygon from the given points and sets a stroke with the specified color
function addPoly(points, color = 'black') {
    if(points.length < 2) {
        console.error("Not enough points");
        return;
    }

    let path = 'M' + points[0].x + ' ' + points[0].y

    for(const point of points) {
        path += ' L' + point.x + ' ' + point.y;
    }
    path += " Z";

    createSVGPathElement(path, color);
}

// A function to create a straignt line.
function addLine(start, end, color) {
    let path = 'M' + start.x + ' ' + start.y + " L" + end.x + " " + end.y; // Path for the Line.

    createSVGPathElement(path, color);
}

// A function to create the SVG and Path element with the path, color and common properties.
function createSVGPathElement(path, color) {
    const content = document.getElementById('content');

    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var svgPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');

    svgPath.setAttribute('d', path);
    svgPath.setAttribute('stroke', color);

    svgElement.setAttribute('height', "500");
    svgElement.setAttribute('width', "500");
    svgElement.setAttribute('style', 'position: absolute;');
    svgElement.setAttribute('fill', 'transparent');

    svgElement.appendChild(svgPath);
    content.appendChild(svgElement);
}

//Clears the all the drawn polygons
function clearPoly() {
    const content = document.getElementById('content');
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }
}

// Removes the line created by the User.
function removeUserLine() {
    const content = document.getElementById('content');
    content.removeChild(content.lastChild);
}

//Sets the mouse events needed for the exercise
function setup() {
    clearPoly();
    addPoly(points);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
}

const points = [
    { x : 100, y: 100 },
    { x : 200, y: 50 },
    { x : 300, y: 50 },
    { x : 400, y: 200 },
    { x : 350, y: 250 },
    { x : 200, y: 300 },
    { x : 150, y: 300 },
    { x : 100, y: 100 } // It is same as the first point. Added for prevention of an error created by not pressence of closing last point.
]

window.onload = () => setup()
