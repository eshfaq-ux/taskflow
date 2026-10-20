import { Analytics } from '@vercel/analytics/react';
import Board from './components/Board';

function App() {
  return (
    <>
      <Board />
      <Analytics />
    </>
  );
}

export default App;
