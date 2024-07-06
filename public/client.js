const socket = io();
let roomId;
let userId;

document.getElementById('join-room-button').addEventListener('click', () => {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('room-selection-page').style.display = 'block';
});

document.getElementById('create-room-button').addEventListener('click', () => {
    createRoom();
});
// เมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', () => {
    // ขอข้อมูลห้องทั้งหมดจากเซิร์ฟเวอร์
    socket.emit('get-all-rooms');

    // ฟังก์ชันที่เรียกเมื่อได้รับข้อมูลห้องทั้งหมด
    socket.on('all-rooms', (rooms) => {
        const existingRoomsContainer = document.getElementById('existing-rooms');
        existingRoomsContainer.innerHTML = ''; // ล้างข้อมูลเก่าทิ้ง

        rooms.forEach(({ roomId, roomName }) => {
            const roomButton = createRoomButton(roomId, roomName);
            existingRoomsContainer.appendChild(roomButton);
        });
    });
});

function createRoomButton(roomId, roomName) {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.addEventListener('click', () => {
        joinRoom(roomId);
    });
    return roomButton;
}


function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
    document.getElementById('home-page').style.display = 'none';
    joinRoom(roomName);
}

socket.on('room-created', ({ roomId, roomName }) => {
    const existingRoomsContainer = document.getElementById('existing-rooms');
    const roomButton = createRoomButton(roomId, roomName);
    existingRoomsContainer.appendChild(roomButton);
});


document.getElementById('enter-room-button').addEventListener('click', () => {
    const userName = document.getElementById('user-name').value;
    const roomName = document.getElementById('room-name').value;
    if (userName.trim() && roomName.trim()) {
        userId = userName;
        joinRoom(roomName);
    }
});

function joinRoom(roomName) {
    roomId = roomName; // Just for the sake of this example, you might need a better way to handle roomIds
    userId = socket.id;
    socket.emit('join-room', roomId, userId);

    // Update UI to show chat room and user display name
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('room-selection-page').style.display = 'none';
    document.getElementById('chat-room-section').style.display = 'block';
}

socket.on('join-room', () => {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('room-selection-page').style.display = 'none';
    document.getElementById('chat-room-section').style.display = 'block';
});
// รับข้อมูลผู้ใช้ที่อยู่ในเว็บไซต์
socket.on('update-online-users', (users) => {
    const onlineUsersContainer = document.getElementById('online-users');
    onlineUsersContainer.innerHTML = ''; // ล้างข้อมูลเก่าทิ้ง
    const usersList = document.createElement('ul');

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        usersList.appendChild(userItem);
    });

    onlineUsersContainer.appendChild(usersList);
});


document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        // Send message to server
        socket.emit('chat-message', roomId, userId, message);
        
        // Display user's message in chat display
        const userMessageElement = document.createElement('div');
        userMessageElement.textContent = `You: ${message}`;
        document.getElementById('chat-display').appendChild(userMessageElement);

        // Clear message input field
        document.getElementById('message-input').value = '';
    }
});


socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});





