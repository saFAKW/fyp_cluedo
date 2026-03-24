const svg = document.getElementById("board");

const size = 30;
const rows = 25;
const cols = 25;
const padding = size; // one tile of outer space for starting squares
const ns = "http://www.w3.org/2000/svg";

const boardWidth = cols * size;
const boardHeight = rows * size;

svg.setAttribute("width", boardWidth + padding * 2);
svg.setAttribute("height", boardHeight + padding * 2);

/*
Room layout:
r = top row
c = left col
w = width in tiles
h = height in tiles

*/

const rooms = [
  // top row
  { name: "topLeft",     r: 0,  c: 0,  w: 6, h: 6, doors: [[5,1],[2,5]] },   // bottom, right
  { name: "topMiddle",   r: 0,  c: 9,  w: 7, h: 6, doors: [[5,3]] },         // bottom
  { name: "topRight",    r: 0,  c: 19, w: 6, h: 6, doors: [[5,3],[2,0]] },   // bottom, left

  // middle row
  { name: "midLeft",     r: 9,  c: 0,  w: 6, h: 7, doors: [[3,5]] },         // right
  { name: "center",      r: 9,  c: 9,  w: 7, h: 7, doors: [[0,3]] },         // top
  { name: "midRight",    r: 9,  c: 18, w: 7, h: 7, doors: [[3,0]] },         // left

  // bottom row
  { name: "bottomLeft",  r: 19, c: 0,  w: 6, h: 6, doors: [[0,1],[3,5]] },   // top, right
  { name: "bottomMiddle",r: 19, c: 9,  w: 7, h: 6, doors: [[0,3]] },         // top
  { name: "bottomRight", r: 19, c: 18, w: 7, h: 6, doors: [[0,3],[3,0]] }    // top, left
];

const startSquares = [
  // left side
  { r: 8,  c: -1, color: "#d83b3b", name: "Miss Scarlet" },
  { r: 18, c: -1, color: "#e0b12f", name: "Colonel Mustard" },

  // right side
  { r: 8,  c: 25, color: "#2e86de", name: "Mrs Peacock" },
  { r: 18, c: 25, color: "#2ecc71", name: "Mr Green" },

  // bottom side
  { r: 25, c: 8,  color: "#f5f5f5", name: "Mrs White" },
  { r: 25, c: 17, color: "#8e44ad", name: "Professor Plum" }
];

function createRect(x, y, width, height, className) {
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("class", className);
  svg.appendChild(rect);
  return rect;
}

function inAnyRoom(r, c) {
  return rooms.some(room =>
    r >= room.r &&
    r < room.r + room.h &&
    c >= room.c &&
    c < room.c + room.w
  );
}

//  Draw corridor tiles everywhere not occupied by rooms
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (!inAnyRoom(r, c)) {
      createRect(
        padding + c * size,
        padding + r * size,
        size,
        size,
        "tile"
      );
    }
  }
}

// Draw rooms
rooms.forEach(room => {
  createRect(
    padding + room.c * size,
    padding + room.r * size,
    room.w * size,
    room.h * size,
    "room"
  );
});

// Draw doors INSIDE rooms
rooms.forEach(room => {
  room.doors.forEach(([dr, dc]) => {
    createRect(
      padding + (room.c + dc) * size,
      padding + (room.r + dr) * size,
      size,
      size,
      "door"
    );
  });
});

startSquares.forEach(start => {
  const rect = createRect(
    padding + start.c * size,
    padding + start.r * size,
    size,
    size,
    "start"
  );

  rect.setAttribute("fill", start.color);
  rect.setAttribute("stroke", "#666");
  rect.setAttribute("stroke-width", "1");
});

// Draw board outline around the actual 25x25 board
createRect(
  padding,
  padding,
  boardWidth,
  boardHeight,
  "board-outline"
);