const moment = require('moment');


function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('dddd DD MMM Y HH:mm a')
  }
}

module.exports = formatMessage;