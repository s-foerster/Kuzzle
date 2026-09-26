import { findSolution } from './src/algorithms/lumizle/solver.js';
import { SeededRandom } from './src/utils/seededRandom.js';

const size = 10;
const rules = [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }];
const empty = Array.from({length:size}, () => Array(size).fill(0));
const rng = new SeededRandom('xx');
console.log('findSolution 10x10 3 rules from empty...');
const t = Date.now();
const sol = findSolution(empty, size, rules, rng);
console.log(`${Date.now()-t}ms`, sol ? 'OK' : 'NULL');
