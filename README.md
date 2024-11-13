# Peer-to-Peer Payment Platform

## Table of Contents
- [Peer-to-Peer Payment Platform](#peer-to-peer-payment-platform)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)

---

## Overview
The **P2P Payment Platform** is a MERN-stack application that allows users to send and receive funds within a secure network using unique account numbers. This platform provides a streamlined digital payment experience with wallet funding, peer-to-peer transfers, OTP-based verification, and real-time notifications.

## Features
- **User Authentication**: Secure user registration and login.
- **Wallet Management**: Access and manage wallet balance.
- **Peer-to-Peer Transfer**: Transfer funds using account numbers, verified by OTP.
- **Transaction History**: Detailed transaction logs for user reference.
- **Real-Time Notifications**: Immediate notifications for transactions.
- **Admin Dashboard**: Admin controls for monitoring and platform security.

## Tech Stack
- **Frontend**: React, Redux Toolkit, Material-UI, Socket.IO
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO
- **Additional**: JSON Web Token (JWT) for authentication, Nodemailer for OTP verification, Body-Parser for handling requests, CORS for cross-origin requests.

## Project Structure
```plaintext
root
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
├── frontend
│   ├── public
│   ├── src
│       ├── components
│       ├── features
│       ├── redux
│       ├── services
│       └── App.js
└── README.md# Peer-2-Peer-payment-platfrom-backend
# Peer-2-Peer-payment-platfrom-backend
