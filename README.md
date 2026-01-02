# ♔ Chess Game - Multiplayer Edition

A fully-featured, browser-based chess game with complete rule implementation, light/dark mode support, and comprehensive game statistics tracking something something.

## 🎮 Features

### Complete Chess Rules Implementation
- ✅ All standard piece movements (Pawns, Rooks, Knights, Bishops, Queens, Kings)
- ✅ Special moves:
  - **Castling** (both kingside and queenside)
  - **En Passant** capture
  - **Pawn Promotion** (with piece selection dialog)
- ✅ Game state detection:
  - **Check** detection and warning
  - **Checkmate** detection
  - **Stalemate** detection
  - **50-move rule** for draws
- ✅ Move validation (prevents illegal moves and self-check)
- ✅ Visual indicators for valid moves and captures

### Multiplayer Support
- 🎯 Turn-based local multiplayer (two players on the same device)
- 🎯 Turn indicator showing current player
- 🎯 Move history tracking with algebraic notation
- 🎯 Captured pieces display for both players

### Light & Dark Mode
- 🌓 Toggle between light and dark themes
- 🌓 Theme preference saved to browser localStorage
- 🌓 Smooth theme transitions
- 🌓 Optimized colors for both modes

### Game Statistics Dashboard
- 📊 Track all game statistics:
  - Total games played
  - White wins
  - Black wins
  - Draws
  - Checkmates
  - Stalemates
- 📊 Recent game history (last 20 games)
- 📊 Game details: date, moves, result type
- 📊 Persistent storage using localStorage

### Modern UI/UX
- 🎨 Clean, responsive design
- 🎨 Visual feedback for piece selection
- 🎨 Highlighted valid moves and capture opportunities
- 🎨 Mobile-friendly layout
- 🎨 Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server installation required!

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AyshaAnsari/Chess.git
   cd Chess
   ```

2. **Open the game:**
   Simply open `index.html` in your web browser, or serve it using a local server:
   
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. **Play:**
   Navigate to `http://localhost:8000` in your browser.

## 🎯 How to Play

1. **Starting a Game:**
   - The board is set up automatically with white pieces at the bottom
   - White always moves first

2. **Making Moves:**
   - Click on a piece to select it
   - Valid moves will be highlighted (dots for empty squares, red border for captures)
   - Click on a highlighted square to move the piece
   - Click elsewhere to deselect

3. **Special Moves:**
   - **Castling**: Select your king and click two squares toward the rook
   - **En Passant**: Available when opponent moves pawn two squares
   - **Pawn Promotion**: A dialog appears when a pawn reaches the opposite end

4. **Game Controls:**
   - **🌓 Toggle Theme**: Switch between light and dark modes
   - **🎮 New Game**: Start a fresh game
   - **📊 Dashboard**: View game statistics and history

5. **Winning the Game:**
   - Checkmate your opponent's king to win
   - The game also ends in a draw (stalemate, 50-move rule)

## 📁 Project Structure

```
Chess/
├── index.html      # Main HTML structure
├── style.css       # Styling with light/dark mode
├── chess.js        # Chess game logic and rules
├── app.js          # UI and application logic
└── README.md       # This file
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables for theming
- **JavaScript (ES6+)**: Game logic and DOM manipulation
- **LocalStorage API**: Persistent data storage

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 🎨 Customization

The game uses CSS variables for theming. You can easily customize colors by modifying the `:root` and `[data-theme="dark"]` sections in `style.css`:

```css
:root {
    --bg-primary: #f0f0f0;
    --square-light: #f0d9b5;
    --square-dark: #b58863;
    /* ... more variables */
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is open source and available for educational purposes.

## 🎮 Game Rules Reference

For those new to chess, here are the basic rules:

- **Pawns**: Move forward one square (two on first move), capture diagonally
- **Rooks**: Move horizontally or vertically any number of squares
- **Knights**: Move in an L-shape (2+1 squares), can jump over pieces
- **Bishops**: Move diagonally any number of squares
- **Queen**: Combines rook and bishop movements
- **King**: Moves one square in any direction

The goal is to checkmate the opponent's king (put it under attack with no legal escape).

## 🌟 Acknowledgments

Created with ♥ for chess enthusiasts and developers learning game development!

---

**Enjoy playing chess!** ♔♕♖♗♘♙
