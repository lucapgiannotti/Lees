# Contributing to Lees :beer:

First off, thanks for taking an interest in **Lees**! Whether you're fixing a bug, reporting an issue, or adding a new feature, your help is appreciated.

## 🛠 Prerequisites

To get started, ensure you have the following installed on your local machine:

- **Node.js v22+**: Required for the Vite-based frontend.
    
- **Python 3.11+**: For the FastAPI backend.
    
- **Docker & Docker Compose**: Recommended for testing containerized environments.
    
- **Git**: For version control.
    

## 🚀 Local Development Setup

### 1. Clone the Repository

Bash

```
git clone https://github.com/lucapgiannotti/Lees.git
cd Lees
```

### 2. Backend Setup (FastAPI)

Bash

```
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
pip install -r requirements.txt
python seed.py             # Pre-fills the DB with test batches
uvicorn main:app --reload
```

### 3. Frontend Setup (React + Vite)

Bash

```
cd frontend
npm install
npm run dev
```

## Code Style & Standards

We use automated tools to keep the codebase readable.

- **Python**: We use **Ruff** for linting and formatting. It is enforced via a pre-commit hook.
    
- **React**: We use **Prettier** and **ESLint**. Please ensure your editor is configured to "Format on Save."
    
- **Husky**: Git hooks are installed to prevent unformatted code from being committed. If a commit fails, run the manual formatting commands:
    
    - `ruff format .` (Backend)
        
    - `npm run lint` (Frontend)
        

## Contribution Workflow
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/lucapgiannotti/Lees?style=for-the-badge&color=ed966d)


1. **Find an Issue**: Check the [Issues tab](https://www.google.com/search?q=https://github.com/lucapgiannotti/Lees/issues). Look for the `good first issue` label if you're new!.
    
2. **Fork & Branch**: Create a branch with a descriptive name:
    
    - `feat/add-tosna-calculator`
        
    - `fix/abv-dilution-rounding`
        
3. **Commit**: Write clear, imperative commit messages (e.g., `feat: implement recipe scaling engine`).
    
4. **Pull Request**:
    
    - Fill out the PR template completely.
        
    - Apply relevant labels like `🔍 ready for review` or `contains DB migrations`.
        
    - Link the issue your PR resolves (e.g., `Closes #12`).
        

## Labels to Know

We use specific labels to organize the workflow:

- `area: frontend`: React/UI tasks.
    
- `area: backend`: FastAPI/Database tasks.
    
- `contains DB migrations`: High alert—indicates the SQLite schema is changing.
    

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

If you have questions, feel free to open a `status: help-wanted` issue.
