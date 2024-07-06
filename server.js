const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

const rooms = new Map();

const onlineUsers = new Set(); // เก็บรายชื่อผู้ใช้ที่ออนไลน์

app.use(express.static('public'));

io.on('connection', (socket) => {
    const userId = socket.id; // สร้าง userId โดยใช้ id ของ socket

    // เพิ่มผู้ใช้เข้ารายการของผู้ใช้ที่ออนไลน์
    onlineUsers.add(userId);
    // ส่งรายชื่อผู้ใช้ที่ออนไลน์ให้กับผู้ใช้ทั้งหมดที่เข้าเว็บไซต์
    io.emit('update-online-users', Array.from(onlineUsers));

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(userId);
        socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has joined the room.` });
        io.to(socket.id).emit('join-room');
    });

    // เมื่อมีการสร้างห้อง ให้ส่งข้อมูลกลับไปยังผู้เรียกใช้งานเพื่อแสดงห้องที่สร้างแล้ว
socket.on('create-room', (roomName) => {
    const roomId = uuidv4();
    rooms.set(roomId, { name: roomName, users: new Set() });
    io.emit('room-created', { roomId, roomName }); // ใช้ io.emit แทน socket.emit
});

// เมื่อมีการปิดห้อง ให้ประกาศเหตุการณ์ไปยังผู้ใช้ที่เชื่อมต่อทั้งหมด
socket.on('close-room', (roomId) => {
    rooms.delete(roomId);
    io.emit('room-closed', roomId); // ใช้ io.emit ในการประกาศเหตุการณ์ห้องที่ถูกปิด
});


    socket.on('chat-message', (roomId, userId, msg) => {
        socket.to(roomId).emit('chat-message', { userId, msg });
    });

    socket.on('disconnect', () => {
         // ลบผู้ใช้ออกจากรายการของผู้ใช้ที่ออนไลน์
        onlineUsers.delete(userId);
        // ส่งรายชื่อผู้ใช้ที่ออนไลน์ให้กับผู้ใช้ทั้งหมดที่เข้าเว็บไซต์
        io.emit('update-online-users', Array.from(onlineUsers));
        
        rooms.forEach((users, roomId) => {
            if (users.has(socket.userId)) {
                users.delete(socket.userId);
                socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${socket.userId} has left the room.` });
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
