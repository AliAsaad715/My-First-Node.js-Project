
# Project E-Commerce API

## Run

### Install

``
npm install
``

### Start API

``
npm start
``

## Routes

### Users

``
POST    /api/v1/users/register
``

``
POST    /api/v1/users/login
``

``
GET     /api/v1/users/logout
``

``
GET     /api/v1/users/admin
``

``
GET     /api/v1/users/:id
``

``
GET     /api/v1/users/me
``

``
PUT     /api/v1/users/update-profile
``

``
DELETE  /api/v1/users/:id
``

``
GET     /api/v1/users/admin/get/count
``

### Products

``
GET      /api/v1/products
``

``
GET      /api/v1/products/:id
``

``
POST     /api/v1/products/admin
``

``
PUT      /api/v1/products/admin/:id
``

``
DELETE   /api/v1/products/admin/:id
``

``
PUT      /api/v1/products/gallery-images/admin/:id
``

``
GET      /api/v1/products/get/featured/:count
``

``
GET      /api/v1/products/admin/get/count
``

### Categories

``
GET      /api/v1/categories
``

``
GET      /api/v1/categories/admin/:id
``

``
POST     /api/v1/categories/admin
``

``
PUT      /api/v1/categories/admin/:id
``

``
DELETE   /api/v1/categories/admin/:id
``

### Orders

``
GET      /api/v1/orders/admin
``

``
GET      /api/v1/orders/:id
``

``
POST     /api/v1/orders
``

``
PATCH    /api/v1/orders/admin/:id
``

``
DELETE   /api/v1/orders/:id
``

``
GET      /api/v1/orders/get/my-orders
``

``
GET      /api/v1/orders/admin/get/count
``

``
GET      /api/v1/orders/admin/get/total-sales
``

``
GET      /api/v1/orders/admin/get/user-orders/:user_id
``
