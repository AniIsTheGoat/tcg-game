# Jouer en ligne (1v1 par code de salon)

Le jeu peut maintenant se jouer à deux, à distance, via un **code de salon**.
Pour ça, il faut un petit **serveur** qui met les deux joueurs en relation.
Ce dossier `serveur/` contient ce serveur, prêt à lancer.

Le serveur ne fait que **relayer** les coups entre les deux joueurs : il ne stocke
rien et n'arbitre pas la partie (c'est suffisant pour jouer entre amis).

---

## 1. Tester en local (sur ton ordinateur)

Pré-requis : avoir **Node.js** installé (https://nodejs.org).

1. Ouvre un terminal dans le dossier `serveur/` :
   ```
   cd serveur
   npm install
   npm start
   ```
   Tu dois voir : `Serveur ANIME TCG démarré sur le port 8080`.

2. Ouvre `anime-tcg.html` dans ton navigateur, va dans l'onglet **En ligne**.
   Laisse l'adresse `ws://localhost:8080` et clique **Se connecter**.

3. Pour tester seul : ouvre le jeu dans **deux onglets/fenêtres**.
   - Onglet A : *Créer un salon* → un code de 4 lettres s'affiche (ex. `4F7K`).
   - Onglet B : tape ce code → *Rejoindre*.
   - Chacun compose son deck, clique **Je suis prêt**, et le duel commence.

> En local, seuls deux onglets de **ta** machine peuvent se rejoindre.
> Pour jouer avec un ami à distance, il faut héberger le serveur (étape 2).

---

## 2. Héberger le serveur (pour jouer avec des amis à distance)

N'importe quel hébergeur Node.js gratuit fait l'affaire. Le plus simple :

### Option A — Render.com (gratuit, recommandé)
1. Crée un compte sur https://render.com
2. Mets le contenu du dossier `serveur/` dans un dépôt GitHub.
3. Sur Render : **New > Web Service**, connecte ton dépôt.
4. Réglages :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Render te donne une URL du type `https://mon-jeu.onrender.com`.
   L'adresse à utiliser dans le jeu est la même en **wss** :
   `wss://mon-jeu.onrender.com`

### Option B — Railway.app / Fly.io
Même principe : déployer un service Node, commande de démarrage `npm start`.

### Dans le jeu
Onglet **En ligne** → mets l'adresse de ton serveur hébergé
(`wss://mon-jeu.onrender.com`) → **Se connecter**. Partage l'adresse +
le code de salon avec ton ami : vous pouvez jouer.

---

## Notes
- **wss://** (sécurisé) est nécessaire si le jeu est ouvert en https. En local, `ws://` suffit.
- Le serveur garde les salons en mémoire : s'il redémarre, les salons en cours sont perdus.
- Les hébergeurs gratuits « endorment » parfois le serveur après inactivité :
  la première connexion peut prendre quelques secondes à réveiller le service.
- Le mode en ligne utilise les cartes de **ta** collection locale. Chaque joueur
  joue avec son propre deck.
