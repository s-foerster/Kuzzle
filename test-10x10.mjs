import { generateSolution } from './src/algorithms/lumizle/generator.js';
import { SeededRandom } from './src/utils/seededRandom.js';

const size = 10;

for (const ruleSet of [
  { name: 'just CONNECT_LIGHT', rules: [{ id: 'CONNECT_LIGHT' }] },
  { name: 'CONNECT_LIGHT + NO_2X2_DARK', rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }] },
  { name: 'CONNECT_LIGHT + CONNECT_DARK', rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }] },
  { name: 'CONNECT_LIGHT + CONNECT_DARK + NO_2X2_DARK', rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }] },
]) {
  const rng = new SeededRandom('h1_lumizle_logical');
  const t = Date.now();
  const sol = generateSolution(rng, size, ruleSet.rules, 0.40, 0.60, 5000);
  console.log(`${ruleSet.name}: ${sol ? 'OK' : 'NULL'} in ${Date.now()-t}ms`);
}

