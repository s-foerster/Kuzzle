# Jeu de Cœurs - Puzzle Quotidien ❤️

Un jeu de puzzle logique inspiré des puzzles japonais comme Hitori ou Futoshiki. Chaque jour, un nouveau puzzle est généré automatiquement pour tous les joueurs.

## 🎮 Comment jouer

### Objectif
Placez des cœurs sur la grille 10×10 en respectant ces règles :
- **2 cœurs** par ligne (ni plus, ni moins)
- **2 cœurs** par colonne (ni plus, ni moins)
- **2 cœurs** par zone colorée (ni plus, ni moins)
- **Aucun cœur adjacent** (même en diagonale)

### Contrôles
Cliquez sur une case pour faire défiler les états :
1. **Case vide** (départ)
2. **✕** (marquer qu'il n'y a PAS de cœur ici)
3. **❤️** (placer un cœur)
4. Retour à case vide (cycle)

### Indicateurs
- **Vert** : Contrainte satisfaite (exactement 2 cœurs)
- **Rouge** : Contrainte violée (plus de 2 cœurs)
- **Gris** : En cours (moins de 2 cœurs)

## 🚀 Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/hearts_game.git
cd hearts_game

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Le jeu sera accessible sur `http://localhost:5173/hearts_game/`

## 🏗️ Commandes disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
npm run deploy   # Déployer sur GitHub Pages
```

## 📅 Puzzle quotidien

- Un nouveau puzzle est généré **chaque jour** à minuit
- Tous les joueurs voient le **même puzzle** le même jour
- Votre progression est **sauvegardée automatiquement** dans votre navigateur
- Si vous changez de jour, le puzzle est réinitialisé automatiquement

## 🧩 Stratégies de résolution

### 1. Commencer par les contraintes fortes
- Si une ligne/colonne/zone a déjà 2 cœurs, marquez toutes les autres cases avec ✕
- Si une ligne/colonne/zone n'a que 2 emplacements possibles, placez les cœurs

### 2. Utiliser l'élimination
- Les cœurs ne peuvent pas être adjacents (8 directions)
- Quand vous placez un cœur, marquez toutes les cases adjacentes avec ✕

### 3. Analyser les zones
- Les zones petites ont moins de possibilités
- Commencez par les zones les plus contraintes

### 4. Technique avancée : propagation
- Placez un cœur hypothétique et voyez si ça crée une contradiction
- Si contradiction, vous savez que ce n'est pas la bonne position

## 🛠️ Technologie

- **Frontend** : Vue.js 3 (Composition API)
- **Build** : Vite
- **Hébergement** : GitHub Pages (gratuit !)
- **Algorithme** : Zone-first avec backtracking
- **Génération** : Déterministe basée sur la date

## 📊 Statistiques

Les puzzles générés sont :
- **100% de taux de succès** en génération
- **Temps de génération** : ~30-500ms
- **Unique** : chaque puzzle a une solution unique
- **Équilibré** : zones de taille raisonnable (4+ cellules)

## 🎯 Prochaines fonctionnalités

- [ ] Système d'indices (hint)
- [ ] Timer et statistiques personnelles
- [ ] Niveaux de difficulté (facile/moyen/difficile)
- [ ] Mode entrainement avec puzzles aléatoires
- [ ] Partage de scores sur les réseaux sociaux
- [ ] Archives des puzzles précédents
- [ ] Dark mode

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [DEVELOPER.md](DEVELOPER.md) pour plus de détails sur l'architecture et comment contribuer.

## 📝 Licence

Ce projet est libre et open source. Vous pouvez l'utiliser, le modifier et le redistribuer comme bon vous semble.

## 🙏 Remerciements

Inspiré par les puzzles logiques japonais et les jeux quotidiens comme Wordle.

---

**Bon puzzle ! 🧩❤️**
