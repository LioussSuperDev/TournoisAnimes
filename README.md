# Tournoi Endings Anime

Site privé de vote en temps réel pour un tournoi d'endings d'anime à 4 joueurs (Liouss, ShadyOFF, Siaka, Serkcan — administrateur).

> 👉 Pas à l'aise avec Git/Node/terminal ? Suis **[GUIDE_INSTALLATION.md](./GUIDE_INSTALLATION.md)**, qui explique tout depuis zéro. Ce qui suit est le résumé technique.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Serveur custom (`server.ts`) qui attache Socket.io à Next.js pour la synchronisation temps réel
- SQLite (module natif `node:sqlite`, aucune dépendance compilée) via Drizzle ORM
- Sessions par cookie chiffré (`iron-session`)

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis change SESSION_SECRET pour une vraie valeur aléatoire (32+ caractères)
npm run dev                  # développement (LAN, avec rechargement à chaud)
```

Pour le tournoi en conditions réelles (LAN), build puis démarre en production :

```bash
npm run build
npm start
```

Le terminal affiche l'URL locale et l'URL réseau (`http://<IP-de-ta-machine>:3000`) — c'est cette dernière que les 3 autres joueurs utilisent, connectés au même réseau (WiFi/Ethernet) que la machine qui héberge le site.

## Comptes

Pas de mot de passe : sur `/login`, chaque joueur clique sur son profil parmi les 4 noms autorisés (Liouss, ShadyOFF, Siaka, Serkcan) — le compte est créé automatiquement au premier clic, réutilisé ensuite. Le compte `Serkcan` reçoit automatiquement le rôle admin. Un profil déjà connecté (socket actif) devient grisé et indisponible pour les autres tant que son occupant ne s'est pas déconnecté ; ce grisage est synchronisé en temps réel. Seuls ces 4 noms sont sélectionnables — personne d'autre ne peut s'inscrire même en tombant sur l'URL du site.

## Données

Tout est stocké dans `data/tournoi.db` (SQLite, créé automatiquement au premier lancement, jamais committé). Un redémarrage du serveur ou un rechargement de page ne fait perdre aucun état de tournoi (duels, votes, pouvoirs, historique).

Pour repartir d'un tournoi vierge, arrête le serveur et supprime le dossier `data/`.

## Sons de la roue

Les fichiers audio ne sont pas fournis (voir `public/audio/README.md`) — ajoute `wheel-spin.mp3` et `poulain-dor.mp3` dans `public/audio/` pour les activer ; le site fonctionne normalement sans eux.

## Structure

```
server.ts / src/server/main.ts   bootstrap Next.js + Socket.io, IP réseau au démarrage
src/lib/db/                      schéma Drizzle, client SQLite, requêtes par domaine
src/lib/auth/                    session, garde-fous d'accès (page + API)
src/lib/realtime/                présence en ligne, notifications socket
src/lib/powers/                  registre des pouvoirs (modulaire — voir ci-dessous)
src/lib/wheel/                   construction des segments de la roue + tirage aléatoire serveur
src/lib/duel/                    transitions de phase, logique de spin/relance
src/app/(admin|tournoi|login)/   pages
src/components/                  UI (admin/, tournoi/, wheel/, auth/)
```

Toute mutation sensible (vote, pouvoir, phase, résultat de roue) passe par une route API qui vérifie la session et la phase du duel côté serveur avant d'écrire en base — un joueur ne peut pas modifier son propre nombre de pouvoirs ou forcer un résultat depuis le navigateur.

## Ajouter un nouveau pouvoir

Le registre `src/lib/powers/registry.ts` déclare chaque pouvoir (type, quantité par défaut, fenêtre d'usage pré/post-roue, type de cible). La construction des segments de la roue (`src/lib/wheel/segments.ts`) et les routes API sous `src/app/api/duels/[id]/powers/` s'appuient sur ce registre — ajouter un pouvoir similaire aux existants ne nécessite pas de toucher au moteur de roue lui-même.
