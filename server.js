//TODO:
//ion have internet, why doesnt chat work??
//<> DOWNLOAD THE FILE FOR THE HEADER THINGY IT DOESNT WORK IF THERES NO INTERNET T.T (its like sum angular)
//<> publish
//<> make the video uploader thingy. cant be too hard
//<> music page or like add a thing for mp3 files INTO the media page
//<> offline users thingamajing in the chat page
//<> add like specifc ratios where the media page allows the webpage to put more width
//<> add views to media page
//<difficult> all the short videos to be stacked together in like one row/coloumn cus it looks weird rn
//<time consuming> make a page to search for videos/music on yt then select it to download to the website and then play it
//same thing with videos <--- ???
//<sorta important> limit the storage usage by the website
const port = 80;
const express = require('express');
const favicon = require('serve-favicon')
const serveIndex = require('serve-index')
const morgan = require('morgan')
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path')
const app = express();
const clas = './public/class/';
const media = './public/media/';
const compression = require('compression');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const thumbnails = './public/thumbnails/'
const { exec } = require("child_process"); // execute thing for the download thing
ffmpeg.setFfmpegPath(ffmpegPath);
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


//chat things
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers, resetusers } = require('./utils/users');
const botname = 'patch bot'
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const readline = require('readline');
//not chat things

let counter = 0;

//read file first then put the values into const "usrs"
//cus usrs is empty at first
//then emit this as new value or like make them read the file on client side and display it on the side
//eeeepyyyy
async function fullusers() {
  const fileStream = fs.createReadStream('./public/chat/messages.json');
  const stream = fs.createWriteStream("./public/chat/users.json", { flags: 'a' });
  const usrs = [];
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    // Each line in fileStream(messages.json) will be successively available here as `line`.
    var obj = JSON.parse(line);
    if (!usrs.includes(obj.username+'\n')) {
      usrs.push(obj.username+'\n');
      console.log(obj.username);
    }
  }
  stream.write(usrs+'\n');
}
//fullusers()

function redirect(req, res, next) {
  const link_url = req.url;
  if (link_url.includes('index') || link_url.includes('index.html')) {
    const link_url_without = link_url.substr(0, link_url.lastIndexOf("index"));
    res.redirect(link_url_without)
  }
  if (link_url.includes('.html') || link_url.includes('.htm')) {
    const link_url_without = link_url.substr(0, link_url.lastIndexOf("."));
    res.redirect(link_url_without)
  } else {
    next()
  }
}

morgan.token('date', function getDaate() {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  newdate = year + "/" + month + "/" + day;
  return newdate;
})

app.enable("trust proxy");//what is this??
app.use(redirect);
app.use(compression());//compress
app.use(morgan('dev')) // logs requests
app.use(morgan(':remote-addr :date :method :url :status"', { stream: accessLogStream }))
app.use(fileUpload()); // allows file uploads, used in /upload/
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))//serves favicon icon
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public", { extensions: ['html', 'htm'] }));//serves static html files in /public/
app.use('/websites', serveIndex(__dirname + '/public/websites/'));//serves the websites in /public/websites at /websites/
app.set('view engine', 'ejs');//used for 404


