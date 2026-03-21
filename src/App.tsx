import React, { useState } from 'react';
import './App.css';

// 谜题类型定义
type PuzzleType = 'sudoku' | 'lights-out';

// 数独谜题类型
interface SudokuPuzzle {
  type: 'sudoku';
  initial: number[][];
  solution: number[][];
}

// 熄灯游戏谜题类型
interface LightsOutPuzzle {
  type: 'lights-out';
  size: number;
  initial: boolean[][];
}

type Puzzle = SudokuPuzzle | LightsOutPuzzle;

// 示例谜题数据
const puzzles: Record<PuzzleType, Puzzle> = {
  sudoku: {
    type: 'sudoku',
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  },
  'lights-out': {
    type: 'lights-out',
    size: 5,
    initial: [
      [true, false, true, false, true],
      [false, true, false, true, false],
      [true, false, true, false, true],
      [false, true, false, true, false],
      [true, false, true, false, true]
    ]
  },

};

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>('sudoku');
  const [gameState, setGameState] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showLightsOutInstructions, setShowLightsOutInstructions] = useState(false);
  const [showLightsOutSolution, setShowLightsOutSolution] = useState(false);

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
      case 'lights-out':
        setGameState({
          lights: JSON.parse(JSON.stringify(puzzle.initial)),
          moves: 0
        });
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
    
    const handleCellClick = (row: number, col: number) => {
      setGameState({...gameState, selectedCell: {row, col}});
    };

    const handleNumberInput = (num: number) => {
      if (gameState.selectedCell) {
        const {row, col} = gameState.selectedCell;
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
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} onClick={() => handleNumberInput(num)}>
              {num}
            </button>
          ))}
          <button onClick={() => handleNumberInput(0)}>清除</button>
        </div>
      </div>
    );
  };

  // 熄灯游戏组件
  const LightsOutGame = () => {
    if (!gameState) return null;
    
    const toggleLight = (row: number, col: number) => {
      const newLights = [...gameState.lights];
      
      // 切换点击的灯和相邻的灯
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 1) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
              newLights[newRow][newCol] = !newLights[newRow][newCol];
            }
          }
        }
      }
      
      setGameState({
        ...gameState,
        lights: newLights,
        moves: gameState.moves + 1
      });
    };

    const showLightsOutInstructionsModal = () => {
      setShowLightsOutInstructions(true);
    };

    const showLightsOutSolutionModal = () => {
      setShowLightsOutSolution(true);
    };
    // @ts-ignore
    const isSolved = gameState.lights.flat().every(light => !light);

    return (
      <div className="lights-out-game">
        <div className="game-header">
          <h3>熄灯游戏</h3>
          <div className="game-controls">
            <button className="instruction-btn" onClick={showLightsOutInstructionsModal}>
              游戏说明
            </button>
            <button className="solution-btn" onClick={showLightsOutSolutionModal}>
              查看答案
            </button>
          </div>
        </div>
        <p>移动次数: {gameState.moves}</p>
        {isSolved && <p className="success">恭喜！你解决了这个谜题！</p>}
        <div className="lights-grid">
          {gameState.lights.map((row: boolean[], rowIndex: number) => (
            <div key={rowIndex} className="lights-row">
              {row.map((light: boolean, colIndex: number) => (
                <button
                  key={colIndex}
                  className={`light ${light ? 'on' : 'off'}`}
                  onClick={() => toggleLight(rowIndex, colIndex)}
                >
                  {light ? '💡' : '○'}
                </button>
              ))}
            </div>
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

  // 熄灯游戏说明模态框
  const LightsOutInstructionsModal = () => {
    if (!showLightsOutInstructions) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowLightsOutInstructions(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>熄灯游戏说明</h3>
            <button className="close-btn" onClick={() => setShowLightsOutInstructions(false)}>×</button>
          </div>
          <div className="modal-body">
            <h4>游戏规则：</h4>
            <ul>
              <li>熄灯游戏是一个5x5的网格，每个格子代表一盏灯</li>
              <li>初始状态下，部分灯是亮的（💡），部分灯是灭的（○）</li>
              <li>目标是通过最少的操作将所有灯都熄灭</li>
              <li>点击任意一盏灯会切换该灯及其上下左右相邻灯的状态</li>
            </ul>
            
            <h4>操作方法：</h4>
            <ul>
              <li>点击任意一盏灯来切换其状态</li>
              <li>每次点击会同时影响点击的灯和相邻的灯</li>
              <li>游戏会记录你的移动次数</li>
              <li>当所有灯都熄灭时，游戏胜利</li>
            </ul>
            
            <h4>解题技巧：</h4>
            <ul>
              <li>从角落开始，逐步向中间推进</li>
              <li>注意灯的相互影响关系</li>
              <li>尝试找出固定的点击模式</li>
              <li>有些灯需要被点击奇数次，有些需要偶数次</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // 熄灯游戏答案显示模态框
  const LightsOutSolutionModal = () => {
    if (!showLightsOutSolution) return null;
    const puzzle = puzzles['lights-out'] as LightsOutPuzzle;

    // 计算最优解（这里简化处理，显示初始状态和最终状态）
    const initialLights = puzzle.initial;
    const finalLights = initialLights.map(row => row.map(() => false));

    return (
      <div className="modal-overlay" onClick={() => setShowLightsOutSolution(false)}>
        <div className="modal-content solution-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>熄灯游戏解法</h3>
            <button className="close-btn" onClick={() => setShowLightsOutSolution(false)}>×</button>
          </div>
          <div className="modal-body">
            <p>以下是熄灯游戏的解法思路：</p>
            
            <h4>初始状态：</h4>
            <div className="lights-grid solution-lights">
              {initialLights.map((row: boolean[], rowIndex: number) => (
                <div key={rowIndex} className="lights-row">
                  {row.map((light: boolean, colIndex: number) => (
                    <div
                      key={colIndex}
                      className={`light-display ${light ? 'on' : 'off'}`}
                    >
                      {light ? '💡' : '○'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <h4>目标状态（所有灯熄灭）：</h4>
            <div className="lights-grid solution-lights">
              {finalLights.map((row: boolean[], rowIndex: number) => (
                <div key={rowIndex} className="lights-row">
                  {row.map((light: boolean, colIndex: number) => {
                    return (
                      <div
                        key={colIndex}
                        className={`light-display ${light ? 'on' : 'off'}`}
                      >
                        {light ? '💡' : '○'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <h4>解法提示：</h4>
            <ul>
              <li>从左上角开始，按照顺序点击需要操作的灯</li>
              <li>每个灯最多需要点击一次</li>
              <li>注意灯之间的连锁反应</li>
              <li>最优解通常需要15-20次点击</li>
            </ul>
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
      case 'lights-out':
        return (
          <>
            <LightsOutGame />
            <LightsOutInstructionsModal />
            <LightsOutSolutionModal />
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
        <h1>逻辑谜题小游戏</h1>
        <nav className="puzzle-nav">
          {Object.keys(puzzles).map(puzzleType => (
            <button
              key={puzzleType}
              className={currentPuzzle === puzzleType ? 'active' : ''}
              onClick={() => switchPuzzle(puzzleType as PuzzleType)}
            >
              {puzzleType === 'sudoku' && '数独'}
              {puzzleType === 'lights-out' && '熄灯游戏'}

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