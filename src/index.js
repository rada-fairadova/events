import './styles/main.css';

class GameBoard {
  constructor(containerId, rows = 4, cols = 4) {
    this.container = document.getElementById(containerId);
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.createBoard();
  }

  createBoard() {
    this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      this.cells.push(cell);
      this.container.append(cell);
    }
  }

  getRandomCell() {
    const randomIndex = Math.floor(Math.random() * this.cells.length);
    return this.cells[randomIndex];
  }

  addGoblin(cell) {
    cell.classList.add('active');
    const goblin = document.createElement('img');
    goblin.className = 'goblin';
    goblin.src = './assets/gnome.png';
    goblin.alt = 'Goblin';
    cell.append(goblin);
  }

  removeGoblin(cell) {
    cell.classList.remove('active');
    const goblin = cell.querySelector('.goblin');
    if (goblin) {
      goblin.remove();
    }
  }

  addClickListener(callback) {
    this.container.addEventListener('click', callback);
  }
}

class Game {
  constructor() {
    this.board = new GameBoard('gameBoard');
    this.score = 0;
    this.misses = 0;
    this.isPlaying = false;
    this.currentGoblinCell = null;
    this.goblinTimer = null;
    
    this.scoreElement = document.getElementById('score');
    this.missesElement = document.getElementById('misses');
    this.startBtn = document.getElementById('startBtn');
    this.gameStatus = document.getElementById('gameStatus');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.board.addClickListener((event) => this.handleCellClick(event));
  }

  startGame() {
    if (this.isPlaying) return;
    
    this.resetGame();
    this.isPlaying = true;
    this.startBtn.disabled = true;
    this.gameStatus.textContent = 'Game started! Whack the goblins!';
    this.spawnGoblin();
  }

  resetGame() {
    this.score = 0;
    this.misses = 0;
    this.updateUI();
    
    if (this.currentGoblinCell) {
      this.board.removeGoblin(this.currentGoblinCell);
      this.currentGoblinCell = null;
    }
    
    if (this.goblinTimer) {
      clearTimeout(this.goblinTimer);
    }
  }

  spawnGoblin() {
    if (!this.isPlaying) return;

    if (this.currentGoblinCell) {
      this.board.removeGoblin(this.currentGoblinCell);
      this.handleMiss();
    }

    let newCell;
    do {
      newCell = this.board.getRandomCell();
    } while (newCell === this.currentGoblinCell && this.board.cells.length > 1);

    if (newCell === this.currentGoblinCell && this.board.cells.length > 1) {
      newCell = this.board.cells.find(cell => cell !== this.currentGoblinCell);
    }

    this.currentGoblinCell = newCell;
    this.board.addGoblin(this.currentGoblinCell);

    this.goblinTimer = setTimeout(() => {
      this.spawnGoblin();
    }, 1000);
  }

  handleCellClick(event) {
    if (!this.isPlaying) return;

    const cell = event.target.closest('.cell');
    if (!cell) return;

    if (cell === this.currentGoblinCell && cell.classList.contains('active')) {
      this.handleHit(cell);
    }
  }

  handleHit(cell) {
    cell.classList.add('whack');
    setTimeout(() => cell.classList.remove('whack'), 200);
    
    this.score++;
    this.updateUI();
    this.board.removeGoblin(cell);

    if (this.goblinTimer) {
      clearTimeout(this.goblinTimer);
    }
    this.currentGoblinCell = null;
    this.spawnGoblin();
  }

  handleMiss() {
    this.misses++;
    this.updateUI();

    if (this.misses >= 5) {
      this.endGame();
    }
  }

  updateUI() {
    this.scoreElement.textContent = this.score;
    this.missesElement.textContent = this.misses;
  }

  endGame() {
    this.isPlaying = false;
    this.startBtn.disabled = false;
    
    if (this.currentGoblinCell) {
      this.board.removeGoblin(this.currentGoblinCell);
    }
    
    if (this.goblinTimer) {
      clearTimeout(this.goblinTimer);
    }

    this.gameStatus.textContent = `Game Over! Final Score: ${this.score}`;
    this.gameStatus.classList.add('game-over');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});