//runs on 'connection'(client connection)
io.on('connection', socket => {
  //runs on 'joinRoom'
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room);

    async function historymsgs() {
      const fileStream = fs.createReadStream('./public/chat/messages.json');
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      socket.emit('clear_old_msgs')
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.

      for await (const line of rl) {
        // Each line in fileStream(messages.json) will be successively available here as `line`.
        socket.emit('message', JSON.parse(line));
      }
      //Welcome message
      socket.emit('message',formatMessage(botname,'Welcome to "'+user.room+'" chat room,<p style="color:light-grey"><i><b>'+user.username+'</b></i></p> This Is A Special Place To Chat and just Chill!'));
    }
    historymsgs();

    //broadcasts to others that a user has joined
    socket.broadcast.to(user.room).emit
      ('message', formatMessage(botname, `${user.username} has joined ` + user.room + ` Chat-room`));

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //runs on 'chatMessage' (message recieved from client)
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    const stream = fs.createWriteStream("./public/chat/messages.json", { flags: 'a' });
    try {
      const format_msg = formatMessage(user.username, msg)
      io.to(user.room).emit('message', format_msg);
      stream.write(JSON.stringify(format_msg) + '\n')
    } catch {
      stream.end()
      socket.emit('error', 'rejoin');
    }
  })

  //runs on (client) disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      console.log(`${user.username} has left the chat`)
      io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left the chat`))

      //Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
  //runs when a user requests who all are online
  socket.on('request_who_online', () => {
    //resets user array
    resetusers();
    //emits to all users to reply if they are online
    socket.emit('who_all_online')
    
  })
});

app.get("/class", (req, res) => {
  res.write('<!DOCTYPE html>\n')
  res.write('<html lang="en" data-ng-app="foo">\n')
  res.write('<title>Patch Space</title>')
  res.write('<link rel="stylesheet" href="/styles.scripts/button.css">\n')
  res.write('<style>body{text-align:center;}.button {font-size: 200%;padding: 32px 64px;margin: 10px 10px;}</style>\n')
  res.write(`<ng-include src="'/header'"></ng-include> <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js"></script> <!-- <html lang="en" ng-app="foo"> --> <script type="text/javascript"> var app = angular.module("foo", []); </script>`)
  fs.readdirSync(clas).forEach(file => {
    const filename = file.substring(0, file.lastIndexOf("."));
    const fil = "'" + filename + "'"
    res.write('<button class="rgreen button shadow" onclick="location.href=' + fil + '">' + filename + '</button>\n')
  })
  res.end('</body>');
})


app.get("/media", (req, res) => {
  res.set("Content-Type", "text/html");
  res.write('<!DOCTYPE html>\n')
  res.write('<html lang="en" data-ng-app="foo">\n')
  res.write('<link rel="stylesheet"href="/styles.scripts/media.css"/>')
  res.write('<title>Patch Space</title>')
  res.write(`<ng-include src="'/header'"></ng-include> <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js"></script> <!-- <html lang="en" ng-app="foo"> --> <script type="text/javascript"> var app = angular.module("foo", []); </script>`)
  res.write('<h1 class="drop" style="--order: 1; text-align: center;">Videos (Click To Play)</h1>')
  res.write('<div class="media">')
  fs.readdirSync(media).forEach(file => {
    if (!fs.existsSync(thumbnails+file+'.png')) {
      ffmpeg(media+file).screenshots({
        timemarks: [2],
        filename: file+'.png',
        folder: thumbnails,
      });
    } else {
      var ext = path.extname(file);
      if (ext == ".mp4" || ext == ".mp3" || ext == ".ogg") {
        res.write("<a href='/media_player?v=" + file + "'><img class='media video'style='max-height: 500px;'src='/thumbnails/"+file+".png'></img></a>")
      }
    }
  })
  res.write('<h1 class="drop" style="--order: 1; text-align: center;">Photos</h1>')
  fs.readdirSync(media).forEach(file => {
    let ext = path.extname(file);
    if (ext == ".jpeg" || ext == ".jpg" || ext == ".png") {
      res.write("<img class='media photo' src='" + file + "'>")
    }
  })
  res.end("</div>");
})

