# WeFix.lk API Documentation

**Base URL:** `http://localhost:8001/api`  
**Production URL:** `https://your-domain.com/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Bookings](#bookings)
4. [Products](#products)
5. [Cart](#cart)
6. [Addresses](#addresses)
7. [Service Requests](#service-requests)
8. [Warranty](#warranty)
9. [Notifications](#notifications)
10. [OTP Verification](#otp-verification)

---

## Authentication

### 1. Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Shadir Ahmed",
  "email": "shadir@example.com",
  "phone": "+94771234567",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_1234567890",
      "name": "Shadir Ahmed",
      "email": "shadir@example.com",
      "phone": "+94771234567",
      "role": "customer",
      "phoneVerified": false,
      "createdAt": "2025-06-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "DUPLICATE_EMAIL"
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "shadir@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_1234567890",
      "name": "Shadir Ahmed",
      "email": "shadir@example.com",
      "phone": "+94771234567",
      "role": "customer",
      "phoneVerified": true,
      "notificationPreferences": {
        "email": true,
        "push": true,
        "sms": false
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

---

### 3. Logout
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "shadir@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### 5. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Profile

### 1. Get User Profile
**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_1234567890",
    "name": "Shadir Ahmed",
    "email": "shadir@example.com",
    "phone": "+94771234567",
    "role": "customer",
    "phoneVerified": true,
    "notificationPreferences": {
      "email": true,
      "push": true,
      "sms": false
    },
    "createdAt": "2025-06-15T10:30:00Z",
    "updatedAt": "2025-06-15T10:30:00Z"
  }
}
```

---

### 2. Update User Profile
**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Shadir Ahmed",
  "phone": "+94771234567",
  "notificationPreferences": {
    "email": true,
    "push": false,
    "sms": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_1234567890",
    "name": "Shadir Ahmed",
    "email": "shadir@example.com",
    "phone": "+94771234567",
    "phoneVerified": true,
    "notificationPreferences": {
      "email": true,
      "push": false,
      "sms": true
    },
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 3. Change Password
**Endpoint:** `PUT /users/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "INVALID_PASSWORD"
}
```

---

## Bookings

### 1. Create Booking
**Endpoint:** `POST /bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tvBrand": "Samsung",
  "tvModel": "UA55AU7700",
  "issueType": "display-issue",
  "issueDescription": "Screen has vertical lines and flickering",
  "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
  "phone": "+94771234567",
  "pickupOption": "pickup",
  "customerName": "Shadir Ahmed"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_1234567890",
    "userId": "user_1234567890",
    "customerName": "Shadir Ahmed",
    "customerPhone": "+94771234567",
    "tvBrand": "Samsung",
    "tvModel": "UA55AU7700",
    "issueType": "display-issue",
    "issueDescription": "Screen has vertical lines and flickering",
    "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
    "pickupOption": "pickup",
    "status": "pending",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-06-15T10:30:00Z",
        "note": "Booking created"
      }
    ],
    "createdAt": "2025-06-15T10:30:00Z",
    "updatedAt": "2025-06-15T10:30:00Z"
  }
}
```

---

### 2. Get User Bookings
**Endpoint:** `GET /bookings/user`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, in-progress, testing, ready, completed, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_1234567890",
        "userId": "user_1234567890",
        "customerName": "Shadir Ahmed",
        "tvBrand": "Samsung",
        "tvModel": "UA55AU7700",
        "issueType": "display-issue",
        "status": "in-progress",
        "createdAt": "2025-06-15T10:30:00Z",
        "updatedAt": "2025-06-15T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Booking by ID
**Endpoint:** `GET /bookings/:bookingId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "booking_1234567890",
    "userId": "user_1234567890",
    "customerName": "Shadir Ahmed",
    "customerPhone": "+94771234567",
    "tvBrand": "Samsung",
    "tvModel": "UA55AU7700",
    "issueType": "display-issue",
    "issueDescription": "Screen has vertical lines and flickering",
    "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
    "pickupOption": "pickup",
    "status": "in-progress",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-06-15T10:30:00Z",
        "note": "Booking created"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-06-15T11:00:00Z",
        "note": "Booking confirmed by admin"
      },
      {
        "status": "in-progress",
        "timestamp": "2025-06-15T12:00:00Z",
        "note": "Repair work started"
      }
    ],
    "createdAt": "2025-06-15T10:30:00Z",
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 4. Update Booking Status (Admin)
**Endpoint:** `PUT /bookings/:bookingId/status`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "in-progress",
  "note": "Repair work started, panel replacement in progress"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "booking_1234567890",
    "status": "in-progress",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-06-15T10:30:00Z",
        "note": "Booking created"
      },
      {
        "status": "in-progress",
        "timestamp": "2025-06-15T12:00:00Z",
        "note": "Repair work started, panel replacement in progress"
      }
    ],
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 5. Get All Bookings (Admin)
**Endpoint:** `GET /admin/bookings`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_1234567890",
        "userId": "user_1234567890",
        "customerName": "Shadir Ahmed",
        "customerPhone": "+94771234567",
        "tvBrand": "Samsung",
        "tvModel": "UA55AU7700",
        "status": "in-progress",
        "createdAt": "2025-06-15T10:30:00Z"
      }
    ],
    "stats": {
      "total": 150,
      "pending": 25,
      "confirmed": 10,
      "inProgress": 30,
      "testing": 15,
      "ready": 20,
      "completed": 45,
      "cancelled": 5
    },
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

---

### 6. Cancel Booking
**Endpoint:** `PUT /bookings/:bookingId/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Changed my mind, will repair later"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "booking_1234567890",
    "status": "cancelled",
    "updatedAt": "2025-06-15T13:00:00Z"
  }
}
```

---

### 7. Delete Booking
**Endpoint:** `DELETE /bookings/:bookingId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

