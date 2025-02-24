# Project Setup Guide  

## Prerequisites  
Ensure you have the following installed:  
- **[MongoDB Community Edition 8.0](https://www.mongodb.com/try/download/community)**
- **[Node.js & npm](https://nodejs.org/en)**
- **[Python 3](https://www.python.org/downloads/)**  

---

## 🛠 Install & Manage MongoDB  

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
