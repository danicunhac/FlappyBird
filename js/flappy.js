// Facilita a criação de elementos
function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

// Construtor das barreiras
function Barreira(reversa = false) {
  this.elemento = novoElemento("div", "barreira");

  const borda = novoElemento("div", "borda");
  const corpo = novoElemento("div", "corpo");
  // Se reversa = true: adiciona primeiro o corpo e depois a borda
  // Se reversa = false: adiciona primeiro a borda e depois o corpo
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = (altura) => {
    corpo.style.height = `${altura}px`;
  };
}

// Cria pares de barreiras (barreira superior e inferior)
function ParDeBarreiras(altura, abertura, x) {
  this.elemento = novoElemento("div", "par-de-barreiras");

  // Para gerar a barreira superior, inversa = true
  this.superior = new Barreira(true);
  // Para gerar a barreira inferior, inversa = false
  this.inferior = new Barreira(false);

  // Adicionando as barreiras à div "par-de-barreiras"
  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  // Varia a distância entre as barreiras de forma aleatória
  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturaInferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  // Separa o valor numérico da posição X da barreira da unidade "px"
  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);

  this.setX = (x) => (this.elemento.style.left = `${x}px`);

  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAbertura();
  this.setX(x);
}

// Cria as barreiras do jogo
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  // Instância dos pares de barreiras
  this.pares = [
    new ParDeBarreiras(altura, abertura, largura),
    new ParDeBarreiras(altura, abertura, largura + espaco),
    new ParDeBarreiras(altura, abertura, largura + espaco * 2),
    new ParDeBarreiras(altura, abertura, largura + espaco * 3),
  ];

  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      // quando o elemento sair da tela
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length);
        par.sortearAbertura();
      }

      const meio = largura / 2;
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;
      if (cruzouOMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  // Flag
  let voando = false;

  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  window.onkeydown = (e) => (voando = true);
  window.onkeyup = (e) => (voando = false);
  this.animar = () => {
    const novoY = this.getY() + (voando ? 8 : -5);
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };

  this.setY(alturaJogo / 2);
}

function Progresso() {
  this.elemento = novoElemento("span", "progresso");
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

// Checa a colisão
function estaoSobrepostos(elementoA, elementoB) {
  // Pássaro
  const a = elementoA.getBoundingClientRect();
  // Barreira
  const b = elementoB.getBoundingClientRect();

  const ladoDireitoA = a.left + a.width;
  const ladoDireitoB = b.left + b.width;

  const horizontal =
    // Cecha se o lado direito do passaro (a.left + a.width) está numa posição igual
    // ou maior ao lado esquerdo da barreira
    ladoDireitoA >= b.left &&
    // Cecha se o lado direito da barreira (b.left + b.width) está numa posição igual
    // ou maior ao lado esquerdo do pássaro
    ladoDireitoB >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach((ParDeBarreiras) => {
    if (!colidiu) {
      const superior = ParDeBarreiras.superior.elemento;
      const inferior = ParDeBarreiras.inferior.elemento;
      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

function FlappyBird() {
  let pontos = 0;

  const areaDoJogo = document.querySelector("[wm-flappy]");
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  );
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = () => {
    // loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 20);
  };
}

new FlappyBird().start();
