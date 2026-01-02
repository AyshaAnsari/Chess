// Chess Game Logic with Complete Rules Implementation

class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.fiftyMoveCounter = 0;
        this.positionHistory = [];
        this.initializeBoard();
    }

    initializeBoard() {
        // Initialize 8x8 board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Setup pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        // Black pieces (top)
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = { type: pieceOrder[i], color: 'black' };
            this.board[1][i] = { type: 'pawn', color: 'black' };
        }

        // White pieces (bottom)
        for (let i = 0; i < 8; i++) {
            this.board[6][i] = { type: 'pawn', color: 'white' };
            this.board[7][i] = { type: pieceOrder[i], color: 'white' };
        }
    }

    getPieceAt(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
        return this.board[row][col];
    }

    setPieceAt(row, col, piece) {
        this.board[row][col] = piece;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col) {
        const piece = this.getPieceAt(row, col);
        if (!piece || piece.color !== this.currentPlayer) return [];

        let moves = [];

        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }

        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col));
    }

    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.getPieceAt(row, col);
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Forward move
        const newRow = row + direction;
        if (this.isValidPosition(newRow, col) && !this.getPieceAt(newRow, col)) {
            moves.push({ row: newRow, col, type: 'move' });

            // Double move from starting position
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.getPieceAt(doubleRow, col)) {
                    moves.push({ row: doubleRow, col, type: 'move', enPassantTarget: true });
                }
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const captureRow = row + direction;
            const captureCol = col + dc;
            if (this.isValidPosition(captureRow, captureCol)) {
                const target = this.getPieceAt(captureRow, captureCol);
                if (target && target.color !== piece.color) {
                    moves.push({ row: captureRow, col: captureCol, type: 'capture' });
                }

                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === captureRow && 
                    this.enPassantTarget.col === captureCol) {
                    moves.push({ row: captureRow, col: captureCol, type: 'enPassant' });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col) {
        return this.getLinearMoves(row, col, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }

    getBishopMoves(row, col) {
        return this.getLinearMoves(row, col, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getQueenMoves(row, col) {
        return this.getLinearMoves(row, col, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getLinearMoves(row, col, directions) {
        const moves = [];
        const piece = this.getPieceAt(row, col);

        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;

            while (this.isValidPosition(newRow, newCol)) {
                const target = this.getPieceAt(newRow, newCol);
                
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else {
                    if (target.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                    break;
                }

                newRow += dr;
                newCol += dc;
            }
        }

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const piece = this.getPieceAt(row, col);
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidPosition(newRow, newCol)) {
                const target = this.getPieceAt(newRow, newCol);
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        return moves;
    }

    getKingMoves(row, col) {
        const moves = [];
        const piece = this.getPieceAt(row, col);
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of kingMoves) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidPosition(newRow, newCol)) {
                const target = this.getPieceAt(newRow, newCol);
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        // Castling
        if (this.canCastle(row, col, 'kingSide')) {
            moves.push({ row, col: col + 2, type: 'castleKingSide' });
        }
        if (this.canCastle(row, col, 'queenSide')) {
            moves.push({ row, col: col - 2, type: 'castleQueenSide' });
        }

        return moves;
    }

    canCastle(row, col, side) {
        const piece = this.getPieceAt(row, col);
        if (!this.castlingRights[piece.color][side]) return false;
        if (this.isSquareUnderAttack(row, col, piece.color)) return false;

        if (side === 'kingSide') {
            // Check if squares between king and rook are empty and not under attack
            for (let c = col + 1; c < 7; c++) {
                if (this.getPieceAt(row, c)) return false;
                if (this.isSquareUnderAttack(row, c, piece.color)) return false;
            }
            const rook = this.getPieceAt(row, 7);
            return rook && rook.type === 'rook' && rook.color === piece.color;
        } else {
            // Queen side
            for (let c = col - 1; c > 0; c--) {
                if (this.getPieceAt(row, c)) return false;
                if (c > 1 && this.isSquareUnderAttack(row, c, piece.color)) return false;
            }
            const rook = this.getPieceAt(row, 0);
            return rook && rook.type === 'rook' && rook.color === piece.color;
        }
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        // Simulate the move
        const piece = this.getPieceAt(fromRow, fromCol);
        const targetPiece = this.getPieceAt(toRow, toCol);
        
        this.setPieceAt(toRow, toCol, piece);
        this.setPieceAt(fromRow, fromCol, null);

        const inCheck = this.isKingInCheck(piece.color);

        // Undo the move
        this.setPieceAt(fromRow, fromCol, piece);
        this.setPieceAt(toRow, toCol, targetPiece);

        return inCheck;
    }

    isKingInCheck(color) {
        // Find the king
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPieceAt(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }

        if (!kingPos) return false;

        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }

    isSquareUnderAttack(row, col, colorOfPieceOnSquare) {
        const opponentColor = colorOfPieceOnSquare === 'white' ? 'black' : 'white';

        // Check all opponent pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPieceAt(r, c);
                if (piece && piece.color === opponentColor) {
                    // Get raw moves without check validation
                    const moves = this.getRawMoves(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getRawMoves(row, col) {
        const piece = this.getPieceAt(row, col);
        if (!piece) return [];

        switch (piece.type) {
            case 'pawn':
                return this.getRawPawnAttacks(row, col);
            case 'rook':
                return this.getRookMoves(row, col);
            case 'knight':
                return this.getKnightMoves(row, col);
            case 'bishop':
                return this.getBishopMoves(row, col);
            case 'queen':
                return this.getQueenMoves(row, col);
            case 'king':
                return this.getRawKingMoves(row, col);
            default:
                return [];
        }
    }

    getRawPawnAttacks(row, col) {
        const moves = [];
        const piece = this.getPieceAt(row, col);
        const direction = piece.color === 'white' ? -1 : 1;

        // Only diagonal attacks for check detection
        for (const dc of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol, type: 'capture' });
            }
        }

        return moves;
    }

    getRawKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of kingMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol, type: 'move' });
            }
        }

        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAt(fromRow, fromCol);
        const targetPiece = this.getPieceAt(toRow, toCol);

        if (!piece || piece.color !== this.currentPlayer) return false;

        const validMoves = this.getValidMoves(fromRow, fromCol);
        const move = validMoves.find(m => m.row === toRow && m.col === toCol);

        if (!move) return false;

        // Reset fifty move counter on pawn move or capture
        if (piece.type === 'pawn' || targetPiece) {
            this.fiftyMoveCounter = 0;
        } else {
            this.fiftyMoveCounter++;
        }

        // Handle captures
        if (targetPiece) {
            this.capturedPieces[this.currentPlayer].push(targetPiece);
            
            // Update castling rights if a rook is captured
            if (targetPiece.type === 'rook') {
                if (toRow === 0) { // Black's back rank
                    if (toCol === 0) {
                        this.castlingRights.black.queenSide = false;
                    } else if (toCol === 7) {
                        this.castlingRights.black.kingSide = false;
                    }
                } else if (toRow === 7) { // White's back rank
                    if (toCol === 0) {
                        this.castlingRights.white.queenSide = false;
                    } else if (toCol === 7) {
                        this.castlingRights.white.kingSide = false;
                    }
                }
            }
        }

        // Reset en passant
        this.enPassantTarget = null;

        // Handle special moves
        if (move.type === 'enPassant') {
            const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            const capturedPawn = this.getPieceAt(capturedPawnRow, toCol);
            this.capturedPieces[this.currentPlayer].push(capturedPawn);
            this.setPieceAt(capturedPawnRow, toCol, null);
        } else if (move.type === 'castleKingSide') {
            const rook = this.getPieceAt(fromRow, 7);
            this.setPieceAt(fromRow, 5, rook);
            this.setPieceAt(fromRow, 7, null);
        } else if (move.type === 'castleQueenSide') {
            const rook = this.getPieceAt(fromRow, 0);
            this.setPieceAt(fromRow, 3, rook);
            this.setPieceAt(fromRow, 0, null);
        } else if (move.enPassantTarget) {
            this.enPassantTarget = { row: toRow, col: toCol };
        }

        // Make the move
        this.setPieceAt(toRow, toCol, piece);
        this.setPieceAt(fromRow, fromCol, null);

        // Update castling rights
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingSide = false;
            this.castlingRights[piece.color].queenSide = false;
        } else if (piece.type === 'rook') {
            if (fromCol === 0) {
                this.castlingRights[piece.color].queenSide = false;
            } else if (fromCol === 7) {
                this.castlingRights[piece.color].kingSide = false;
            }
        }

        // Record move
        const moveNotation = this.getMoveNotation(piece, fromRow, fromCol, toRow, toCol, targetPiece);
        this.moveHistory.push(moveNotation);

        // Check for pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            return { promotion: true, row: toRow, col: toCol };
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check game state
        this.updateGameState();

        return true;
    }

    promotePawn(row, col, pieceType) {
        const piece = this.getPieceAt(row, col);
        if (piece && piece.type === 'pawn') {
            this.setPieceAt(row, col, { type: pieceType, color: piece.color });
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.updateGameState();
        }
    }

    updateGameState() {
        this.isCheck = this.isKingInCheck(this.currentPlayer);
        
        // Check for checkmate or stalemate
        const hasValidMoves = this.hasAnyValidMoves(this.currentPlayer);
        
        if (!hasValidMoves) {
            if (this.isCheck) {
                this.isCheckmate = true;
            } else {
                this.isStalemate = true;
            }
        }
    }

    hasAnyValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPieceAt(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const pieceSymbol = piece.type === 'pawn' ? '' : piece.type[0].toUpperCase();
        const captureSymbol = captured ? 'x' : '';
        const fromSquare = files[fromCol] + (8 - fromRow);
        const toSquare = files[toCol] + (8 - toRow);
        
        return `${pieceSymbol}${fromSquare}${captureSymbol}${toSquare}`;
    }

    getWinner() {
        if (this.isCheckmate) {
            return this.currentPlayer === 'white' ? 'black' : 'white';
        }
        return null;
    }

    isDraw() {
        return this.isStalemate || this.fiftyMoveCounter >= 50;
    }

    reset() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.fiftyMoveCounter = 0;
        this.initializeBoard();
    }
}
