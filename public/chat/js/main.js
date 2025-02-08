const chatForm = document.getElementById('chat-form');
const socket = io();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const commands = ['!req']
const chatMessages = document.querySelector('.chat-messages');
const colorCache = {}; // Store computed colors

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

//returns to /chat/ if the username OR room name is undefined
if (username == undefined || room == undefined) {
  location.href = "/chat/";
}

//function to Join room 
function joinroom() {
  socket.emit('joinRoom', { username, room })
}
socket.emit('request_who_online')

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
})

socket.on('message', message => {
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', event => {
  event.preventDefault();

  const msg = event.target.elements.msg.value;
  if (!commands.includes(msg)) {
    socket.emit('chatMessage', msg);
  } else if (msg == commands[0]) {
    socket.emit('request_who_online');
  }

  event.target.elements.msg.value = '';
  event.target.elements.msg.focus();
})

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
      <p class="meta" style="color: ${hashColor(message.username)}">
          ${message.username} <span style="float: right">${message.time}</span>
      </p>
      <p style="color:#FFFFFF" class="text">${message.text}</p>`;
  
  document.querySelector('.chat-messages').appendChild(div);
}
// add room to DOM
function outputRoomName(room) {
  roomName.innerText = room + " Chat-room";
}

//add users to DOM
function outputUsers(users) {
  console.log(users)
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

function hashColor(username) {
  if (colorCache[username]) return colorCache[username];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360; // Ensures color spread
  const saturation = 70; // Keep colors vibrant
  const lightness = 40; // Adjusted lightness for contrast with #1a1a2e

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  colorCache[username] = color;
  return color;
}

//on error, do something
socket.on('error', error => {
  if (error == "rejoin") {
    joinroom()
  }
});

socket.on('who_all_online', () => {
  
  joinroom()
})

socket.on('disconnect', () => {
  try {
    socket.emit('request_who_online');
  } catch {
    reload();
  }
})
socket.on('clear_old_msgs', () => {
  try {
    const boxes = Array.from(document.getElementsByClassName('message'));
    boxes.forEach(box => {
      box.remove();
    });
  } catch (error) {
    console.log(error)
  }
})