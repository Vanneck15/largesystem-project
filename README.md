# ERP Système — Gestion académique, finances et RH

Une application ERP complète pour un établissement académique : gestion des cours, examens,
relevés de notes, présences, facturation, paiements, dépenses, campagnes marketing, employés,
paie, congés, évaluations de performance et inventaire.

**🔗 Démo en ligne :** https://vanneck15.github.io/largesystem-project/

Comptes de démonstration (mot de passe `demo123`) :

| Rôle | Email |
|---|---|
| Admin | admin@erp.com |
| Staff | staff@erp.com |
| Étudiant | student@erp.com |

## Fonctionnalités

- **Authentification par rôle** (admin / staff / étudiant), chaque rôle voit un menu différent
- **13 modules fonctionnels** avec CRUD complet (ajout, modification, suppression, recherche) :
  Cours, Examens, Relevés de notes, Présences, Factures, Paiements, Dépenses, Campagnes,
  Employés, Paie, Congés, Évaluations, Inventaire
- **Tableau de bord** avec statistiques et graphiques (recharts) : encaissements/dépenses,
  répartition des factures par statut
- **Thème clair/sombre**, interface entièrement en français, responsive
- **Interface shadcn/ui** (Radix UI + Tailwind CSS) — accessible, cohérente

## Architecture de cette version déployée

L'application est **entièrement front-end** (React + TypeScript + Vite) : les données sont
stockées dans le `localStorage` du navigateur, préchargées avec un jeu de données réaliste.
Ce choix permet un déploiement gratuit et instantané sur GitHub Pages, sans dépendre d'un
serveur ni d'une base de données en ligne.

Le code source complet d'un **vrai backend** (Node.js + Express + PostgreSQL/Drizzle ORM,
authentification JWT, API REST) est conservé dans `server/` et `shared/schema.ts` — c'est le
socle prévu pour une mise en production avec base de données persistante et données partagées
entre utilisateurs. Pour l'activer :

```bash
npm install
cp .env.example .env   # renseigner DATABASE_URL (PostgreSQL)
npm run db:push        # applique le schéma Drizzle
npm run dev             # lance le serveur Express + le client Vite
```

## Développement du frontend seul (mode démo, sans backend)

```bash
npm install
npx vite build --mode development  # ou npm run dev pour le mode complet avec serveur
```

## Déploiement

Le déploiement sur GitHub Pages est automatique à chaque push sur `main`
(voir `.github/workflows/deploy.yml`), et build uniquement le frontend statique.

## Structure du projet

```
client/src/
├── pages/erp-dashboard.tsx     # Coquille de l'application (navigation, aperçu, graphiques)
├── components/auth/             # Connexion / inscription (démo, sans serveur)
├── components/erp/
│   └── generic-module.tsx        # Composant CRUD générique réutilisé par les 13 modules
├── lib/
│   ├── mock-store.ts              # Collection localStorage générique (create/read/update/delete)
│   ├── seed-data.ts               # Données de démonstration
│   ├── erp-data.ts                # Instanciation des 13 collections
│   ├── mock-auth.ts               # Authentification simulée (comptes démo)
│   └── module-configs.tsx         # Configuration (colonnes, champs de formulaire) de chaque module
server/                          # Backend Express + PostgreSQL de référence (non utilisé par la démo statique)
shared/schema.ts                 # Schéma Drizzle ORM complet (13 tables + relations)
```
