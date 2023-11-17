import { v4 as uuidv4 } from 'uuid';

export function generateSeed() {
    const seed = uuidv4(); // Génère une seed aléatoire
    return seed;
}