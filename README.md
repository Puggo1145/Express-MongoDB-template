# Express-MongoDB-Scaffold

This is a Express-MongoDB scaffold for personal use originally. Now I share it with you so that it may help you develop your own App.

## Basic Feauture

### 1. An out-off-box basic configuration of backend:
dotenv / rate limiter / helmet / mongoSanitize / xss and hpp defender / data compression ......

### 2. project template
I kept some template files includes: 
controller - 1. authController 2. errorController 3. userController
model - userModel (A template that can help you build schemas and models quicker)
routes - userRouter (A basic use of express router)

### utilities
1. apiFeatures - a basic api function includes filter / sort / limit fields / paginate
2. appErrorClass - an error class better suits express app which extends from the original Error class
3. bodyChecker -  check if the provided body has any missing fields
4. bodyFilter - filter fields from body
5. idChecker - check if a query id has a correct format and its existence

### Final
This is not a standard or a generic scaffold. 
This is not a standard or a generic scaffold. 
This is not a standard or a generic scaffold. 
I personally only suggest a starter to use it as a practice. Consider if it's suitable for your development. 
