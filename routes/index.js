var express = require('express');
var router = express.Router();

var jugadores;
var tablero;
var turno;
var movimientos;

const marcas = ['x', 'o'];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.put('/empezar', function (request, response) {
  turno = 0;
  movimientos = 0;
  jugadores = request.body.jugadores;
  tablero = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];

  response.setHeader('Content-Type', 'application/json');  
  response.send({turno: jugadores[turno], tablero: tablero});
});

router.put('/movimiento', function (request, response) {
  const columna = request.body.columna;
  const fila = request.body.fila;
  const player = request.body.jugador;

  var last_player = player;
  var last_turn = turno;
  var winner = false;
  var winner_player = "";
  var error = false;

  response.setHeader('Content-Type', 'application/json');  

  // Check for invalid movement
  if (last_player != jugadores[turno]) {
    response.send({turno: jugadores[turno], tablero: tablero, error: true});
    return;
  }

  tablero[fila][columna] = marcas[turno];
  movimientos++;
  turno = (turno + 1) % 2;

  // horizontal winner check
  tablero.forEach(fila => {
    if (fila[0] === marcas[last_turn] && 
        fila[1] === marcas[last_turn] && 
        fila[2] === marcas[last_turn]) {
      winner = true;
    }
  });

  // vertical winner check
  for (let column_index = 0; column_index < 3; column_index++) {
    if (tablero[0][column_index] == marcas[last_turn] &&
        tablero[1][column_index] == marcas[last_turn] &&
        tablero[2][column_index] == marcas[last_turn]) {
          winner = true;
        }    
  }

  // diagonal winner check
  if ((
      tablero[0][0] == marcas[last_turn] &&
      tablero[1][1] == marcas[last_turn] &&
      tablero[2][2] == marcas[last_turn]) ||
      tablero[2][0] == marcas[last_turn] &&
      tablero[1][1] == marcas[last_turn] &&
      tablero[0][2] == marcas[last_turn]) {
        winner = true;
      }

  if (winner) {
    winner_player = last_player;
  }

  // Delaring a game draw
  if (movimientos >= 9 && winner == false) {
    response.send({tablero: tablero, draw: true});
    return;
  }
 
  response.send({turno: jugadores[turno], tablero: tablero, ganador: winner_player});
});

module.exports = router;
