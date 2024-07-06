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

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
    document.getElementById('home-page').style.display = 'none';
    joinRoom(roomName);
}

socket.on('room-created', ({ roomId, roomName }) => {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.setAttribute('data-room-id', roomId); // เพิ่ม attribute เพื่อเก็บ roomId ไว้กับปุ่ม
    roomButton.addEventListener('click', () => {
        joinRoom(roomName);
    });
    document.getElementById('existing-rooms').appendChild(roomButton);
});

socket.on('room-deleted', (roomId) => {
    const roomButtonToRemove = document.querySelector(`button[data-room-id="${roomId}"]`);
    if (roomButtonToRemove) {
        roomButtonToRemove.remove();
    }
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





