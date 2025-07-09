import './style.css';
import { Connect4Game } from './connect4.js';

class Connect4UI {
  constructor() {
    this.game = new Connect4Game();
    this.boardElement = document.getElementById('game-board');
    this.currentPlayerElement = document.getElementById('current-player-indicator');
    this.gameMessageElement = document.getElementById('game-message');
    this.resetButton = document.getElementById('reset-btn');
    
    this.initializeUI();
    this.attachEventListeners();
  }

  initializeUI() {
    this.createBoard();
    this.updateCurrentPlayer();
    this.gameMessageElement.textContent = '';
  }

  createBoard() {
    this.boardElement.innerHTML = '';
    
    for (let row = 0; row < this.game.ROWS; row++) {
      for (let col = 0; col < this.game.COLS; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Add hover indicator
        const hoverIndicator = document.createElement('div');
        hoverIndicator.className = `column-hover ${this.game.getCurrentPlayerClass()}`;
        cell.appendChild(hoverIndicator);
        
        cell.addEventListener('click', () => this.handleCellClick(col));
        cell.addEventListener('mouseenter', () => this.handleCellHover(col));
        
        this.boardElement.appendChild(cell);
      }
    }
  }

  handleCellClick(col) {
    if (!this.game.isValidMove(col)) {
      return;
    }

    const result = this.game.makeMove(col);
    if (result.success) {
      this.animatePieceDrop(result.row, col, this.game.getCurrentPlayerClass() === 'red' ? 'yellow' : 'red');
      
      setTimeout(() => {
        this.updateBoard();
        this.updateCurrentPlayer();
        
        if (result.gameOver) {
          this.handleGameOver(result.winner);
        }
      }, 300);
    }
  }

  handleCellHover(col) {
    if (this.game.isGameOver()) return;
    
    // Update hover indicators for the column
    const cells = this.boardElement.querySelectorAll(`[data-col="${col}"]`);
    cells.forEach(cell => {
      const hoverIndicator = cell.querySelector('.column-hover');
      if (hoverIndicator) {
        hoverIndicator.className = `column-hover ${this.game.getCurrentPlayerClass()}`;
      }
    });
  }

  animatePieceDrop(row, col, pieceClass) {
    const cellIndex = row * this.game.COLS + col;
    const cell = this.boardElement.children[cellIndex];
    
    const piece = document.createElement('div');
    piece.className = `piece ${pieceClass} dropping`;
    cell.appendChild(piece);
  }

  updateBoard() {
    const boardState = this.game.getBoardState();
    
    for (let row = 0; row < this.game.ROWS; row++) {
      for (let col = 0; col < this.game.COLS; col++) {
        const cellIndex = row * this.game.COLS + col;
        const cell = this.boardElement.children[cellIndex];
        
        // Remove existing pieces
        const existingPiece = cell.querySelector('.piece');
        if (existingPiece) {
          existingPiece.remove();
        }
        
        // Add new piece if cell is occupied
        const cellValue = boardState[row][col];
        if (cellValue !== this.game.EMPTY) {
          const piece = document.createElement('div');
          const pieceClass = cellValue === this.game.PLAYER_RED ? 'red' : 'yellow';
          piece.className = `piece ${pieceClass}`;
          cell.appendChild(piece);
        }
      }
    }
    
    // Highlight winning pieces
    if (this.game.isGameOver() && this.game.getWinner()) {
      this.highlightWinningPieces();
    }
  }

  highlightWinningPieces() {
    const winningCells = this.game.getWinningCells();
    winningCells.forEach(([row, col]) => {
      const cellIndex = row * this.game.COLS + col;
      const cell = this.boardElement.children[cellIndex];
      const piece = cell.querySelector('.piece');
      if (piece) {
        piece.classList.add('winning-piece');
      }
    });
  }

  updateCurrentPlayer() {
    const playerName = this.game.getCurrentPlayerName();
    const playerClass = this.game.getCurrentPlayerClass();
    
    this.currentPlayerElement.textContent = playerName;
    this.currentPlayerElement.className = `player-indicator player-${playerClass}`;
  }

  handleGameOver(winner) {
    if (winner) {
      const winnerName = this.game.getWinnerName();
      this.gameMessageElement.textContent = `🎉 ${winnerName} Wins! 🎉`;
      this.gameMessageElement.className = 'game-message winner';
    } else {
      this.gameMessageElement.textContent = "It's a Draw! 🤝";
      this.gameMessageElement.className = 'game-message draw';
    }
    
    // Disable board interaction
    this.boardElement.classList.add('disabled');
    this.boardElement.querySelectorAll('.cell').forEach(cell => {
      cell.classList.add('disabled');
    });
  }

  resetGame() {
    this.game.resetGame();
    this.boardElement.classList.remove('disabled');
    this.gameMessageElement.textContent = '';
    this.gameMessageElement.className = 'game-message';
    this.createBoard();
    this.updateCurrentPlayer();
  }

  attachEventListeners() {
    this.resetButton.addEventListener('click', () => this.resetGame());
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (this.game.isGameOver()) return;
      
      const key = e.key;
      if (key >= '1' && key <= '7') {
        const col = parseInt(key) - 1;
        this.handleCellClick(col);
      }
      
      if (key === 'r' || key === 'R') {
        this.resetGame();
      }
    });
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new Connect4UI();
});