app.get("/media_player",(req,res) => {
  let v = req.query.v;
  if (typeof v == 'undefined'){
    res.redirect("/media")
  }else{
  res.set("Content-Type", "text/html");
  //MAIN VIDEO PLAYER
  if (typeof v !== 'undefined') {
    let vid;
    fs.readdirSync(media).every(file => {
      if (v == file) {
        vid = true;
      }
      return true;
    })
    if (vid == true) {
      let ext = path.extname(v);
      if (ext == ".mp4" || ext == ".mp3" || ext == ".ogg") {
        
        res.write(`<!DOCTYPE html><html lang="en" data-ng-app="foo"><head>`)
        res.write(`<meta charset="UTF-8"><title>Video Player</title>`)
        res.write(`<ng-include src="'/header'"></ng-include> <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js"></script><script type="text/javascript"> var app = angular.module("foo", []); </script>`)
        res.write(`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Raleway:wght@200&display=swap" rel="stylesheet">`)
        res.write(`<link rel="stylesheet" href="/styles.scripts/player.css">`)
        res.write(`</head><body>`)
        res.write(`<div id="main_vid_bg"><video id="main_vid" src='/media/`+v+`' autoplay controls preload=auto onloadstart='this.volume=0.224' poster=""></video><h1 id="main_vid_title">`+v.substr(0, v.lastIndexOf('.'))+`</h1></div>`)
        res.write('</body></html>')
      }
    }else{
      res.redirect("/media")
      return
    }
  }
  res.write('<div id="scroll">')
  fs.readdirSync(media).forEach(file => {
    if (!fs.existsSync(thumbnails+file+'.png')) {
      ffmpeg(media+file).screenshots({
        timemarks: [2],
        filename: file+'.png',
        folder: thumbnails,
      });
    } else {
      var ext = path.extname(file);
      if (v !== file && ext == ".mp4" || ext == ".mp3" || ext == ".ogg") {
//        res.write("<img class='media video'style='max-height: 500px;'src='/thumbnails/"+file+".png'></img></a>")
        res.write("<a href='/media_player?v=" + file + "'><div class='div_of_vid'><img class='vid' src='/thumbnails/"+file+".png'></img><h2 class='vid_title'>"+file.substring(0, file.lastIndexOf('.'))+"</h2></div>");
      }
    }
  })
  res.write('</div>')
  //NOT MAIN VIDEO PLAYER
  res.end(`</body></html>`)
}})

app.get("/", (req, res) => {
  res.sendFile("/index")
})


app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.redirect('/projects/upload');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/public/media/' + sampleFile.name;
  let ext = sampleFile.name.split('.').pop()
  // Use the mv() method to place the file somewhere on your server
  fs.readdirSync(media).forEach(file => {
    if (fs.existsSync(uploadPath)) {
      counter++;
      if(ext == "html","js","css") {
        uploadPath = __dirname + '/public/projects/' + counter + sampleFile.name;
      } else {
        uploadPath = __dirname + '/public/media/' + counter + sampleFile.name;
      }
    }
  });
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.redirect('/projects/upload');

    res.redirect('/media');
  });
});
//brooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
//complete this btw brooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
app.get("projects", (req, res) => {
  res.set("Content-Type", "text/html");
  res.write('<!DOCTYPE html>\n')
  res.write('<html lang="en" data-ng-app="foo">\n')
  res.write('<link rel="stylesheet"href="/styles.scripts/media.css"/>\n')
  res.write('<title>Patch Space</title>\n')
  res.write(`<ng-include src="'/header'">\n</ng-include>\n <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js">\n</script>\n <script type="text/javascript">\n var app = angular.module("foo", []);\n</script>\n`)
  res.write('<h1 class="drop" style="--order: 1; text-align: center;">Projects</h1>')
})

app.get("yt-dlp",(req, res) => {
  res.set("Content-Type", "text/html");
  res.write('<!DOCTYPE html>\n')
  res.write('<html lang="en" data-ng-app="foo">\n')
  res.write('<link rel="stylesheet"href="/styles.scripts/media.css"/>\n')
  res.write('<title>Patch Space</title>\n')
  res.write(`<ng-include src="'/header'">\n</ng-include>\n <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js">\n</script>\n <script type="text/javascript">\n var app = angular.module("foo", []);\n</script>\n`)
  res.write('<h1 class="drop" style="--order: 1; text-align: center;">Projects</h1>')
})


app.use(function(req, res, next) {
  res.status(404);
  //respond with 404.ejs
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
})



server.listen(port,"0.0.0.0");
console.log("server on port " + port);
