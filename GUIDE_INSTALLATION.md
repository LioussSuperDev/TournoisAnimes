# Guide d'installation — Tournoi Endings Anime

Ce guide explique, étape par étape, comment installer et lancer ce site **en partant de zéro**, même si tu n'as jamais utilisé Git ou un terminal. Il est écrit pour la personne qui va héberger le site (son PC sert de "serveur" pendant le tournoi) — les 3 autres joueurs n'ont rien à installer, ils se connectent juste avec leur navigateur.

Compte environ 15-20 minutes la première fois. Toutes les instructions sont pour **Windows** (le plus courant) — sous Mac ou Linux les grandes étapes sont identiques, seuls les installeurs de Git/Node changent.

## Ce dont tu as besoin

- Un PC Windows qui restera **allumé et connecté au Wi-Fi/Ethernet** pendant toute la durée du tournoi.
- Les 3 autres joueurs connectés au **même réseau Wi-Fi** que ce PC (ex : tous chez la même personne, ou sur la même box).

---

## Étape 1 — Installer Git

Git est l'outil qui permet de télécharger le code du site depuis GitHub.

1. Va sur **https://git-scm.com/download/win** — le téléchargement démarre automatiquement (choisis la version 64-bit si on te demande).
2. Ouvre le fichier téléchargé (`Git-x.x.x-64-bit.exe`).
3. Clique sur **Next** à chaque écran en laissant les options par défaut, jusqu'à **Install**, puis **Finish**.
4. Vérifie que ça a fonctionné : ouvre le menu Démarrer, tape `Git Bash`, ouvre-le. Dans la fenêtre noire qui s'ouvre, tape :
   ```
   git --version
   ```
   puis appuie sur Entrée. Tu dois voir une ligne du type `git version 2.xx.x`. Si oui, c'est bon.

> Pour la suite du guide, **utilise cette fenêtre "Git Bash"** — c'est le terminal dans lequel tu vas taper toutes les commandes.

## Étape 2 — Installer Node.js

Node.js est ce qui fait tourner le site.

1. Va sur **https://nodejs.org/** — clique sur le bouton téléchargeant la version **LTS** (recommandée, pas "Current").
2. Ouvre le fichier téléchargé et installe-le en laissant toutes les options par défaut (Next, Next, Install, Finish).
3. **Ferme puis rouvre** Git Bash (important, sinon il ne connaît pas encore Node).
4. Vérifie l'installation :
   ```
   node --version
   npm --version
   ```
   Tu dois voir deux numéros de version (ex : `v22.x.x` et `10.x.x`). Si une des deux commandes affiche une erreur, redémarre le PC et réessaie.

## Étape 3 — Télécharger le code du site

Dans Git Bash, place-toi d'abord dans un dossier où tu veux ranger le projet (par exemple Documents) :

```
cd Documents
```

Puis télécharge le site :

```
git clone https://github.com/LioussSuperDev/TournoisAnimes.git
cd TournoisAnimes
```

Tu as maintenant un dossier `TournoisAnimes` avec tout le code dedans. Toutes les commandes suivantes se tapent **depuis ce dossier**, dans le même terminal (ne le ferme pas entre les étapes).

## Étape 4 — Installer les dépendances

Toujours dans Git Bash, dans le dossier `TournoisAnimes` :

```
npm install
```

Ça télécharge tout ce dont le site a besoin pour fonctionner. Ça prend 1 à 2 minutes et affiche beaucoup de texte — c'est normal. Attends que la commande se termine et que tu retrouves la ligne de saisie.

## Étape 5 — Configurer le site (une seule fois)

Le site a besoin d'une "clé secrète" pour sécuriser les connexions des joueurs. Copie le fichier d'exemple :

```
cp .env.example .env.local
```

Génère une vraie clé aléatoire avec cette commande (copie-la telle quelle, elle affiche directement le résultat) :

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ça affiche une longue suite de lettres/chiffres, par exemple :
`a3f1c9e2b6d84a0f...` (64 caractères).

Ouvre le fichier `.env.local` avec le Bloc-notes :

```
notepad .env.local
```

