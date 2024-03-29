# Chirper - A Twitter Clone

Chirper is a work-in-progress Twitter clone built using React with TypeScript on the front-end and Node.js with TypeScript on the backend. For data management, MongoDB has been utilized along with Mongoose. 

This clone allows users to post messages with a limit of 247 characters, gifs, images, videos, and more. Each post can be tagged with a location via the Post Location modal, which integrates Google's location API. 

The server-side has been developed with a keen focus on cleanliness and security, incorporating a global error handler, JWT authentication, a rate limiter to counteract brute force and DOS attacks, and request sanitizer to prevent XSS attacks.

Please note that this project is still in development and more features will be added in the future.

![Main board image](screenshots/home-page_1.png)

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Screenshots](#screenshots)

## Features

- **Post Creation**: Create posts with a limit of 247 characters, gifs, images, videos or gifs. 

![Post Edit 1 image](screenshots/post-edit_1.png)
![Post Edit 2 image](screenshots/post-edit_2.png)

- **Gif Integration**: The Gif modal allows users to search for and select gifs to include in their posts. 

![GIF Modal image](screenshots/gif-modal.png)

- **Post Location Tagging**: The application integrates Google's location API to allow users to tag posts with a location. 

![Post Location image](screenshots/post-location.png)

- **Post Scheduling**: The application provides a post schedule modal with a complex range of inputs, built with custom hooks, for users to schedule their posts.
![Post Edit 3 image](screenshots/post-schedule.png)


- **Post Statistics**: The Post Stat feature provides insights and analytics of individual posts.

![Post Stat image](screenshots/post-stat.png)

## Technologies

- Frontend: React, TypeScript, Redux, React Router, Axios, Material UI, Google Maps API, Sass
- Backend: Node.js, TypeScript, Express, JWT, Bcrypt, Express Validator, Rate Limiter, Helmet, CORS
- Database: MongoDB, Mongoose, MongoDB Atlas

## Installation

To install and run Chirper on your local machine:

1. Clone the repository.
2. Navigate to both the `frontend` and `backend` directories and run `npm install` to install the necessary packages in each directory.
3. Run `npm run dev` in both directories to start the services.


