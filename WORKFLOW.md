# 🌿 Trichofy — Team Development Workflow

> This document is the single source of truth for how the Trichofy dev team works together. Every team member must read and follow this before writing any code.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Phase 1 — Project Setup](#phase-1--project-setup)
3. [Phase 2 — Features To Build](#phase-2--features-to-build-in-order)
4. [Phase 3 — Git Rules](#phase-3--git-rules-for-the-team)
5. [Phase 4 — Definition of Done](#phase-4--definition-of-done-for-each-feature)
6. [Phase 5 — Deployment Checklist](#phase-5--deployment-checklist)

---

## 🧠 Project Overview

**Trichofy** is an AI-powered hair care web application built with Python and Gradio. It classifies hair types using a ResNet18 deep learning model and recommends hair care products based on hair type and real-time South African weather data.

| Item | Detail |
|---|---|
| **Repo** | https://github.com/siphosethu-bit/trichofy |
| **Live App** | https://trichofy-frontend-ymh1.onrender.com | https://trichofy-frontend.onrender.com/
| **Stack** | Python, Gradio, FastAI, PyTorch, Open-Meteo API |
| **Deployment** | Render |
| **Assistant Tool** | Trichofy Dev Hub Productivity Assistant (PartyRock) | https://partyrock.aws/u/WitnessLubisi/aPzph5eI_/Trichofy-Dev-Hub-Productivity-Assistant |

---

## 🚀 Phase 1 — Project Setup

Every developer must complete these steps before writing any code.

### 1. Clone the repo
```bash
git clone https://github.com/siphosethu-bit/trichofy.git
cd trichofy
```

### 2. Create your virtual environment
```bash
# Mac/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Confirm the app runs locally
```bash
python "app(real).py"
```

### 5. Pull latest main before doing anything
```bash
git pull origin main
git branch  # confirm you are on main
```

---

## 🧩 Phase 2 — Features To Build (In Order)

Each feature is a **separate branch**. Complete one, merge via Pull Request, then start the next. Do not work on multiple features in the same branch.

---

### ✅ Feature 1 — Weather Recommender
| | |
|---|---|
| **Branch** | `feature/weather-recommender` |
| **Files** | `weather.py`, `app(real).py` |
| **Status** | `weather.py` built and not tested |
| **Remaining** | Wire `weather.py` into `app(real).py` and test full pipeline |

**Tasks:**
- [ ] Import weather functions into `app(real).py`
- [ ] Add city input to `analyze_and_recommend()` function
- [ ] Test full pipeline: image → hair type → weather → recommendations
- [ ] Handle weather API failures gracefully

---

### 🔲 Feature 2 — City Selector UI
| | |
|---|---|
| **Branch** | `ui/city-selector-dropdown` |
| **Files** | `app(real).py` |
| **Status** | Not Started |

**Tasks:**
- [ ] Add SA city dropdown to Gradio UI
- [ ] Add text input fallback for smaller towns
- [ ] Connect dropdown to weather recommender
- [ ] Test with multiple cities across all 9 provinces

---

### 🔲 Feature 3 — Improve Hair Type Classifier
| | |
|---|---|
| **Branch** | `feature/classifier-improvements` |
| **Files** | `Hair-Type-Classifier/` |
| **Status** | Not Started |

**Tasks:**
- [ ] Test model accuracy across all hair types
- [ ] Add confidence threshold (reject low confidence predictions)
- [ ] Handle edge cases (blurry images, no hair detected)
- [ ] Document model performance metrics

---

### 🔲 Feature 4 — Product Database
| | |
|---|---|
| **Branch** | `feature/product-database` |
| **Files** | `products.py` (new file) |
| **Status** | Not Started |

**Tasks:**
- [ ] Replace hardcoded products with a structured database
- [ ] Source real South African hair care products
- [ ] Match products to specific hair types and weather conditions
- [ ] Add product links and pricing where possible

---

### 🔲 Feature 5 — User Authentication Polish
| | |
|---|---|
| **Branch** | `feature/auth-improvements` |
| **Files** | `app(real).py` |
| **Status** | Not Started |

**Tasks:**
- [ ] Clean up login flow
- [ ] Add proper error messages for failed logins
- [ ] Add session management
- [ ] Test authentication edge cases

---

### 🔲 Feature 6 — Frontend Integration
| | |
|---|---|
| **Branch** | `feature/frontend-api-integration` |
| **Files** | `tricofy-frontend/` |
| **Status** | Not Started |

**Tasks:**
- [ ] Connect React frontend to Gradio backend
- [ ] Handle API errors on the frontend
- [ ] Test end to end on mobile and desktop
- [ ] Match frontend design to Trichofy branding

---

### 🔲 Feature 7 — Testing Suite
| | |
|---|---|
| **Branch** | `test/unit-tests` |
| **Files** | `tests/` (new folder) |
| **Status** | Not Started |

**Tasks:**
- [ ] Write unit tests for `weather.py`
- [ ] Write unit tests for product recommender
- [ ] Write integration test for full pipeline
- [ ] Set up test runner in CI

---

### 🔲 Feature 8 — Deployment and CI/CD
| | |
|---|---|
| **Branch** | `docs/deployment-setup` |
| **Files** | `render.yaml`, `requirements.txt` |
| **Status** | Not Started |

**Tasks:**
- [ ] Stabilise Render deployment
- [ ] Add all environment variables to Render dashboard
- [ ] Set up automatic deploys from main only
- [ ] Document deployment process

---

## 🌿 Phase 3 — Git Rules for the Team

These rules are **non-negotiable**. Breaking these rules breaks the app for everyone.

### The Golden Rules

```
🚫 NEVER push directly to main
🚫 NEVER merge your own Pull Request
🚫 NEVER commit API keys or passwords
✅ ALWAYS create a feature branch before coding
✅ ALWAYS pull latest main before creating a branch
✅ ALWAYS get at least one teammate to review your PR
✅ ALWAYS delete your branch after it is merged
```

### Branch Naming Convention

```
feature/what-you-are-building     → new features
fix/what-you-are-fixing           → bug fixes
ui/what-you-are-changing          → interface changes
test/what-you-are-testing         → tests
docs/what-you-are-documenting     → documentation
```

**Examples:**
```
feature/weather-recommender
feature/product-database
fix/login-error-handling
ui/city-selector-dropdown
test/weather-unit-tests
docs/api-documentation
```

### The Correct Git Workflow — Follow Every Time

```bash
# Step 1 — Always start from latest main
git checkout main
git pull origin main

# Step 2 — Create your branch
git checkout -b feature/your-task-name

# Step 3 — Confirm you are on the right branch
git branch

# Step 4 — Do your work, commit regularly
git add .
git commit -m "feat: short description of what you did"

# Step 5 — Push your branch to GitHub
git push origin feature/your-task-name

# Step 6 — Open a Pull Request on GitHub for review
# Go to github.com/siphosethu-bit/trichofy
# Click "Compare & pull request"
# Add a clear title and description
# Request a teammate to review
```

### Commit Message Format

```
feat: add weather-based recommendations for Cape Town
fix: resolve city dropdown not loading on mobile
ui: update city selector to include all 9 provinces
test: add unit tests for classify_weather_for_hair
docs: update README with weather setup instructions
```

### If You Hit a Merge Conflict

```bash
# Step 1 — Pull latest main into your branch
git checkout main
git pull origin main
git checkout feature/your-branch-name
git merge main

# Step 2 — Open the conflicting files and resolve manually
# Look for <<<<<<< HEAD markers and fix them

# Step 3 — After resolving, commit the fix
git add .
git commit -m "fix: resolve merge conflict with main"
git push origin feature/your-branch-name
```

---

## ✅ Phase 4 — Definition of Done for Each Feature

Before any Pull Request can be merged, the developer must confirm every item below:

```
[ ] Code runs without errors locally
[ ] Feature works end to end in the Gradio app
[ ] No hardcoded credentials or API keys anywhere in the code
[ ] Commit messages are clean and descriptive
[ ] PR title and description clearly explain what was done and why
[ ] At least one teammate has reviewed and approved the PR
[ ] requirements.txt updated if new libraries were added
[ ] No conflicts with the main branch
[ ] The feature was tested with real data (not just dummy data)
[ ] Edge cases and errors are handled gracefully
```

---

## 🚀 Phase 5 — Deployment Checklist

Only the **team lead** merges into main and triggers a deployment. Before any merge to main:

```
[ ] All tasks in Phase 4 checklist are complete
[ ] All tests pass locally
[ ] requirements.txt is up to date
[ ] Environment variables are confirmed on Render dashboard
[ ] The PR has been reviewed and approved by at least one teammate
[ ] The live site is tested manually after every merge to main
[ ] The team is notified when a deployment goes live
```

---

## 🆘 Getting Help

If you are stuck:
1. Check this document first
2. Check the GitHub issues tab
3. Ask in the team chat with a clear description of the problem
4. If you think you broke main — tell the team immediately, don't hide it

---

> Built with 💚 by the Trichofy Dev Team
