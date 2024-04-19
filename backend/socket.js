let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origins: 'http://localhost:3000',
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket is not init');
    }
    return io;
  },
};