## Products

### 1. Get All Products
**Endpoint:** `GET /products`

**Query Parameters:**
- `category` (optional): Filter by category (TV Panels, Backlights, T-CON Board, TV Main Board, Multi Products)
- `search` (optional): Search by name or model
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `inStock` (optional): Filter by stock availability (true/false)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_1234567890",
        "name": "Samsung 55\" LED Panel",
        "modelNumber": "BN07-02156A",
        "category": "TV Panels",
        "description": "High-quality LED panel replacement for Samsung 55-inch TVs",
        "price": 45000,
        "stock": 15,
        "images": [
          "https://storage.example.com/products/samsung-panel-1.jpg",
          "https://storage.example.com/products/samsung-panel-2.jpg"
        ],
        "isActive": true,
        "createdAt": "2025-06-10T10:00:00Z",
        "updatedAt": "2025-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Product by ID
**Endpoint:** `GET /products/:productId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "product_1234567890",
    "name": "Samsung 55\" LED Panel",
    "modelNumber": "BN07-02156A",
    "category": "TV Panels",
    "description": "High-quality LED panel replacement for Samsung 55-inch TVs. Compatible with multiple models.",
    "price": 45000,
    "stock": 15,
    "images": [
      "https://storage.example.com/products/samsung-panel-1.jpg",
      "https://storage.example.com/products/samsung-panel-2.jpg"
    ],
    "isActive": true,
    "createdAt": "2025-06-10T10:00:00Z",
    "updatedAt": "2025-06-15T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Product not found",
  "error": "PRODUCT_NOT_FOUND"
}
```

---

### 3. Create Product (Admin)
**Endpoint:** `POST /admin/products`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
name: Samsung 55" LED Panel
modelNumber: BN07-02156A
category: TV Panels
description: High-quality LED panel replacement
price: 45000
stock: 15
images: [File1, File2]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "product_1234567890",
    "name": "Samsung 55\" LED Panel",
    "modelNumber": "BN07-02156A",
    "category": "TV Panels",
    "description": "High-quality LED panel replacement",
    "price": 45000,
    "stock": 15,
    "images": [
      "https://storage.example.com/products/product_1234567890_1.jpg",
      "https://storage.example.com/products/product_1234567890_2.jpg"
    ],
    "isActive": true,
    "createdAt": "2025-06-15T10:00:00Z"
  }
}
```

---

### 4. Update Product (Admin)
**Endpoint:** `PUT /admin/products/:productId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Samsung 55\" LED Panel - Updated",
  "modelNumber": "BN07-02156A",
  "category": "TV Panels",
  "description": "High-quality LED panel replacement for Samsung 55-inch TVs",
  "price": 42000,
  "stock": 20,
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "product_1234567890",
    "name": "Samsung 55\" LED Panel - Updated",
    "price": 42000,
    "stock": 20,
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 5. Delete Product (Admin)
**Endpoint:** `DELETE /admin/products/:productId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 6. Upload Product Images (Admin)
**Endpoint:** `POST /admin/products/:productId/images`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
images: [File1, File2, File3]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "productId": "product_1234567890",
    "images": [
      "https://storage.example.com/products/product_1234567890_1.jpg",
      "https://storage.example.com/products/product_1234567890_2.jpg",
      "https://storage.example.com/products/product_1234567890_3.jpg"
    ]
  }
}
```

