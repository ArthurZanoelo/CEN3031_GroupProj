Tech stack: React.js, Bootstrap for css, Node.js + Express.js, and MySQL (as of now running locally)

Instructions for setting up gatorlift database and being able to test out the app properly:
-Create an oracle account and download mysql (webcommunity version) https://dev.mysql.com/downloads/installer/ 
-Run the installer… all default options should work but just make sure to set a password and create a user as well (otherwise it’d just be root)
-Go on windows search and look up MySQL… click on MySQL 8.0 Command Line Client
-Type in your password and run this command: 

CREATE DATABASE IF NOT EXISTS gatorlift;
USE gatorlift;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-Fill out .env following the instructions from .env.example (both are located in the backend folder)
-Open two terminals, one with the path to the GatorLift folder and one with the path to GatorLift/backend
-Run “npm run dev” in both terminals
-Should be able to test out both frontend and backend features now. 
