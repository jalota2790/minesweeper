/*
File Created : 24th Jan 2020
Owner : Bi Viking Games
Developer : Arun jalota
*/

var timeValue = 0;
var timerId;

// This function returns the flag of the tile hidden/Flagged/Mine
function getTileFlag(index)  {
  var cell = (document.getElementById("minefield")).getElementsByClassName('tile hidden');
  return cell[index].getAttribute("flag");
}

// this function verifies the adjacent tiles in specified grid boundary and returns the value of the tile using the (x1,y1) coordinates.
function checkAdjacentTiles(x1, y1) {
  if((x1>=0)&&(y1>=0)&&(x1<columns)&&(y1<rows)) //Verify if coordinates do not fall outside of the gridMatrix.
      return gridMatrix[x1+y1*columns];
}

function Initializing(){
    //Initializing the variables
    smiley.classList.remove("face_lose");
    smiley.classList.remove("face_win");
    document.getElementById("gameComplete").innerHTML = "";

    mines = 0;
    rows = 0;
    columns = 0;
    remaining = mines;        // The number of mines remaining to be found.
    gridMatrix=[];
    revealed=0;

    setDifficulty();
}

function buildGrid() {
    // Fetch Grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";
    var id = 0;

    // Build DOM Grid
    var tile;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            tile = createTile(x,y,id++);
            grid.appendChild(tile);
        }
    }

    // Add the mines to Grid
    addMines();

    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));

    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";

}

function addMines(){
    minesPlaced=0;
    do{
        i=Math.floor(Math.random()*columns*rows);        // Select a random tile.
        if (gridMatrix[i]!='mine')        // Make sure the tile doesn't already have a mine.
        {
            gridMatrix[i]='mine';        // Set the mine
            minesPlaced++;        // and increase the count.
        }
    } while (minesPlaced<mines);        // Repeat until all mines are placed.

    for(var x=0;x<columns;x++){        // For each column
        for(y=0;y<rows+1;y++) {        // and each row:
            if(checkAdjacentTiles(x,y)!='mine') { //if the cell is not a mine:
                gridMatrix[x+y*columns]= // the value of the cell is the sum of mines in the eight neighboring tiles:
                 ((checkAdjacentTiles(x,y+1)=='mine')|0)        // down
                +((checkAdjacentTiles(x-1,y+1)=='mine')|0)      // down & left
                +((checkAdjacentTiles(x+1,y+1)=='mine')|0)      // down & right
                +((checkAdjacentTiles(x,y-1)=='mine')|0)        // up
                +((checkAdjacentTiles(x-1,y-1)=='mine')|0)      // up & left
                +((checkAdjacentTiles(x+1,y-1)=='mine')|0)      // up & right
                +((checkAdjacentTiles(x-1,y)=='mine')|0)        // left
                +((checkAdjacentTiles(x+1,y)=='mine')|0);       // right.
            }
        }
    }
}

function createTile(x,y,_id) {
    var tile = document.createElement("div");
    var atr = document.createAttribute("flag");
    atr.value = "hidden";

    tile.classList.add("tile");
    tile.classList.add("hidden");
    tile.id = _id;
    tile.setAttributeNode(atr);

    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks
    tile.addEventListener("mousedown", smileyDown ); // All Clicks

    return tile;
}

function startGame() {
    Initializing();
    buildGrid();
    startTimer();
}

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_limbo");
    smiley.classList.add("smiley");
}

function handleTileClick(event) {
  smileyUp();
  var source = event.target;
  let id = source.id;                        // The ID of the tile clicked by user.
  var tile = (document.getElementById("minefield")).getElementsByClassName('tile hidden');

    // Left Click : Reveal the tile
    if (event.which === 1) {
        if(gridMatrix[id]=='mine') {       // if the tile is a mine:
            tile[id].classList.add("mine_hit");
            revealMines(tile);
            gameCompletion(false);
        }
        else{
          if(getTileFlag(id)=='hidden') {
              revealTiles(id);        // otherwise reveal the tile
          }
        }
    }
    // Middle Click
    else if (event.which === 2) {
        //TODO try to reveal adjacent tiles
        index = id;
        var x=index%columns;        // Convert index into (x,y) coordinates.
        var y=Math.floor(index/columns);
        if(getTileFlag(id)=='uncovered') {
            if(x>0&&getTileFlag(index-1)=="hidden") revealTiles(index-1,true);  // left
            if(x<(columns-1)&&getTileFlag(+index+1)=="hidden") revealTiles(+index+1,true);                                // right
            if(y<(rows-1)&&getTileFlag(+index+columns)=="hidden") revealTiles(+index+columns,true);                        // down
            if(y>0&&getTileFlag(index-columns)=="hidden") revealTiles(index-columns,true);                                // up
            if(x>0&&y>0&&getTileFlag(index-columns-1)=="hidden") revealTiles(index-columns-1,true);                        // up & left
            if(x<(columns-1)&&y<(rows-1)&&getTileFlag(+index+columns+1)=="hidden") revealTiles(+index+columns+1,true);        // down & right
            if(x>0&&y<(rows-1)&&y<(rows-1)&&getTileFlag(+index+columns-1)=="hidden") revealTiles(+index+columns-1,true);                // down & left
            if(x<(columns-1)&&y>0&&y<(rows-1)&&getTileFlag(+index-columns+1)=="hidden") revealTiles(+index-columns+1,true);                // up & right
        }
    }
    // Right Click
    else if (event.which === 3) {
        switch(getTileFlag(id))
        {
             case 'flagged':
                tile[id].classList.remove("flag");     // If it's a flag, unflag it.
                tile[id].setAttribute("flag","hidden");
                remaining++;
                break;
             case 'hidden':
                tile[id].classList.add("flag");     // If the tile is uncovered, set a flag.
                tile[id].setAttribute("flag","flagged");
                remaining--;
                break;
       }
    }

    document.getElementById('flagCount').innerHTML=remaining;                // Update the count of remaining mines.

    if(revealed==rows*columns-mines){        // If all tiles revealed:
        gameCompletion(true);
    }
}