---

## Cart

### 1. Get User Cart
**Endpoint:** `GET /cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart_item_1",
        "productId": "product_1234567890",
        "product": {
          "id": "product_1234567890",
          "name": "Samsung 55\" LED Panel",
          "price": 45000,
          "images": ["https://storage.example.com/products/samsung-panel-1.jpg"],
          "stock": 15
        },
        "quantity": 2,
        "subtotal": 90000
      }
    ],
    "summary": {
      "itemCount": 2,
      "subtotal": 90000,
      "tax": 0,
      "total": 90000
    }
  }
}
```

---

### 2. Add Item to Cart
**Endpoint:** `POST /cart/items`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "product_1234567890",
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "cart_item_1",
    "productId": "product_1234567890",
    "quantity": 2,
    "subtotal": 90000
  }
}
```

---

### 3. Update Cart Item
**Endpoint:** `PUT /cart/items/:itemId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "cart_item_1",
    "quantity": 3,
    "subtotal": 135000
  }
}
```

---

### 4. Remove Cart Item
**Endpoint:** `DELETE /cart/items/:itemId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 5. Clear Cart
**Endpoint:** `DELETE /cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Addresses

### 1. Get Saved Addresses
**Endpoint:** `GET /addresses`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "address_1234567890",
        "userId": "user_1234567890",
        "label": "Home",
        "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
        "isDefault": true,
        "createdAt": "2025-06-10T10:00:00Z"
      },
      {
        "id": "address_0987654321",
        "userId": "user_1234567890",
        "label": "Office",
        "address": "No. 456, Office Building, Colombo 07, Sri Lanka",
        "isDefault": false,
        "createdAt": "2025-06-12T14:00:00Z"
      }
    ]
  }
}
```

---

### 2. Add Address
**Endpoint:** `POST /addresses`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "label": "Home",
  "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
  "isDefault": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "address_1234567890",
    "userId": "user_1234567890",
    "label": "Home",
    "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
    "isDefault": true,
    "createdAt": "2025-06-15T10:00:00Z"
  }
}
```

---

### 3. Update Address
**Endpoint:** `PUT /addresses/:addressId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "label": "Home - Updated",
  "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
  "isDefault": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "address_1234567890",
    "label": "Home - Updated",
    "address": "No. 123, Main Street, Colombo 03, Sri Lanka",
    "isDefault": false,
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 4. Delete Address
**Endpoint:** `DELETE /addresses/:addressId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### 5. Set Default Address
**Endpoint:** `PUT /addresses/:addressId/default`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Default address updated",
  "data": {
    "id": "address_1234567890",
    "isDefault": true
  }
}
```

---

## Service Requests

### 1. Get Service Requests (Admin)
**Endpoint:** `GET /admin/service-requests`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `type` (optional): Filter by type (web-design, web-seo, pos-system, mobile-app)
- `status` (optional): Filter by status (pending, in-progress, completed)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request_1234567890",
        "type": "web-design",
        "customerName": "Shadir Ahmed",
        "customerEmail": "shadir@example.com",
        "customerPhone": "+94771234567",
        "message": "Need a modern e-commerce website",
        "status": "pending",
        "createdAt": "2025-06-15T10:00:00Z"
      }
    ],
    "stats": {
      "total": 45,
      "pending": 15,
      "inProgress": 20,
      "completed": 10
    },
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 2. Update Service Request Status (Admin)
**Endpoint:** `PUT /admin/service-requests/:requestId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "in-progress",
  "notes": "Started working on the design mockups"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service request updated",
  "data": {
    "id": "request_1234567890",
    "status": "in-progress",
    "notes": "Started working on the design mockups",
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

## Warranty

### 1. Check Warranty
**Endpoint:** `POST /warranty/check`

**Request Body:**
```json
{
  "serialNumber": "SN123456789",
  "billNumber": "BILL-2024-001",
  "phoneNumber": "+94771234567"
}
```

**Response (200 OK - Valid Warranty):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "product": "Samsung 55\" LED TV",
    "purchaseDate": "2024-06-15",
    "expiryDate": "2025-06-15",
    "daysRemaining": 180,
    "coverageType": "Full Warranty",
    "notes": "Covers parts and labor"
  }
}
```

