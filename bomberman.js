

var canvas = document.getElementById('canvas');
var body = document.getElementById('body');
body.keyUp = function() {
    alert('Up');
}
var context = canvas.getContext('2d');
console.log(context);

var f_size = 25;
var width = f_size * 33;
var height = f_size * 25;

canvas.width = width;
canvas.height = height;


function Pole() {
    this.typyPol = {
        'puste': 0,
        'beton': 1,
        'murek': 2,
        'bomba': 3
    };

    this.typPola = this.typyPol.puste;

    this.ustawBeton = function() {
        this.typPola = this.typyPol.beton;
    };

    this.jestBeton = function() {
        return this.typPola == this.typyPol.beton ? 1 : 0;
    };

    this.ustawMurek = function() {
        this.typPola = this.typyPol.murek;
    };

    this.jestMurek = function() {
        return this.typPola == this.typyPol.murek ? 1 : 0;
    };

    this.jestPuste = function() {
        return this.typPola == this.typyPol.puste ? 1 : 0;
    };
}

function MyGrid() {
    this.pola = [];

    this.kolorBetonu= '#fafafa';

    this.kolorMurku = '#dadada';

    this.init = function() {
        for (var i=0; i<width/f_size; i++) {
            this.pola[i] = [];
            for (var j=0; j<height/f_size; j++) {
                this.pola[i][j] = new Pole();
                this.ustawPole(i,j);
            }
        }

        return this;
    }

    this.rysujGrid = function() {
        for (x in this.pola) {
            for (y in this.pola[x]) {
                if (this.pola[x][y].jestBeton()) {
                    context.fillStyle = this.kolorBetonu;
                    context.fillRect(x*f_size, y*f_size, f_size, f_size);
                }
                else if (this.pola[x][y].jestMurek()) {
                    context.fillStyle = this.kolorMurku;
                    context.fillRect(x*f_size, y*f_size, f_size, f_size);
                }
            }
        }
    };

    this.wezPole = function(pozycja) {
        //console.log(pozycja);
        return this.pola[pozycja.x][pozycja.y];
    }

    this.ustawPole = function(i, j) {
        if((+i+1) % 2 == 0 && (+j+1) % 2 == 0) {
            this.pola[i][j].ustawBeton();
        }
        else {
            var rand = Math.floor(Math.random() * 5);
            if (rand == 1) {
                this.pola[i][j].ustawMurek();
            }
        }
    };

}

function MyLudzik(x, y) {
    this.pozycja = { x: x, y: y };
    this.kolor = '#ff0000';
    this.idzWDol = function() {
        return { x: this.pozycja.x, y: this.pozycja.y + 1 };
    }

    this.idzWGore = function() {
        return { x: this.pozycja.x, y: this.pozycja.y - 1 };
    }

    this.idzWPrawo = function() {
        return { x: this.pozycja.x + 1, y: this.pozycja.y };
    }

    this.idzWLewo = function() {
        return { x: this.pozycja.x - 1, y: this.pozycja.y };
    }

    this.stworz = function() {
        context.fillStyle = this.kolor;
        //context.fillCircle(x*f_size+f_size/2,y*f_size+f_size/2,f_size/2);
        context.fillRect(this.pozycja.x*f_size, this.pozycja.y*f_size, f_size, f_size);
        //console.log(this.pozycja);
    }

}

function Bomba(x, y) {
    this.pozycja = { x: x, y: y };
    this.zasieg = 1;
    this.zaplon = 3000;
    this.kolor = '#ff8800';
    this.kolorWybuchu = '#0088ff';

    this.rysuj = function() {
        context.fillStyle = this.kolor;
        context.fillRect(this.pozycja.x*f_size, this.pozycja.y*f_size, f_size, f_size);
    };

    this.wybuchnij = function() {
        context.fillStyle = this.kolorWybuchu;
        for (var xz = this.pozycja.x - this.zasieg; xz <= this.pozycja.x+this.zasieg; xz++) {
             context.fillRect(xz * f_size, this.pozycja.y * f_size, f_size, f_size);
        }

        for (var yz = this.pozycja.y - this.zasieg; yz <= this.pozycja.y+this.zasieg; yz++) {
             context.fillRect(this.pozycja.x * f_size, yz * f_size, f_size, f_size);
        }
       // z_size = f_size * (2 * this.zasieg + 1);
       // context.fillRect((this.pozycja.x - this.zasieg) * f_size, this.pozycja.y * f_size, z_size, f_size);
       // context.fillRect(this.pozycja.x * f_size, (this.pozycja.y - this.zasieg) * f_size, f_size, z_size);
    };
}

function KolekcjaBomb() {
    this.bomby = [];

    this.dodajBombe = function(bomba) {
        this.bomby.push(bomba);
    };

    this.usunBombe = function() {
        this.bomby.shift()
    };

    this.przerysujBomby = function() {
        for (i in this.bomby) {
            if (this.bomby[i].zaplon <= 0) {
                this.bomby[i].wybuchnij();
                this.usunBombe();
            }
            else {
                this.bomby[i].zaplon -= odswiezanie;
                this.bomby[i].rysuj();
            }
        }
    };
}

function Ruch(ludzik) {
    this.ruchLudzika = function() {
        var gdzie = Math.floor(4 * Math.random());
        var nowaPozycja;

        if (gdzie == 0) {
            nowaPozycja = ludzik.idzWDol();
        }
        else if (gdzie == 1) {
            nowaPozycja = ludzik.idzWGore();
        }
        else if (gdzie == 2) {
            nowaPozycja = ludzik.idzWPrawo();
        }
        else if (gdzie == 3) {
            nowaPozycja = ludzik.idzWLewo();
        }

        return nowaPozycja;
    }

    this.sprawdzCzyLudzikMoze = function(nowaPozycja, pole) {
        if (pole.jestPuste()) {
            ludzik.pozycja = nowaPozycja;
        }
    }
}


function Rysuj() {
    this.kolekcjaKlas = [];
    /**
     *
     * @param obiekt
     * @param srring metoda  
    */ 
    this.dodajKlase = function(klasa, metoda) {
        this.kolekcjaKlas.push({klasa: klasa, metoda: metoda});
        return this;
    };

    this.przerysuj = function() {
        context.fillStyle = '#00ff00';
        context.fillRect(0,0,width,height);

        for (i in this.kolekcjaKlas) {
            var klasa = this.kolekcjaKlas[i].klasa;
            klasa[this.kolekcjaKlas[i].metoda]();
        }
    };
}

var odswiezanie = 500;

var grid = (new MyGrid()).init();
var ludzik = new MyLudzik(12, 12);
var ruch = new Ruch(ludzik);
var kolekcjaBomb = new KolekcjaBomb();

var klasaRysujaca = new Rysuj();

klasaRysujaca.dodajKlase(grid, 'rysujGrid')
    .dodajKlase(ludzik, 'stworz')
    .dodajKlase(kolekcjaBomb, 'przerysujBomby');


var bomba = new Bomba(11, 11);
kolekcjaBomb.dodajBombe(bomba);

setInterval(function() {
    //grid['rysujGrid']();
    var ruchLudzika = ruch.ruchLudzika();
    var pole = grid.wezPole(ruchLudzika);

    ruch.sprawdzCzyLudzikMoze(ruchLudzika, pole);
    klasaRysujaca.przerysuj();

}, odswiezanie);

