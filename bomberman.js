

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


function Pole(x, y) {
    this.pozycja = { x: x, y: y };
    this.typyPol = {
        'puste': 0,
        'beton': 1,
        'murek': 2,
        'bomba': 3,
        'ludzik': 4
    };

    this.zawartosc;

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

    this.ustawPuste = function() {
        this.typPola = this.typyPol.puste;
        this.zawartosc = false;
    };

    this.jestPuste = function() {
        return this.typPola == this.typyPol.puste ? 1 : 0;
    };

    this.ustawLudzika = function(ludzik) {
        this.typPola = this.typyPol.ludzik;
        this.zawartosc = ludzik;
    };

    this.jestLudzik = function() {
        return this.typPola == this.typyPol.ludzik ? 1 : 0;
    };

    this.ustawBombe = function(bomba) {
        this.typPola = this.typyPol.bomba;
        this.zawartosc = bomba;
    };

    this.jestBomba = function() {
        return this.typPola == this.typyPol.bomba ? 1 : 0;
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
                this.pola[i][j] = new Pole(i,j);
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

function Ludzik(x, y, kolor) {
    this.pozycja = { x: x, y: y };
    this.kolor = kolor || '#ff0000';
    this.index;
    this.stawiamBombe;
    this.umarlem;

    this.ustawIndex = function(index) {
        this.index = index;
    }

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

    this.rysuj = function() {
        context.fillStyle = this.kolor;
        //context.fillCircle(x*f_size+f_size/2,y*f_size+f_size/2,f_size/2);
        context.fillRect(this.pozycja.x*f_size, this.pozycja.y*f_size, f_size, f_size);
        //console.log(this.pozycja);
    };

    this.podlozBombe = function() {
        var bomba = new Bomba(this.pozycja.x, this.pozycja.y);
        this.stawiamBombe = bomba;
    };

    this.umrzyj = function() {
        this.umarlem = true;
    }
}

function MenagerLudzikow(grid, menagerBomb){
    this.kolekcjaLudzikow = [];

    this.dodajLudzika = function(ludzik) {
        this.kolekcjaLudzikow.push(ludzik);

        ludzik.ustawIndex(this.kolekcjaLudzikow.lenght-1);
    };

    this.usunLudzika = function(ludzik) {
        var nowaKolekcja = [];
        for (i in this.kolekcjaLudzikow) {
           this.kolekcjaLudzikow[i].ustawIndex(i);
           if (ludzik.index != i) {
                nowaKolekcja.push(this.kolekcjaLudzikow[i]);
           }
        }
        this.kolekcjaLudzikow = nowaKolekcja;;
    };

    this.przerysuj = function() {
        for (index in this.kolekcjaLudzikow) {
            var ludzik = this.kolekcjaLudzikow[index];
            console.log(ludzik);

            grid.wezPole(ludzik.pozycja).ustawPuste();

            this.czyLudzikUmarl(ludzik);
            this.czyLudzikStawiaBombe(ludzik);

            var ruch = new Ruch(ludzik);
            var ruchLudzika = ruch.ruchLudzika();

            var pole = grid.wezPole(ruchLudzika);
            ruch.sprawdzCzyLudzikMoze(ruchLudzika, pole, this);
            ludzik.rysuj();
            grid.wezPole(ludzik.pozycja).ustawLudzika(ludzik);
        }
    };

    this.ludzikMozeWejscNaPole = function(pole) {
        for (index in this.kolekcjaLudzikow) {
            var ludzik = this.kolekcjaLudzikow[index];
            if (ludzik.pozycja.x == pole.pozycja.x &&
                ludzik.pozycja.y == pole.pozycja.y
            ) {
                return false;
            }
        }
        return true;
    }

    this.czyLudzikStawiaBombe = function(ludzik) {
        if (ludzik.stawiamBombe) {
            menagerBomb.dodajBombe(ludzik.stawiamBombe);
            ludzik.stawiamBombe = false;
        }
    }

    this.czyLudzikUmarl = function(ludzik) {
        if (ludzik.umarlem) {
            this.usunLudzika(ludzik);
        }
    }
}


function Bomba(x, y, z) {
    this.pozycja = { x: x, y: y };
    this.zasieg = z || 1;
    this.zaplon = 3000;
    this.czaswybuchu = 1500;
    this.kolor = '#ff8800';
    this.kolorWybuchu = '#0088ff';
    this.sciezkaWybuchu = [];
    this.wybucha = 0;
    this.rysuj = function() {
        context.fillStyle = this.kolor;
        context.fillRect(this.pozycja.x*f_size, this.pozycja.y*f_size, f_size, f_size);
    };

    this.sciezkaBomby = function() {
        var sciezkaWLewo = [];
        for (var xz = this.pozycja.x - 1; xz >= this.pozycja.x - this.zasieg; xz--) {
             sciezkaWLewo.push({ x:xz, y:this.pozycja.y });
        }
        var sciezkaWPrawo = [];
        for (var xz = this.pozycja.x + 1; xz <= this.pozycja.x + this.zasieg; xz++) {
             sciezkaWPrawo.push({ x:xz, y:this.pozycja.y });
        }

        var sciezkaWGore = [];
        for (var yz = this.pozycja.y - 1; yz >= this.pozycja.y - this.zasieg; yz--) {
             sciezkaWGore.push({ x:this.pozycja.x, y:yz });
        }
        var sciezkaWDol = [];
        for (var yz = this.pozycja.y + 1; yz <= this.pozycja.y + this.zasieg; yz++) {
             sciezkaWDol.push({ x:this.pozycja.x, y:yz });
        }

        return {
            lewo: sciezkaWLewo,
            prawo: sciezkaWPrawo,
            gora: sciezkaWGore,
            dol: sciezkaWDol
        };
    }

    this.rysujWybuch = function(){        
        context.fillStyle = this.kolorWybuchu;
        var sciezkaBomby = this.sciezkaWybuchu;

        for (kierunek in sciezkaBomby) {
            for (pozycja in sciezkaBomby[kierunek]) {
                var cp = sciezkaBomby[kierunek][pozycja];
                context.fillRect(cp.x * f_size, cp.y * f_size, f_size, f_size);
            }
        }

        this.rysuj();
    };

    this.wybuchnij = function(sciezkaBomby) {
        this.sciezkaWybuchu = sciezkaBomby;        
        this.wybucha = 1;
    };
}

function MenagerBomb(grid) {
    this.bomby = [];

    this.dodajBombe = function(bomba) {
        this.bomby.push(bomba);
        grid.wezPole(bomba.pozycja).ustawBombe(bomba);
    };

    this.usunBombe = function() {
        var bomba = this.bomby.shift()
        grid.wezPole(bomba.pozycja).ustawPuste();
    };

    this.przerysujBomby = function() {
        var bombyDoUsuniecia = 0;

        for (var i in this.bomby) {
            //console.log([this.bomby[i].zaplon, i]);
            if (this.bomby[i].zaplon <= 0 && this.bomby[i].wybucha == 0) {
                var sciezkaBomby = this.bomby[i].sciezkaBomby();
                sciezkaBomby = this.palWszystko(sciezkaBomby);
                this.bomby[i].wybuchnij(sciezkaBomby);
                //bombyDoUsuniecia++;
            } if(this.bomby[i].czaswybuchu <= 0 ) {
                bombyDoUsuniecia++;
            } if(this.bomby[i].wybucha == 1) {
                this.bomby[i].rysujWybuch();
                this.bomby[i].czaswybuchu -= odswiezanie;
            }
            else {
                this.bomby[i].zaplon -= odswiezanie;
                this.bomby[i].rysuj();
            }
        }
        for (var i=0; i<bombyDoUsuniecia; i++) {
            this.usunBombe();
        }
        //console.log('---');
    };

    this.palWszystko = function(sciezkaBomby) {
        var wypalonaSciezka = {
            prawo: [],
            lewo: [],
            gora: [],
            dol: []
        };

        for (kierunek in sciezkaBomby) {
            for (pozycja in sciezkaBomby[kierunek]) {
                var cp = sciezkaBomby[kierunek][pozycja];
                var pole = grid.wezPole(cp);
                if (pole.jestPuste()) {
                    wypalonaSciezka[kierunek].push(cp);
                }
                else if (pole.jestBeton()) {
                    break;
                }
                else if (pole.jestMurek()) {
                    wypalonaSciezka[kierunek].push(cp);
                    pole.ustawPuste();
                    break;
                }
                else if (pole.jestLudzik()) {
                    wypalonaSciezka[kierunek].push(cp);
                    pole.zawartosc.umrzyj();
                    pole.ustawPuste();
                }
                else if (pole.jestBomba()) {
                    //wypalonaSciezka[kierunek].push(cp);
                    pole.zawartosc.zaplon = 0;
                    pole.ustawPuste();
                    break;
                }
            }
        }
        return wypalonaSciezka;
    };
}

function Ruch(ludzik) {
    this.ruchLudzika = function() {
        var podlozBombe = Math.floor(Math.random() * 8);
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
        if (podlozBombe == 1) {
            ludzik.podlozBombe();
        }

        return nowaPozycja;
    }

    this.sprawdzCzyLudzikMoze = function(nowaPozycja, pole, menagerLudzikow) {
        if (pole.jestPuste() && menagerLudzikow.ludzikMozeWejscNaPole(pole)) {
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
var menagerBomb = new MenagerBomb(grid);
var menagerLudzikow = new MenagerLudzikow(grid, menagerBomb);
var klasaRysujaca = new Rysuj();

klasaRysujaca.dodajKlase(grid, 'rysujGrid')
    .dodajKlase(menagerBomb, 'przerysujBomby')
    .dodajKlase(menagerLudzikow, 'przerysuj');


var i = 2;
var j = 1;
var z = 2;
var b1 = (new Bomba(10, 10 + i*j++, z));
b1.zaplon = 3000;
var b2 = (new Bomba(10, 10 + i*j++, z));
b2.zaplon = 5000;
var b3 = (new Bomba(10, 10 + i*j++, z));
b3.zaplon = 7000;
var b4 = (new Bomba(10, 10 + i*j++, z));
b4.zaplon = 7000;
var b5 = (new Bomba(10, 10 + i*j++, z));
b5.zaplon = 7000;

var bomby = [
    b1,
    b2,
    b3,
    b4,
    b5
];

for (var bomba in bomby) {
    menagerBomb.dodajBombe(bomby[bomba]);
}

var ludziki = [
    //(new Ludzik(12, 12)),
    //(new Ludzik(6, 6, '#ffff00')),
    //(new Ludzik(10, 10, '#ff00ff')),
    //(new Ludzik(6, 8, '#0f0f0f')),
    //(new Ludzik(8, 8, '#000000'))
];

for (var ludzik in ludziki) {
    menagerLudzikow.dodajLudzika(ludziki[ludzik]);
}

setInterval(function() {
    klasaRysujaca.przerysuj();
}, odswiezanie);

