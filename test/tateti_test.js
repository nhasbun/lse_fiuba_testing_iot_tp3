const chai = require("chai");
const chaiHttp = require("chai-http");
const res = require("express/lib/response");
const server = require("../app");
const should = chai.should();
chai.use(chaiHttp);

/* 
- Cuando se inicia un juevo nuevo le toca al primer jugador y el tablero está 
vacío

- Cuando el primer jugador hace su movimiento le toca al otro jugador y la 
casilla elegida por el 1er jugador está ocupada

- Cuando el segundo jugador hace su movimiento le toca de nuevo al 1er jugador
y las casillas de los dos movimientos anteriores están ocupadas con marcas 
diferentes

- Cuando un jugador marca 3 casillas de la misma fila entonces gana
- Cuando un jugador marca 3 casillas de la misma columna entonces gana
- Cuando un jugador marca 3 casillas de las diagonales entonces gana
- Si un jugador mueve cuando no es su turno entonce se devuelve un error y el
tablero no cambia

- Cuando no quedan casillas vacías y no hay un ganador entonces hay un empate
*/

describe("Juego de TaTeTi", () => {

    let juego = {
        jugadores: ['Juan', 'Pedro']
    }

    let movimientos = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 0, fila: 1 },
        { jugador: 'Pedro', columna: 1, fila: 1 },
        { jugador: 'Juan', columna: 0, fila: 2 },
    ]

    let movimientos_fila = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 0, fila: 1 },
        { jugador: 'Juan', columna: 1, fila: 0 },
        { jugador: 'Pedro', columna: 1, fila: 1 },
        { jugador: 'Juan', columna: 2, fila: 0 },
    ]

    let movimientos_columna = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 2, fila: 0 },
        { jugador: 'Juan', columna: 1, fila: 0 },
        { jugador: 'Pedro', columna: 2, fila: 1 },
        { jugador: 'Juan', columna: 0, fila: 1 },
        { jugador: 'Pedro', columna: 2, fila: 2 },
    ]

    let movimientos_diagonal = [
        { jugador: 'Juan', columna: 0, fila: 2 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 1, fila: 1 },
        { jugador: 'Pedro', columna: 2, fila: 1 },
        { jugador: 'Juan', columna: 2, fila: 0 },
    ]

    let movimientos_error = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Juan', columna: 1, fila: 0 },
    ]

    let casillas_llenas = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 2, fila: 0 },
        { jugador: 'Juan', columna: 1, fila: 0 },
        { jugador: 'Pedro', columna: 0, fila: 1 },
        { jugador: 'Juan', columna: 1, fila: 1 },
        { jugador: 'Pedro', columna: 1, fila: 2 },
        { jugador: 'Juan', columna: 2, fila: 1 },
        { jugador: 'Pedro', columna: 2, fila: 2 },
        { jugador: 'Juan', columna: 0, fila: 2 },
    ]

    describe("Se empieza un juego nuevo", () => {

        it("Todos los casilleros estan vacios y le toca mover al primer jugador", (done) => {
            chai.request(server)
            .put("/empezar")
            .send(juego)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                // Le toca mover al primer jugador
                res.body.should.have.property('turno').eql('Juan');
                // Todos los casilleros estan vacios
                res.body.should.have.property('tablero').eql([
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                ]);
                done();
            })
        });
    });

    describe("El primer jugador hace su primer movimiento", () => {
        it("El casillero queda ocupado y le toca al otro jugador", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server)
                .put("/movimiento")
                .send(movimientos[0])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('turno').eql('Pedro');
                    res.body.should.have.property('tablero').eql([
                        ['x', ' ', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                })
        });
    });

    describe("El segundo jugador hace su primer movimiento", () => {

        it("El casillero queda ocupado y le toca al otro jugador", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientos[0]).end();
            chai.request(server)
                .put("/movimiento")
                .send(movimientos[1])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('turno').eql('Juan');
                    res.body.should.have.property('tablero').eql([
                        ['x', 'o', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                });
        });
    });

    describe("Cuando un jugador marca 3 casillas...", () => {

        it("De la misma fila entonces gana", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientos_fila[0]).end();
            chai.request(server).put("/movimiento").send(movimientos_fila[1]).end();
            chai.request(server).put("/movimiento").send(movimientos_fila[2]).end();
            chai.request(server).put("/movimiento").send(movimientos_fila[3]).end();

            chai.request(server)
                .put("/movimiento")
                .send(movimientos_fila[4])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('tablero').eql([
                        ['x', 'x', 'x'],
                        ['o', 'o', ' '],
                        [' ', ' ', ' '],
                    ]);
                    res.body.should.have.property('ganador').eql('Juan');
                    done()
                });
            
        });

        it("De la misma columna entonces gana", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientos_columna[0]).end();
            chai.request(server).put("/movimiento").send(movimientos_columna[1]).end();
            chai.request(server).put("/movimiento").send(movimientos_columna[2]).end();
            chai.request(server).put("/movimiento").send(movimientos_columna[3]).end();
            chai.request(server).put("/movimiento").send(movimientos_columna[4]).end();

            chai.request(server)
            .put("/movimiento")
            .send(movimientos_columna[5])
            .end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('tablero').eql([
                    ['x', 'x', 'o'],
                    ['x', ' ', 'o'],
                    [' ', ' ', 'o'],
                ]);
                res.body.should.have.property('ganador').eql('Pedro');
                done()
            });

        });

        it("De la misma diagonal entonces gana", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientos_diagonal[0]).end();
            chai.request(server).put("/movimiento").send(movimientos_diagonal[1]).end();
            chai.request(server).put("/movimiento").send(movimientos_diagonal[2]).end();
            chai.request(server).put("/movimiento").send(movimientos_diagonal[3]).end();

            chai.request(server)
            .put("/movimiento")
            .send(movimientos_diagonal[4])
            .end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('tablero').eql([
                    [' ', 'o', 'x'],
                    [' ', 'x', 'o'],
                    ['x', ' ', ' '],
                ]);
                res.body.should.have.property('ganador').eql('Juan');
                done()
            });          
        });
    })

    describe("Si un jugador mueve cuando no es su turno", () => {

        it("Se devuelve un error y el tablero no cambia", (done) => {

            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientos_error[0]).end();

            chai.request(server)
            .put("/movimiento")
            .send(movimientos_error[1])
            .end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('tablero').eql([
                    ['x', ' ', ' '],
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                ]);
                res.body.should.have.property('error').eql(true);
                done()
            });

        });
    })

    describe("Cuando no quedan casillas vacías", () => {

        it("No existe ganador y se declara empate", (done) => {
           
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[0]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[1]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[2]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[3]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[4]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[5]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[6]).end();
            chai.request(server).put("/movimiento").send(casillas_llenas[7]).end();

            chai.request(server)
            .put("/movimiento")
            .send(casillas_llenas[8])
            .end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('tablero').eql([
                    ['x', 'x', 'o'],
                    ['o', 'x', 'x'],
                    ['x', 'o', 'o'],
                ]);
                res.body.should.have.property('draw').eql(true);
                done()
            });
            
        });
    })
});