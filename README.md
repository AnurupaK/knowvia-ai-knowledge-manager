# KNOWVIA — AI Knowledge Manager

Knowvia is a Flask-based **AI Knowledge Management System** designed to help teams create, organize, update, and manage structured knowledge and FAQs for AI-powered applications.

The system combines a **Flask REST API**, **AWS S3**, **Amazon Bedrock with Claude**, a lightweight **Vanilla JavaScript frontend**, automated testing with **pytest**, and **GitHub Actions CI**.

## ✨ Features

- 📚 **Knowledge Management**
  - Create and update knowledge categories
  - Manage English and Japanese category information
  - Store structured knowledge as JSON
  - Maintain centralized category metadata

- ❓ **FAQ Management**
  - Create, update, and retrieve FAQs
  - Manage FAQs for individual knowledge categories
  - Generate FAQs automatically using Claude
  - Validate generated FAQ responses

- 🤖 **AI Integration**
  - Amazon Bedrock integration
  - Claude-powered FAQ generation
  - Structured prompt-based generation
  - Automated response extraction and validation

- ☁️ **AWS S3 Storage**
  - Store knowledge data
  - Store FAQ data
  - Maintain metadata and category information
  - Separate current and backup data paths

- 🔌 **REST APIs**
  - Flask-based backend APIs
  - Category management endpoints
  - FAQ endpoints
  - Metadata endpoints
  - Request validation and error handling

- 🧪 **Automated Testing**
  - pytest-based API tests
  - Success and failure scenarios
  - Request validation tests
  - AWS services mocked during testing

- ⚙️ **Continuous Integration**
  - GitHub Actions workflow
  - Python syntax validation
  - Automated pytest execution
  - Runs on pushes and pull requests

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Backend | Python, Flask |
| Frontend | HTML, CSS, Vanilla JavaScript |
| AI | Amazon Bedrock, Claude |
| Storage | Amazon S3 |
| API | REST |
| Testing | pytest |
| CI | GitHub Actions |
| Server | Gunicorn |
| Version Control | Git, GitHub |

## 🏗️ Project Structure

```text
knowvia-ai-knowledge-manager/
│
├── ai_module/          # AI and Claude integration
│
├── aws/                # AWS and S3 services
│
├── backend/
│   ├── routes/         # Flask API routes
│   └── app.py          # Flask application
│
├── frontend/
│   ├── static/         # CSS, JavaScript, components
│   └── templates/      # HTML templates
│
├── tests/              # pytest test suite
│
├── .github/
│   └── workflows/
│       └── ci.yml      # GitHub Actions CI
│
├── requirements.txt
├── .gitignore
├── LICENSE
└── README.md
````

## 🔄 Application Flow

```text
Frontend
   │
   │ REST API
   ▼
Flask Backend
   │
   ├──────────────► AWS S3
   │                 │
   │                 ├── Knowledge
   │                 ├── FAQs
   │                 └── Metadata
   │
   └──────────────► Amazon Bedrock
                     │
                     └── Claude
                         │
                         └── FAQ Generation
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/AnurupaK/knowvia-ai-knowledge-manager.git
cd knowvia-ai-knowledge-manager
```

### 2. Create a virtual environment

```bash
python -m venv management_venv
```

Activate it on Windows:

```powershell
management_venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root and configure the required AWS and application settings.

> Do not commit `.env` or AWS credentials to the repository.

### 5. Start the application

```bash
python backend/app.py
```

## 🧪 Testing

Run the complete test suite with:

```bash
pytest
```

The test suite covers:

* Knowledge APIs
* FAQ APIs
* Metadata APIs
* Request validation
* Error handling
* Category ID validation

Example:

```text
14 passed
```

## ⚙️ GitHub Actions CI

The project uses **GitHub Actions** for continuous integration.

Every push to `main` or a feature branch, and every pull request to `main`, triggers the CI workflow.

The workflow:

```text
Checkout code
      ↓
Set up Python 3.12
      ↓
Install dependencies
      ↓
Check Python syntax
      ↓
Run pytest
      ↓
   ✅ Pass
```

CI workflow:

```text
.github/workflows/ci.yml
```

The test suite uses mocked AWS services and test environment variables, so CI does not require access to the production AWS environment.

## 🔐 Security

Environment-specific configuration is stored using environment variables.

Sensitive information such as:

* AWS credentials
* S3 configuration
* Flask secret keys

should never be committed to GitHub.

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

## 🎬 Demo

https://github.com/user-attachments/assets/b15e7c2b-0a00-4c36-9747-1fa9a6b5b321




