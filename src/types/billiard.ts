export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isStriped: boolean;
  isPocketed: boolean;
  radius: number;
}

export interface GameState {
  balls: Ball[];
  isAiming: boolean;
  cueAngle: number;
  cuePower: number;
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  player1Type: 'solid' | 'striped' | null;
  player2Type: 'solid' | 'striped' | null;
  gameOver: boolean;
  winner: 1 | 2 | null;
  foul: boolean;
  message: string;
}

export interface Pocket {
  x: number;
  y: number;
  radius: number;
}
