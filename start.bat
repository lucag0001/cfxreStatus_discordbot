@echo off

if not exist "node_modules\" (
    echo node_modules folder not found. Running npm install...
    npm install
)

node index.js