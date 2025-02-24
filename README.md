cwhynott: Generate a ReadME for this project. This is what we currently have:

# Project Setup Guide  

## Prerequisites  
Ensure you have the following installed:  
- **[MongoDB Community Edition 8.0](https://www.mongodb.com/try/download/community)**
- **[Node.js & npm](https://nodejs.org/en)**
- **[Python 3](https://www.python.org/downloads/)**  

---

## Install & Manage MongoDB  

### Install MongoDB (macOS)  
```sh
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
```

### Start MongoDB  
```sh
brew services start mongodb-community@8.0
```

### Stop MongoDB  
```sh
brew services stop mongodb-community@8.0
```

---

## Running the Application  

### Start the Frontend  
```sh
npm install  # Run only if dependencies are not installed
npm run dev
```

### Start the Backend  
```sh
python3 app.py
```

---


Workspace: Collecting workspace information# Project Setup Guide

## Prerequisites
Ensure you have the following installed:
- **[MongoDB Community Edition 8.0](https://www.mongodb.com/try/download/community)**
- **[Node.js & npm](https://nodejs.org/en)**
- **[Python 3](https://www.python.org/downloads/)**

---

## Install & Manage MongoDB

### Install MongoDB (macOS)
```sh
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
```

### Start MongoDB
```sh
brew services start mongodb-community@8.0
```

### Stop MongoDB
```sh
brew services stop mongodb-community@8.0
```

---

## Running the Application

### Start the Frontend
1. Navigate into the frontend folder:
    ```sh
    cd frontend
    ```
2. Install dependencies (if not installed yet):
    ```sh
    npm install
    ```
3. Start the development server:
    ```sh
    npm run dev
    ```

### Start the Backend
1. Navigate into the backend folder:
    ```sh
    cd backend
    ```
2. Start the Flask server:
    ```sh
    python3 app.py
    ```

---

## Project Structure

```
backend/
    app.py
    fake_iq.png
    generate_iq.py
    generatespec.py
    qpsk_in_noise.iq
    README.md
frontend/
    .gitignore
    eslint.config.js
    frontend@0.0.0
    index.html
    package.json
    public/
        vite.svg
    README.md
    src/
        App.css
        App.tsx
        assets/
            react.svg
        EnhancedApp.css
        index.css
        main.tsx
        vite-env.d.ts
    tsconfig.app.json
    tsconfig.json
    tsconfig.node.json
    vite
    vite.config.ts
generate_iq.py
generatespec.py
qpsk_in_noise.iq
README.md
```

### Backend
- **backend/app.py**: Flask application for handling file uploads, saving, and generating spectrograms.
- **backend/generate_iq.py**: Script to generate QPSK symbols with noise and save to an IQ file.
- **backend/generatespec.py**: Script to load IQ data and plot a spectrogram.

### Frontend
- **frontend/src/App.tsx**: Main React component for the frontend application.
- **frontend/src/main.tsx**: Entry point for the React application.
- **frontend/src/EnhancedApp.css**: Enhanced CSS styles for the application.
- **frontend/src/index.css**: Global CSS styles for the application.

---

## Additional Information
- **MongoDB** is used to store uploaded files using GridFS.
- **Flask** is used to create the backend server.
- **React** and **Vite** are used to create the frontend application.

cwhynott: Does it require any more things to be isntalled

GitHub Copilot: To ensure the project runs smoothly, you might also need to install the following:

- **[Flask](https://flask.palletsprojects.com/en/2.0.x/installation/)** for the backend server.
- **[GridFS](https://pypi.org/project/gridfs/)** for storing files in MongoDB.
- **[Matplotlib](https://matplotlib.org/stable/users/installing.html)** for generating spectrograms.

You can install these Python packages using `pip`:

```sh
pip install Flask gridfs matplotlib
```

Make sure to include these in your `requirements.txt` if you have one, or create one to manage dependencies.

cwhynott: Put it all in one readme and allow me to copy and paste it into github

GitHub Copilot: # Project Setup Guide

## Prerequisites
Ensure you have the following installed:
- **[MongoDB Community Edition 8.0](https://www.mongodb.com/try/download/community)**
- **[Node.js & npm](https://nodejs.org/en)**
- **[Python 3](https://www.python.org/downloads/)**

---

## Install & Manage MongoDB

### Install MongoDB (macOS)
```sh
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
```

### Start MongoDB
```sh
brew services start mongodb-community@8.0
```

### Stop MongoDB
```sh
brew services stop mongodb-community@8.0
```

---

## Running the Application

### Start the Frontend
1. Navigate into the frontend folder:
    ```sh
    cd frontend
    ```
2. Install dependencies (if not installed yet):
    ```sh
    npm install
    ```
3. Start the development server:
    ```sh
    npm run dev
    ```

### Start the Backend
1. Navigate into the backend folder:
    ```sh
    cd backend
    ```
2. Install required Python packages:
    ```sh
    pip install Flask gridfs matplotlib
    ```
3. Start the Flask server:
    ```sh
    python3 app.py
    ```
