# ⚡ PULSE — API Playground

> Un client REST élégant, cockpit-style, conçu pour les développeurs qui veulent de la précision et de la vitesse.

![PULSE Screenshot](https://img.shields.io/badge/version-2.0-f5a623?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBvbHlsaW5lIHBvaW50cz0iMjIgMTIgMTggMTIgMTUgMjEgOSAzIDYgMTIgMiAxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=)
![HTML](https://img.shields.io/badge/HTML-pure-f5a623?style=flat-square)
![No dependencies](https://img.shields.io/badge/dependencies-zero-22d3a0?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-54d4fa?style=flat-square)

---

## 🎯 Présentation

**PULSE** est un playground REST entièrement front-end, sans serveur, sans dépendances. Un seul fichier HTML suffit pour tester vos APIs avec un environnement professionnel et un design cockpit ambre-sur-obsidienne.

Inspiré par les outils comme Postman et Insomnia, mais **100% dans le navigateur** et **open source**.

---

## ✨ Fonctionnalités

### 🔌 Requêtes HTTP
- ✅ Tous les verbes HTTP : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
- ✅ Éditeur de **Query Params** avec activation/désactivation individuelle
- ✅ Éditeur de **Headers** avec compteur de headers actifs
- ✅ **Body** multi-types : `JSON`, `form-data`, `x-www-form-urlencoded`, `text`, `XML`, `GraphQL`
- ✅ Formatage JSON automatique (`⚡ Formater JSON`)
- ✅ Annulation de requête en cours (bouton **Annuler** ou `Echap`)

### 🔐 Authentification
- 🔑 **Bearer Token**
- 🔑 **Basic Auth** (user/password encodés en Base64)
- 🔑 **API Key** (header personnalisable)
- 🔑 **OAuth 2.0** (token d'accès)

### 📁 Collections & Historique
- 📂 Création de **collections** pour organiser vos requêtes
- 📌 **Sauvegarde rapide** d'une requête (`⌘S` ou bouton disquette)
- 🕐 **Historique** des 60 dernières requêtes envoyées
- 🔍 **Recherche** dans collections et historique
- 🗂️ Collections **pliables/dépliables**

### 🌍 Environnements & Variables
- 🌐 Plusieurs environnements : Développement, Production, etc.
- 🔄 Variables sous la forme `{{NOM_VARIABLE}}` dans URLs et headers
- ➕ Ajout/suppression d'environnements et variables à la volée

### 📊 Réponse
- 🎨 Visualisation **Pretty** avec coloration syntaxique JSON
- 📝 Vue **Raw** du corps brut
- 📋 Headers de réponse avec compteur
- ⏱️ Temps de réponse et taille en octets
- 📋 Copie rapide de la réponse

### 💻 Génération de Snippets
Générez du code pour votre requête en **8 langages** :

| Langage | |
|---|---|
| `cURL` | `JavaScript` |
| `Python` | `PHP` |
| `Go` | `Ruby` |
| `Java` | `C#` |

### 💾 Persistance
- 💾 Sauvegarde automatique dans le `localStorage`
- 📤 **Export** des collections en JSON
- 📥 **Import** de collections JSON (compatible Postman-like)

---

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|---|---|
| `⌘ Enter` / `Ctrl + Enter` | Envoyer la requête |
| `⌘ S` / `Ctrl + S` | Sauvegarder la requête |
| `Escape` | Annuler la requête / Fermer les modals |
| `Enter` (dans l'URL) | Envoyer la requête |
| `Tab` (dans le body) | Indentation de 2 espaces |

---

## 🚀 Installation

Aucune installation requise. C'est un fichier HTML statique.

```bash
# Option 1 : Ouvrir directement dans le navigateur
open pulse.html

# Option 2 : Serveur local (pour contourner certaines restrictions CORS)
npx serve .
# ou
python3 -m http.server 3000
```

---

## 📐 Architecture du projet

```
pulse.html
├── 🎨 CSS (Design system)
│   ├── Variables CSS (couleurs, espacements, typographie)
│   ├── Layout (Header · Sidebar · Main · Split)
│   ├── Composants (KV Editor, JSON Viewer, Modals, Toast)
│   └── Animations (loading, pulse, dots)
│
├── 🧱 HTML (Structure)
│   ├── Header (logo, env selector, actions)
│   ├── Sidebar (collections / historique)
│   ├── Main Panel (request bar + split panes)
│   └── Modals (env, save request)
│
└── ⚙️ JavaScript (Moteur)
    ├── State (S) — état global centralisé
    ├── Storage — LocalStorage persistance
    ├── Renderers — UI dynamique
    ├── HTTP Engine — fetch + abort
    └── Helpers — utils, snippets, formatters
```

---

## 🎨 Design System

PULSE utilise un design **Cockpit · Amber-on-Obsidian** avec :

| Token | Valeur | Usage |
|---|---|---|
| `--amber` | `#f5a623` | Couleur primaire, accents |
| `--bg0` | `#04040a` | Fond le plus sombre |
| `--green` | `#1de9b6` | Succès (2xx) |
| `--blue` | `#54d4fa` | Redirection (3xx) |
| `--red` | `#ff4757` | Erreur (4xx/5xx) |
| `--font` | `Syne` | Interface |
| `--mono` | `JetBrains Mono` | Code, données |

---

## ⚠️ Limitations connues

- 🌐 **CORS** : Certaines APIs bloquent les requêtes cross-origin depuis le navigateur. Utilisez un proxy local ou une extension CORS si nécessaire.
- 📁 **Fichiers** : Le type `form-data` ne supporte pas encore l'upload de fichiers binaires.
- 🔒 **HTTPS** : Sur des pages servies en HTTP, les requêtes vers HTTPS peuvent être bloquées par le navigateur.

---

## 🗺️ Roadmap

- [ ] 🌙 Thème clair
- [ ] 📁 Upload de fichiers dans `form-data`
- [ ] 🔁 Tests automatisés (scripts pre/post-request)
- [ ] 📊 Graphiques de performance des requêtes
- [ ] 🌐 Support WebSocket
- [ ] 📦 Import collections Postman / OpenAPI

---

## 📄 Licence

MIT — Libre d'utilisation, de modification et de distribution.

---

<div align="center">
  <strong>⚡ PULSE</strong> — Fait avec précision, pour les développeurs.
</div>
