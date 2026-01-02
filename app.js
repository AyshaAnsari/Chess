// Main Application Logic

class ChessApp {
    constructor() {
        this.game = new ChessGame();
        this.selectedSquare = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.stats = this.loadStats();
        this.currentGameId = Date.now();
        
        this.initializeUI();
        this.applyTheme();
        this.renderBoard();
        this.updateUI();
    }

    initializeUI() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // New game
        document.getElementById('newGame').addEventListener('click', () => {
            if (confirm('Start a new game? Current game will be saved.')) {
                this.saveCurrentGame();
                this.game.reset();
                this.selectedSquare = null;
                this.currentGameId = Date.now();
                this.renderBoard();
                this.updateUI();
            }
        });

        // Dashboard toggle
        document.getElementById('showDashboard').addEventListener('click', () => {
            this.showDashboard();
        });

        document.getElementById('backToGame').addEventListener('click', () => {
            this.hideDashboard();
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    applyTheme() {
        if (this.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.game.getPieceAt(row, col);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', (e) => {
                    this.handleSquareClick(row, col);
                });

                boardElement.appendChild(square);
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }

    handleSquareClick(row, col) {
        if (this.game.isCheckmate || this.game.isStalemate) {
            return;
        }

        const piece = this.game.getPieceAt(row, col);

        // If a square is already selected
        if (this.selectedSquare) {
            const { row: fromRow, col: fromCol } = this.selectedSquare;
            
            // Try to make a move
            const result = this.game.makeMove(fromRow, fromCol, row, col);
            
            if (result === true) {
                // Move successful
                this.selectedSquare = null;
                this.renderBoard();
                this.updateUI();
                this.updateMoveHistory();
                this.updateCapturedPieces();
                
                // Check if game ended
                if (this.game.isCheckmate || this.game.isStalemate || this.game.isDraw()) {
                    this.endGame();
                }
            } else if (result && result.promotion) {
                // Pawn promotion
                this.selectedSquare = null;
                this.showPromotionDialog(result.row, result.col);
            } else {
                // Invalid move, try selecting the clicked square
                if (piece && piece.color === this.game.currentPlayer) {
                    this.selectSquare(row, col);
                } else {
                    this.selectedSquare = null;
                    this.renderBoard();
                }
            }
        } else {
            // Select a piece
            if (piece && piece.color === this.game.currentPlayer) {
                this.selectSquare(row, col);
            }
        }
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        const validMoves = this.game.getValidMoves(row, col);
        
        this.renderBoard();
        
        // Highlight selected square
        const squares = document.querySelectorAll('.square');
        const selectedIndex = row * 8 + col;
        squares[selectedIndex].classList.add('selected');
        
        // Highlight valid moves
        validMoves.forEach(move => {
            const targetIndex = move.row * 8 + move.col;
            const targetSquare = squares[targetIndex];
            
            if (move.type === 'capture' || move.type === 'enPassant') {
                targetSquare.classList.add('valid-capture');
            } else {
                targetSquare.classList.add('valid-move');
            }
        });
    }

    showPromotionDialog(row, col) {
        const piece = this.game.getPieceAt(row, col);
        const modal = document.getElementById('promotionModal');
        const optionsContainer = document.getElementById('promotionOptions');
        
        optionsContainer.innerHTML = '';
        
        const pieceTypes = ['queen', 'rook', 'bishop', 'knight'];
        pieceTypes.forEach(type => {
            const option = document.createElement('div');
            option.className = 'promotion-piece';
            option.textContent = this.getPieceSymbol({ type, color: piece.color });
            option.addEventListener('click', () => {
                this.game.promotePawn(row, col, type);
                modal.style.display = 'none';
                this.renderBoard();
                this.updateUI();
                this.updateMoveHistory();
                
                if (this.game.isCheckmate || this.game.isStalemate || this.game.isDraw()) {
                    this.endGame();
                }
            });
            optionsContainer.appendChild(option);
        });
        
        modal.style.display = 'flex';
    }

    updateUI() {
        // Update turn indicator
        const turnIndicator = document.getElementById('turnIndicator');
        const capitalizedPlayer = this.game.currentPlayer.charAt(0).toUpperCase() + 
                                 this.game.currentPlayer.slice(1);
        turnIndicator.textContent = `${capitalizedPlayer}'s Turn`;
        
        // Update game status
        const statusElement = document.getElementById('gameStatus');
        if (this.game.isCheckmate) {
            const winner = this.game.getWinner();
            statusElement.textContent = `Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
            statusElement.className = 'game-status check-warning';
        } else if (this.game.isStalemate) {
            statusElement.textContent = 'Stalemate! Game is a draw.';
            statusElement.className = 'game-status';
        } else if (this.game.isDraw()) {
            statusElement.textContent = 'Draw! (50-move rule)';
            statusElement.className = 'game-status';
        } else if (this.game.isCheck) {
            statusElement.textContent = 'Check!';
            statusElement.className = 'game-status check-warning';
        } else {
            statusElement.textContent = '';
            statusElement.className = 'game-status';
        }
    }

    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        const moves = this.game.moveHistory;
        
        let html = '';
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1] || '';
            html += `<div class="move-entry">${moveNumber}. ${whiteMove} ${blackMove}</div>`;
        }
        
        moveList.innerHTML = html;
        moveList.scrollTop = moveList.scrollHeight;
    }

    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('capturedByWhite');
        const blackCaptured = document.getElementById('capturedByBlack');
        
        whiteCaptured.innerHTML = this.game.capturedPieces.white
            .map(p => `<span class="captured-piece">${this.getPieceSymbol(p)}</span>`)
            .join('');
        
        blackCaptured.innerHTML = this.game.capturedPieces.black
            .map(p => `<span class="captured-piece">${this.getPieceSymbol(p)}</span>`)
            .join('');
    }

    endGame() {
        let result;
        let resultType;
        
        if (this.game.isCheckmate) {
            const winner = this.game.getWinner();
            result = winner;
            resultType = 'checkmate';
            this.stats.totalGames++;
            this.stats.checkmates++;
            if (winner === 'white') {
                this.stats.whiteWins++;
            } else {
                this.stats.blackWins++;
            }
        } else if (this.game.isStalemate) {
            result = 'draw';
            resultType = 'stalemate';
            this.stats.totalGames++;
            this.stats.stalemates++;
            this.stats.draws++;
        } else if (this.game.isDraw()) {
            result = 'draw';
            resultType = 'draw';
            this.stats.totalGames++;
            this.stats.draws++;
        }
        
        // Save game to history
        const gameRecord = {
            id: this.currentGameId,
            date: new Date().toISOString(),
            result: result,
            resultType: resultType,
            moves: this.game.moveHistory.length,
            winner: result !== 'draw' ? result : null
        };
        
        this.stats.gameHistory.unshift(gameRecord);
        if (this.stats.gameHistory.length > 20) {
            this.stats.gameHistory = this.stats.gameHistory.slice(0, 20);
        }
        
        this.saveStats();
    }

    saveCurrentGame() {
        if (this.game.moveHistory.length > 0 && !this.game.isCheckmate && !this.game.isStalemate) {
            // Save incomplete game
            const gameRecord = {
                id: this.currentGameId,
                date: new Date().toISOString(),
                result: 'incomplete',
                resultType: 'incomplete',
                moves: this.game.moveHistory.length,
                winner: null
            };
            
            this.stats.gameHistory.unshift(gameRecord);
            if (this.stats.gameHistory.length > 20) {
                this.stats.gameHistory = this.stats.gameHistory.slice(0, 20);
            }
            
            this.saveStats();
        }
    }

    loadStats() {
        const saved = localStorage.getItem('chessStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalGames: 0,
            whiteWins: 0,
            blackWins: 0,
            draws: 0,
            checkmates: 0,
            stalemates: 0,
            gameHistory: []
        };
    }

    saveStats() {
        localStorage.setItem('chessStats', JSON.stringify(this.stats));
    }

    showDashboard() {
        document.getElementById('gameView').style.display = 'none';
        document.getElementById('dashboardView').style.display = 'block';
        this.updateDashboard();
    }

    hideDashboard() {
        document.getElementById('gameView').style.display = 'block';
        document.getElementById('dashboardView').style.display = 'none';
    }

    updateDashboard() {
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        document.getElementById('whiteWins').textContent = this.stats.whiteWins;
        document.getElementById('blackWins').textContent = this.stats.blackWins;
        document.getElementById('draws').textContent = this.stats.draws;
        document.getElementById('checkmates').textContent = this.stats.checkmates;
        document.getElementById('stalemates').textContent = this.stats.stalemates;
        
        const historyList = document.getElementById('gameHistoryList');
        if (this.stats.gameHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No games played yet</p>';
        } else {
            historyList.innerHTML = this.stats.gameHistory.map(game => {
                const date = new Date(game.date).toLocaleString();
                let resultText = '';
                let resultClass = '';
                
                if (game.result === 'white') {
                    resultText = '⬜ White Won';
                    resultClass = 'white-win';
                } else if (game.result === 'black') {
                    resultText = '⬛ Black Won';
                    resultClass = 'black-win';
                } else if (game.result === 'draw') {
                    resultText = '🤝 Draw';
                    resultClass = 'draw';
                } else {
                    resultText = '⏸️ Incomplete';
                    resultClass = 'incomplete';
                }
                
                return `
                    <div class="history-item">
                        <div>
                            <div><strong>${date}</strong></div>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">
                                ${game.moves} moves • ${game.resultType}
                            </div>
                        </div>
                        <div class="history-result ${resultClass}">${resultText}</div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new ChessApp();
});
