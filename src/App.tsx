import React, { useState } from 'react';
import './App.css';

// 谜题类型定义
type PuzzleType = 'sudoku' | 'memory' | 'math-puzzle' | 'look-and-say';

// 数独谜题类型
interface SudokuPuzzle {
  type: 'sudoku';
  initial: number[][];
  solution: number[][];
}

// 记忆翻牌游戏谜题类型
interface MemoryPuzzle {
  type: 'memory';
  size: number;
  cards: string[];
}

// 数学谜题类型
interface MathPuzzle {
  type: 'math-puzzle';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// 外观数列谜题类型
interface LookAndSayPuzzle {
  type: 'look-and-say';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// emoji图标映射表
const emojiIcons = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
  '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'
];

type Puzzle = SudokuPuzzle | MemoryPuzzle | MathPuzzle | LookAndSayPuzzle;

// 示例谜题数据
const puzzles: Record<PuzzleType, Puzzle> = {
  'math-puzzle': {
    type: 'math-puzzle',
    question: '5只猫5分钟抓5只老鼠，照这个速度，100分钟抓100只老鼠，需要几只猫？',
    options: ['1只猫', '5只猫', '20只猫', '100只猫'],
    correctAnswer: 1,
    explanation: '解题思路：\n5只猫5分钟抓5只老鼠 → 1只猫5分钟抓1只老鼠\n1只猫100分钟抓20只老鼠\n要抓100只老鼠需要100÷20=5只猫\n所以答案是5只猫'
  },
  sudoku: {
    type: 'sudoku',
    initial: [
      [1, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0],
      [0, 0, 0, 4, 0, 0],
      [0, 0, 0, 0, 5, 0],
      [0, 0, 0, 0, 0, 6]
    ],
    solution: [
      [1, 4, 2, 5, 3, 6],
      [3, 2, 6, 1, 4, 5],
      [4, 6, 3, 2, 5, 1],
      [2, 1, 5, 4, 6, 3],
      [5, 3, 1, 6, 2, 4],
      [6, 5, 4, 3, 1, 2]
    ]
  },
  'look-and-say': {
    type: 'look-and-say',
    question: '找规律填数：1, 11, 21, 1211, 111221, ?',
    options: ['312211', '13112221', '111312211', '31131211131221'],
    correctAnswer: 0,
    explanation: '解题思路：\n这是一个著名的外观数列（Look-and-say sequence）\n\n规律分析：\n1 → "一个1" → 11\n11 → "两个1" → 21\n21 → "一个2，一个1" → 1211\n1211 → "一个1，一个2，两个1" → 111221\n111221 → "三个1，两个2，一个1" → 312211\n\n所以下一个数字是312211'
  },
  memory: {
    type: 'memory',
    size: 4,
    cards: emojiIcons.slice(0, 8).flatMap(icon => [icon, icon])
  }
};

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>('math-puzzle');
  const [gameState, setGameState] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showMemoryInstructions, setShowMemoryInstructions] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showMathExplanation, setShowMathExplanation] = useState(false);
  const [showLookAndSayExplanation, setShowLookAndSayExplanation] = useState(false);

  // 初始化游戏状态
  const initializeGame = (puzzleType: PuzzleType) => {
    const puzzle = puzzles[puzzleType];
    
    switch (puzzle.type) {
      case 'sudoku':
        setGameState({
          grid: JSON.parse(JSON.stringify(puzzle.initial)),
          selectedCell: null
        });
        break;
      case 'memory':
        // 洗牌并创建初始状态
        const shuffledCards = [...(puzzle as MemoryPuzzle).cards].sort(() => Math.random() - 0.5);
        setGameState({
          cards: shuffledCards.map((value, index) => ({
            id: index,
            value: value,
            isFlipped: false,
            isMatched: false
          })),
          flippedCards: [],
          moves: 0,
          matches: 0
        });
        break;
      case 'math-puzzle':
        setGameState({
          selectedAnswer: null,
          isAnswered: false
        });
        setUserAnswer(null);
        break;
      case 'look-and-say':
        setGameState({
          selectedAnswer: null,
          isAnswered: false
        });
        setUserAnswer(null);
        break;
      case 'look-and-say':
        setGameState({
          selectedAnswer: null,
          isAnswered: false
        });
        setUserAnswer(null);
        break;
    }
  };

  // 切换谜题
  const switchPuzzle = (puzzleType: PuzzleType) => {
    setCurrentPuzzle(puzzleType);
    initializeGame(puzzleType);
  };

  // 数独组件
  const SudokuGame = () => {
    if (!gameState) return null;
    
    // 检查是否为初始数字（不能修改的）
    const isInitialCell = (row: number, col: number) => {
      const puzzle = puzzles['sudoku'] as SudokuPuzzle;
      return puzzle.initial[row][col] !== 0;
    };
    
    const handleCellClick = (row: number, col: number) => {
      // 如果是初始数字，不能选中
      if (isInitialCell(row, col)) {
        return;
      }
      setGameState({...gameState, selectedCell: {row, col}});
    };

    const handleNumberInput = (num: number) => {
      if (gameState.selectedCell) {
        const {row, col} = gameState.selectedCell;
        // 如果是初始数字，不能修改
        if (isInitialCell(row, col)) {
          return;
        }
        const newGrid = [...gameState.grid];
        newGrid[row][col] = num;
        setGameState({...gameState, grid: newGrid});
      }
    };

    const showSolutionGrid = () => {
      setShowSolution(true);
    };

    const showGameInstructions = () => {
      setShowInstructions(true);
    };

    return (
      <div className="sudoku-game">
        <div className="game-header">
          <h3>数独</h3>
          <div className="game-controls">
            <button className="instruction-btn" onClick={showGameInstructions}>
              游戏说明
            </button>
            <button className="solution-btn" onClick={showSolutionGrid}>
              查看答案
            </button>
          </div>
        </div>
        <div className="sudoku-grid">
          {gameState.grid.map((row: number[], rowIndex: number) => (
            <div key={rowIndex} className="sudoku-row">
              {row.map((cell: number, colIndex: number) => (
                <div
                  key={colIndex}
                  className={`sudoku-cell ${
                    gameState.selectedCell?.row === rowIndex && 
                    gameState.selectedCell?.col === colIndex ? 'selected' : ''
                  } ${
                    isInitialCell(rowIndex, colIndex) ? 'initial' : ''
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="number-pad">
          {[1,2,3,4,5,6].map(num => (
            <button key={num} onClick={() => handleNumberInput(num)}>
              {num}
            </button>
          ))}
          <button onClick={() => handleNumberInput(0)}>清除</button>
        </div>
      </div>
    );
  };

  // 记忆翻牌游戏组件
  const MemoryGame = () => {
    if (!gameState) return null;
    
    const handleCardClick = (cardId: number) => {
      const card = gameState.cards.find((c: any) => c.id === cardId);
      
      // 如果卡片已经匹配或正在翻转，或者已经有2张翻转的卡片，则忽略点击
      if (card.isMatched || card.isFlipped || gameState.flippedCards.length >= 2) {
        return;
      }
      
      const newCards = [...gameState.cards];
      const cardIndex = newCards.findIndex((c: any) => c.id === cardId);
      newCards[cardIndex] = {...newCards[cardIndex], isFlipped: true};
      
      const newFlippedCards = [...gameState.flippedCards, cardId];
      
      setGameState({
        ...gameState,
        cards: newCards,
        flippedCards: newFlippedCards,
        moves: gameState.moves + 1
      });
      
      // 检查是否匹配
      if (newFlippedCards.length === 2) {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = newCards.find((c: any) => c.id === firstId);
        const secondCard = newCards.find((c: any) => c.id === secondId);
        
        if (firstCard.value === secondCard.value) {
          // 匹配成功
          setTimeout(() => {
            const updatedCards = newCards.map((c: any) => 
              c.id === firstId || c.id === secondId 
                ? {...c, isMatched: true, isFlipped: true}
                : c
            );
            
            setGameState({
              ...gameState,
              cards: updatedCards,
              flippedCards: [],
              matches: gameState.matches + 1
            });
          }, 500);
        } else {
          // 不匹配，翻回去
          setTimeout(() => {
            const updatedCards = newCards.map((c: any) => 
              c.id === firstId || c.id === secondId 
                ? {...c, isFlipped: false}
                : c
            );
            
            setGameState({
              ...gameState,
              cards: updatedCards,
              flippedCards: []
            });
          }, 1000);
        }
      }
    };

    const showMemoryInstructionsModal = () => {
      setShowMemoryInstructions(true);
    };

    const isGameComplete = gameState.matches === gameState.cards.length / 2;

    return (
      <div className="memory-game">
        <div className="game-header">
          <h3>记忆翻牌游戏</h3>
          <div className="game-controls">
            <button className="instruction-btn" onClick={showMemoryInstructionsModal}>
              游戏说明
            </button>
          </div>
        </div>
        <p>移动次数: {gameState.moves} | 已匹配: {gameState.matches} / {gameState.cards.length / 2}</p>
        {isGameComplete && <p className="success">恭喜！你完成了记忆翻牌游戏！</p>}
        <div className="memory-grid">
          {gameState.cards.map((card: any) => (
            <button
              key={card.id}
              className={`memory-card ${
                card.isFlipped || card.isMatched ? 'flipped' : ''
              } ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
            >
              {card.isFlipped || card.isMatched ? card.value : '❓'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 数独游戏说明模态框
  const InstructionsModal = () => {
    if (!showInstructions) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>数独游戏说明</h3>
            <button className="close-btn" onClick={() => setShowInstructions(false)}>×</button>
          </div>
          <div className="modal-body">
            <h4>游戏规则：</h4>
            <ul>
              <li>数独是一个9x9的网格，被分成9个3x3的小宫格</li>
              <li>目标是用数字1-9填满整个网格</li>
              <li>每行、每列和每个3x3小宫格都必须包含数字1-9，且不能重复</li>
              <li>游戏开始时，部分格子已经填有数字，这些是提示数字</li>
            </ul>
            
            <h4>操作方法：</h4>
            <ul>
              <li>点击空白格子选中它</li>
              <li>点击下方的数字按钮填入选中的格子</li>
              <li>点击"清除"按钮可以清空选中的格子</li>
              <li>点击"查看答案"可以查看完整解法</li>
            </ul>
            
            <h4>解题技巧：</h4>
            <ul>
              <li>先找出每行、每列、每个宫格中唯一可能的数字</li>
              <li>使用排除法，分析哪些数字不能出现在特定位置</li>
              <li>注意数字之间的相互制约关系</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // 数独答案显示模态框
  const SolutionModal = () => {
    if (!showSolution) return null;
    const puzzle = puzzles.sudoku as SudokuPuzzle;

    return (
      <div className="modal-overlay" onClick={() => setShowSolution(false)}>
        <div className="modal-content solution-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>数独答案</h3>
            <button className="close-btn" onClick={() => setShowSolution(false)}>×</button>
          </div>
          <div className="modal-body">
            <p>以下是当前数独谜题的完整解法：</p>
            <div className="solution-grid">
              {puzzle.solution.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="solution-row">
                  {row.map((cell: number, colIndex: number) => (
                    <div
                      key={colIndex}
                      className={`solution-cell ${
                        puzzle.initial[rowIndex][colIndex] !== 0 ? 'given' : 'solved'
                      }`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="solution-legend">
              <div className="legend-item">
                <div className="legend-color given"></div>
                <span>初始数字</span>
              </div>
              <div className="legend-item">
                <div className="legend-color solved"></div>
                <span>需要填写的数字</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 记忆翻牌游戏说明模态框
  const MemoryInstructionsModal = () => {
    if (!showMemoryInstructions) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowMemoryInstructions(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>记忆翻牌游戏说明</h3>
            <button className="close-btn" onClick={() => setShowMemoryInstructions(false)}>×</button>
          </div>
          <div className="modal-body">
            <h4>游戏规则：</h4>
            <ul>
              <li>记忆翻牌游戏是一个4x4的网格，包含16张卡片（8对相同的图标）</li>
              <li>所有卡片开始时都是背面朝上（显示为"❓"）</li>
              <li>目标是通过最少的移动次数找到所有匹配的卡片对</li>
              <li>每次可以翻开两张卡片，如果图标相同则保持翻开状态，否则翻回背面</li>
            </ul>
            
            <h4>操作方法：</h4>
            <ul>
              <li>点击任意一张卡片将其翻开</li>
              <li>每次只能翻开两张卡片</li>
              <li>如果两张卡片图标相同，它们会保持翻开状态</li>
              <li>如果图标不同，卡片会在短暂显示后自动翻回</li>
              <li>游戏会记录你的移动次数和已匹配的对数</li>
            </ul>
            
            <h4>记忆技巧：</h4>
            <ul>
              <li>尝试记住每张卡片的位置和图标</li>
              <li>从角落开始，逐步建立记忆模式</li>
              <li>注意卡片的相对位置关系</li>
              <li>最佳策略是系统性地翻开卡片，而不是随机点击</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // 数学谜题组件
  const MathPuzzleGame = () => {
    if (!gameState) return null;
    const puzzle = puzzles['math-puzzle'] as MathPuzzle;
    
    const handleAnswerSelect = (answerIndex: number) => {
      setUserAnswer(answerIndex);
      setGameState({
        ...gameState,
        selectedAnswer: answerIndex,
        isAnswered: true
      });
    };

    const showMathExplanationModal = () => {
      setShowMathExplanation(true);
    };

    const isCorrect = userAnswer === puzzle.correctAnswer;

    return (
      <div className="math-puzzle-game">
        <div className="game-header">
          <h3>数学逻辑谜题</h3>
          <div className="game-controls">
            <button className="instruction-btn" onClick={showMathExplanationModal}>
              答案
            </button>
          </div>
        </div>
        
        <div className="math-question">
          <h4>题目：</h4>
          <p>{puzzle.question}</p>
        </div>
        
        <div className="math-options">
          <h4>选项：</h4>
          {puzzle.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                userAnswer === index ? 'selected' : ''
              } ${
                gameState.isAnswered && index === puzzle.correctAnswer ? 'correct' : ''
              } ${
                gameState.isAnswered && userAnswer === index && userAnswer !== puzzle.correctAnswer ? 'incorrect' : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={gameState.isAnswered}
            >
              {option}
            </button>
          ))}
        </div>
        
        {gameState.isAnswered && (
          <div className="math-result">
            {isCorrect ? (
              <p className="success">🎉 恭喜！答案正确！</p>
            ) : (
              <p className="error">❌ 答案不正确，请查看解题思路或答案</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // 数学谜题解题思路模态框
  const MathExplanationModal = () => {
    if (!showMathExplanation) return null;
    const puzzle = puzzles['math-puzzle'] as MathPuzzle;

    return (
      <div className="modal-overlay" onClick={() => setShowMathExplanation(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>数学谜题解题思路</h3>
            <button className="close-btn" onClick={() => setShowMathExplanation(false)}>×</button>
          </div>
          <div className="modal-body">
            <h4>题目：</h4>
            <p>{puzzle.question}</p>
            
            <h4>解题思路：</h4>
            <pre className="math-explanation">{puzzle.explanation}</pre>
            
            <h4>正确答案：</h4>
            <p className="correct-answer">{puzzle.options[puzzle.correctAnswer]}</p>
          </div>
        </div>
      </div>
    );
  };

  // 外观数列谜题组件
  const LookAndSayGame = () => {
    if (!gameState) return null;
    const puzzle = puzzles['look-and-say'] as LookAndSayPuzzle;
    
    const handleAnswerSelect = (answerIndex: number) => {
      setUserAnswer(answerIndex);
      setGameState({
        ...gameState,
        selectedAnswer: answerIndex,
        isAnswered: true
      });
    };

    const showLookAndSayExplanationModal = () => {
      setShowLookAndSayExplanation(true);
    };

    const isCorrect = userAnswer === puzzle.correctAnswer;

    return (
      <div className="math-puzzle-game">
        <div className="game-header">
          <h3>外观数列谜题</h3>
          <div className="game-controls">
            <button className="instruction-btn" onClick={showLookAndSayExplanationModal}>
              答案
            </button>
          </div>
        </div>
        
        <div className="math-question">
          <h4>题目：</h4>
          <p>{puzzle.question}</p>
        </div>
        
        <div className="math-options">
          <h4>选项：</h4>
          {puzzle.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                userAnswer === index ? 'selected' : ''
              } ${
                gameState.isAnswered && index === puzzle.correctAnswer ? 'correct' : ''
              } ${
                gameState.isAnswered && userAnswer === index && userAnswer !== puzzle.correctAnswer ? 'incorrect' : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={gameState.isAnswered}
            >
              {option}
            </button>
          ))}
        </div>
        
        {gameState.isAnswered && (
          <div className="math-result">
            {isCorrect ? (
              <p className="success">🎉 恭喜！答案正确！</p>
            ) : (
              <p className="error">❌ 答案不正确，请查看解题思路或答案</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // 外观数列谜题解题思路模态框
  const LookAndSayExplanationModal = () => {
    if (!showLookAndSayExplanation) return null;
    const puzzle = puzzles['look-and-say'] as LookAndSayPuzzle;

    return (
      <div className="modal-overlay" onClick={() => setShowLookAndSayExplanation(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>外观数列谜题解题思路</h3>
            <button className="close-btn" onClick={() => setShowLookAndSayExplanation(false)}>×</button>
          </div>
          <div className="modal-body">
            <h4>题目：</h4>
            <p>{puzzle.question}</p>
            
            <h4>解题思路：</h4>
            <pre className="math-explanation">{puzzle.explanation}</pre>
            
            <h4>正确答案：</h4>
            <p className="correct-answer">{puzzle.options[puzzle.correctAnswer]}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染当前谜题
  const renderCurrentPuzzle = () => {
    switch (currentPuzzle) {
      case 'sudoku':
        return (
          <>
            <SudokuGame />
            <InstructionsModal />
            <SolutionModal />
          </>
        );
      case 'memory':
        return (
          <>
            <MemoryGame />
            <MemoryInstructionsModal />
          </>
        );
      case 'math-puzzle':
        return (
          <>
            <MathPuzzleGame />
            <MathExplanationModal />
          </>
        );
      case 'look-and-say':
        return (
          <>
            <LookAndSayGame />
            <LookAndSayExplanationModal />
          </>
        );

      default:
        return null;
    }
  };

  // 初始化第一个游戏
  React.useEffect(() => {
    initializeGame('sudoku');
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>逻辑谜题小游戏 - 孙熠旻</h1>
        <nav className="puzzle-nav">
          {Object.keys(puzzles).map(puzzleType => (
            <button
              key={puzzleType}
              className={currentPuzzle === puzzleType ? 'active' : ''}
              onClick={() => switchPuzzle(puzzleType as PuzzleType)}
            >
              {puzzleType === 'sudoku' && '数独'}
              {puzzleType === 'memory' && '记忆翻牌'}
              {puzzleType === 'math-puzzle' && '数学谜题'}
              {puzzleType === 'look-and-say' && '外观数列'}
            </button>
          ))}
        </nav>
      </header>
      
      <main className="game-container">
        {renderCurrentPuzzle()}
      </main>
    </div>
  );
}

export default App;