Remplace la valeur après `SESSION_SECRET=` par la suite générée juste avant (garde tout sur la même ligne, sans espaces ni guillemets). Enregistre (Ctrl+S) et ferme le Bloc-notes.

> ⚠️ Ce fichier `.env.local` est ta clé privée du site — ne le partage jamais, ne le mets jamais sur GitHub (il est déjà exclu automatiquement, pas d'inquiétude).

## Étape 6 — Lancer le site

Pour le vrai tournoi, construis d'abord une version optimisée puis démarre-la :

```
npm run build
npm start
```

`npm run build` prend une trentaine de secondes et ne se fait qu'une fois (ou après une mise à jour du code). `npm start` lance le site — le terminal affiche alors quelque chose comme :

```
> Tournoi Endings Anime prêt
> Local:   http://localhost:3000
> Réseau:  http://192.168.1.42:3000
```

**Garde cette fenêtre de terminal ouverte pendant tout le tournoi** — si tu la fermes, le site s'arrête pour tout le monde. Pour l'arrêter volontairement, clique dans la fenêtre et fais `Ctrl+C`.

### Le pare-feu Windows peut te demander une autorisation

La première fois, une fenêtre Windows peut apparaître ("Le Pare-feu Windows Defender a bloqué certaines fonctionnalités de node.exe"). Coche **Réseaux privés** et clique sur **Autoriser l'accès** — sinon les autres joueurs ne pourront pas se connecter.

## Étape 7 — Connecter les 4 joueurs

1. Assure-toi que **tous les appareils** (PC, téléphones...) des 4 joueurs sont connectés au **même Wi-Fi** que le PC qui héberge le site.
2. Chaque joueur ouvre un navigateur (Chrome, Safari, Edge...) et tape l'adresse **"Réseau"** affichée dans le terminal, par exemple `http://192.168.1.42:3000` (le chiffre exact change selon ton réseau — regarde bien ce qui s'affiche chez toi).
3. La première fois, chaque joueur clique sur son profil (Liouss / ShadyOFF / Siaka / Serkcan) et choisit un mot de passe (inscription). Les fois suivantes, il se reconnecte avec ce même mot de passe.
4. Le compte **Serkcan** reçoit automatiquement les droits administrateur.

---

## Relancer le site une prochaine fois

Pas besoin de tout refaire ! L'état du tournoi (duels, votes, pouvoirs...) est sauvegardé automatiquement sur le disque, même après avoir éteint le PC. La prochaine fois :

```
cd Documents/TournoisAnimes
npm start
```

(Si tu as modifié le code entre-temps, refais `npm run build` avant.)

## Questions fréquentes / problèmes

**"npm n'est pas reconnu" ou "git n'est pas reconnu"**
→ Node.js ou Git n'est pas bien installé, ou tu n'as pas redémarré le terminal après l'installation. Ferme complètement Git Bash, rouvre-le, réessaie. En dernier recours, redémarre le PC.

**Un joueur n'arrive pas à ouvrir le lien**
→ Vérifie qu'il est bien sur le même Wi-Fi que le PC hôte (pas en 4G/5G). Vérifie l'étape du pare-feu ci-dessus. Vérifie que l'adresse tapée correspond exactement à celle affichée dans le terminal au démarrage (elle peut changer si tu redémarres le PC hôte ou change de réseau).

**Le terminal affiche une erreur "port 3000 already in use" / "EADDRINUSE"**
→ Une autre instance du site tourne déjà (peut-être dans une autre fenêtre de terminal). Ferme les autres fenêtres, ou change le port dans `.env.local` (ligne `PORT=3000`, mets par exemple `3001`) et retape l'adresse avec le nouveau port.

**Je veux repartir d'un tournoi complètement vierge**
→ Utilise plutôt les **sauvegardes** dans le Panel Admin (bouton "Enregistrer l'état actuel" / "Charger") avant toute manipulation risquée. En dernier recours seulement : arrête le site (Ctrl+C) et supprime le dossier `data/` dans `TournoisAnimes` — attention, ça efface tout définitivement.

**Je veux récupérer une mise à jour du site plus tard**
→ Dans Git Bash, depuis le dossier `TournoisAnimes` :
```
git pull
npm install
npm run build
```
