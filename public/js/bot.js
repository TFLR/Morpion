var playerTurn = "X";
var computerTurn = "O";
var buttons = document.getElementsByClassName("game");

//FUNCTION CREATE RANDOM NUMBER
function randomNumber() {
  return Math.floor(Math.random() * 8);
} //end of function

//FUNCTION TO SET A WIN LINE
function checkLine(player, number1, number2, number3) {
  if ($("#" + number1).text() === player && $("#" + number2).text() === player && $("#" + number3).text() === player) {
    if (player === playerTurn) {
      $("#messages").text("Game over. You won!");
    } else if (player === computerTurn) {
      $("#messages").text("Game over. You lost.");
    }
    
   
  }
} // end of function

//FUNCTION TO SET ALL POSSIBLE WIN LINES
function win(letter) {
  checkLine(letter, 1, 2, 3);
  checkLine(letter, 4, 5, 6);
  checkLine(letter, 7, 8, 9);
  checkLine(letter, 1, 4, 7);
  checkLine(letter, 2, 5, 8);
  checkLine(letter, 3, 6, 9);
  checkLine(letter, 1, 5, 9);
  checkLine(letter, 3, 5, 7);
}


//FUNCTION TO SET DRAW IF ALL BOXES FULL
function draw() {

  var counter = 0;
  while (counter < 10) {

    if (buttons[counter].innerHTML === "X" || buttons[counter].innerHTML === "O") {
      counter += 1;
    } else {
      return;
    }
    if (counter === 9) {
      $("#messages").text("Game Drawn!");
      
    }
  }
}; //end of draw function


// ADD EVENT HANDLER TO GRID BUTTON CLICK
$(".game").click(function () {

  // IF TRY AND CLICK ON ALREADY CLICKED, GIVE MESSAGE
  if ($(this).text() === "X" || $(this).text() === "O") {
    return
  } else { //ADD TEXT TO BUTTON
    $(this).text(playerTurn);

    // START AI
    for (i = 0; i < 10; i++) {
      var random = randomNumber();
      if (buttons[random].innerHTML === "X" || buttons[random].innerHTML === "O") {
        continue;
      } else {
        buttons[random].innerHTML = computerTurn;
        break;
      }
    } //end of AI
  } //end of else


  // RUN FUNCTIONS FOR X AND O PARAMETERS
  win(playerTurn);
  win(computerTurn);

  if (!win("X") || !win("O")) {
    draw();
  }

}); //End of game click handler