**Response (200 OK - Expired Warranty):**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "product": "Samsung 55\" LED TV",
    "purchaseDate": "2023-01-15",
    "expiryDate": "2024-01-15",
    "message": "Warranty has expired"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No warranty found with the provided details",
  "error": "WARRANTY_NOT_FOUND"
}
```

---

## Notifications

### 1. Send Notification (Admin)
**Endpoint:** `POST /admin/notifications`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userId": "user_1234567890",
  "title": "Repair Status Update",
  "message": "Your TV repair is now in testing phase",
  "type": "booking_update",
  "data": {
    "bookingId": "booking_1234567890",
    "status": "testing"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "id": "notification_1234567890",
    "userId": "user_1234567890",
    "title": "Repair Status Update",
    "message": "Your TV repair is now in testing phase",
    "type": "booking_update",
    "isRead": false,
    "createdAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### 2. Get User Notifications
**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `unread` (optional): Filter unread only (true/false)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_1234567890",
        "title": "Repair Status Update",
        "message": "Your TV repair is now in testing phase",
        "type": "booking_update",
        "isRead": false,
        "data": {
          "bookingId": "booking_1234567890",
          "status": "testing"
        },
        "createdAt": "2025-06-15T12:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 3. Mark Notification as Read
**Endpoint:** `PUT /notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 4. Mark All Notifications as Read
**Endpoint:** `PUT /notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## OTP Verification

### 1. Send OTP
**Endpoint:** `POST /otp/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone": "+94771234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+94771234567",
    "expiresIn": 300
  }
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /otp/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone": "+94771234567",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "phoneVerified": true
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "error": "INVALID_OTP"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

---

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required",
  "error": "FORBIDDEN"
}
```

---

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "NOT_FOUND"
}
```

---

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "error": "INTERNAL_SERVER_ERROR"
}
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Pagination

Paginated endpoints support these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10-20 depending on endpoint)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Data Types

### Booking Status Values
- `pending`: Booking created, awaiting confirmation
- `confirmed`: Booking confirmed by admin
- `parts-ordered`: Required parts have been ordered
- `in-progress`: Repair work in progress
- `testing`: Repair completed, under testing
- `ready`: Ready for pickup/delivery
- `completed`: Booking completed
- `cancelled`: Booking cancelled

### Service Request Types
- `web-design`: Web Design Service
- `web-seo`: Web SEO Service
- `pos-system`: POS System
- `mobile-app`: Mobile App Development

### Product Categories
- `TV Panels`
- `Backlights`
- `T-CON Board`
- `TV Main Board`
- `Multi Products`

### User Roles
- `customer`: Regular customer
- `admin`: Admin user

---

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Admin endpoints: 200 requests per minute

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1718449200
```

---

## CORS

The API supports CORS for web applications. Allowed origins can be configured in the backend.

---

## Webhooks (Future)

Webhook endpoints for:
- Payment notifications
- Booking status updates
- Product stock alerts

---

## Best Practices

1. **Always validate tokens** before making requests
2. **Handle errors gracefully** with user-friendly messages
3. **Implement retry logic** for failed requests (with exponential backoff)
4. **Cache frequently accessed data** (products, categories)
5. **Use pagination** for large datasets
6. **Sanitize user input** before sending to API
7. **Log API errors** for debugging

---

## Testing

Use these test credentials:

**Admin:**
```
Email: wefixtvrepair@gmail.com
Password: admin123
```

**Customer:**
```
Email: customer@example.com
Password: customer123
```

**Test Phone Numbers (for OTP):**
```
+94771234567 - OTP: 123456 (always valid in dev)
```

---

## Support

For API support, contact:
- Email: support@wefix.lk
- Phone: +94 77 330 0905
- WhatsApp: +94 77 330 0905

---

**Last Updated:** June 2025  
**Version:** 1.0.0
