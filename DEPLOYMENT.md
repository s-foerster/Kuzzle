# Guide de Déploiement sur GitHub Pages

## Configuration initiale

1. **Créer un dépôt GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hearts puzzle game"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/hearts_game.git
   git push -u origin main
   ```

2. **Activer GitHub Pages**
   - Allez dans les Settings de votre dépôt GitHub
   - Section "Pages" (dans la sidebar)
   - Source: GitHub Actions
   - Le workflow se déclenchera automatiquement

## Déploiement automatique

À chaque push sur `main`, le workflow GitHub Actions :
1. Build le projet avec `npm run build`
2. Déploie automatiquement sur GitHub Pages

Votre site sera disponible à : `https://VOTRE_USERNAME.github.io/hearts_game/`

## Déploiement manuel (alternative)

Si vous préférez déployer manuellement :

```bash
npm run build
npm run deploy
```

**Note** : Pour le déploiement manuel, vérifiez que `gh-pages` est installé et configurez le remote dans `vite.config.js`.

## Tester localement avant déploiement

```bash
npm run build
npm run preview
```

## Configuration du base path

Le `base` dans `vite.config.js` est configuré pour `/hearts_game/`. 
Si votre dépôt a un nom différent, modifiez cette valeur :

```js
export default defineConfig({
  base: '/VOTRE_NOM_DE_REPO/',
  // ...
})
```

## Troubleshooting

### Le site ne charge pas correctement
- Vérifiez que le `base` dans `vite.config.js` correspond au nom de votre dépôt
- Vérifiez que GitHub Pages est activé avec "GitHub Actions" comme source

### Les puzzles ne sont pas identiques pour tous
- C'est normal ! La génération est déterministe basée sur la date
- Même date = même puzzle pour tous les utilisateurs

### Erreur 404 sur les routes
- GitHub Pages ne supporte que les sites statiques
- Vérifiez que tous les liens sont relatifs au `base` path
