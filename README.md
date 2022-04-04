# natours-app

A Web-app for users to browse through available tour packages, view and book tours using secure payment method.
Built using modern technologies - node.js, express, mongoDB and mongoose

## Deployed Version
Live demo (Feel free to visit) 👉 : https://go-natours.herokuapp.com/
```
Test User
  - email: leo@example.com
  - passd: test1234
```


## Key Features

* Authentication and Authorization
  - Login and logout
  - Users with different roles (admin, lead-guide, guide, user)
  - role based authorization
* Tour
  - Manage booking, check tours map, check user's reviews and rating
* User profile
  - Update username, photo, email, and password
* Credit card Payment (Test Mode)

## How To Use

### Book a tour
* Login to the site (Test user)
* Look through tour details
* Book the tour of choice by clicking on Book Tour btn
* Proceed to the payment checkout page
* Enter the card details (Test Mode):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: any
  - CVV: any
  ```
* Done!

### Update your profile

* You can update your username, email, profile photo and also reset password.

## Tools and Technologies

### Technologies

* node.js
* express.js - JS framework
* mongoDB Atlas - NoSQL cloud Database service
* mongoose      - mongoDB driver in simple terms
* Pug - Server side rendering
* JS
* Git - Version control

### Tools

* GitHub
* Mailing Services
  - Development - Mailtrap
  - Production  - SendGrid
* Stripe - Payments
* Mailsac
  - Creates instant email addresses without a need for signup
* Heroku - Deploying the Application

## Acknowledgement

* This project is an outcome of a course that I've taken in Udemy. Link to the course: [Node.js, Express, MongoDB & More: The Complete Bootcamp 2022](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)