function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;

    // Defining rows, columns and mines based on difficulty levels
    // Easy : 9x9;10
    // Medium : 16x16;40
    // Hard : 30x16;99
    var difficultyLevel = (document.getElementById("difficulty")).selectedIndex;
    difficultyLevel == 0 ? (rows = columns = 9, updateMines(10)) :
    difficultyLevel == 1 ? (columns = rows = 16, updateMines(40)) :
    (rows = 30, columns = 16, updateMines(99));
}

function startTimer() {
    timeValue = 0;
    timerID = window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
    timeValue++;
    updateTimer();
}

function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}

function revealTiles(index, middleClick = false) {        // Uncover the tile
    var tile = (document.getElementById("minefield")).getElementsByClassName('tile hidden');
    if(gridMatrix[index]!="mine" && getTileFlag(index)=="hidden") {       // If it's covered and not a mine:
         revealed++;                 // If it was uncovered, increase the count of revealed tiles.
         tile[index].setAttribute("flag","uncovered");
         tile[index].classList.add("tile_"+gridMatrix[index]);        // Uncover the tile.

         var x=index%columns;        // Convert index into (x,y) coordinates.
         var y=Math.floor(index/columns);

         if(gridMatrix[index]==0 && !middleClick)        // If the value of the current tile is zero, check all the neighboring tiles:
         {
             if(x>0&&getTileFlag(index-1)=="hidden") revealTiles(index-1);  // left

             if(x<(columns-1)&&getTileFlag(+index+1)=="hidden") revealTiles(+index+1);                                // right

             if(y<(rows-1)&&getTileFlag(+index+columns)=="hidden") revealTiles(+index+columns);                        // down

             if(y>0&&getTileFlag(index-columns)=="hidden") revealTiles(index-columns);                                // up

             if(x>0&&y>0&&getTileFlag(index-columns-1)=="hidden") revealTiles(index-columns-1);                        // up & left

             if(x<(columns-1)&&y<(rows-1)&&getTileFlag(+index+columns+1)=="hidden") revealTiles(+index+columns+1);        // down & right

             if(x>0&&y<(rows-1)&&y<(rows-1)&&getTileFlag(+index+columns-1)=="hidden") revealTiles(+index+columns-1);                // down & left

             if(x<(columns-1)&&y>0&&y<(rows-1)&&getTileFlag(+index-columns+1)=="hidden") revealTiles(+index-columns+1);                // up & right
        }

        middleClick++;
    }
}

function gameCompletion(isWin){
    clearTimeout(timerID);
    var smiley = document.getElementById("smiley");

    if(isWin){
      smiley.classList.add("face_win");
      document.getElementById("gameComplete").innerHTML = "You won!!! Scores: " + timeValue;
    }else{
      smiley.classList.add("face_lose");
      document.getElementById("gameComplete").innerHTML = "Oops!!! You lost the game!";
    }
}

function revealMines(tile){
  for (i=0;i<rows*columns;i++) {
      if(gridMatrix[i]=='mine') {
         tile[i].setAttribute("flag","mine"); // show all the mines,
         tile[i].classList.add("mine");
      }
      if(gridMatrix[i]!='mine' && getTileFlag(i)=='flagged'){
         tile[i].classList.add("mine_marked");       // show a strike-through mine where flags were placed incorrectly.
      }
   }
}

function updateMines(minesCount) {
    document.getElementById("flagCount").innerHTML = minesCount;
    mines = remaining = minesCount;
}
