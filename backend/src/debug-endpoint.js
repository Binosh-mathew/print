// Debug endpoint for Socket.IO connections
app.get("/api/socket-debug", (req, res) => {
  try {
    const socketInfo = {
      socketRunning: !!io,
      connections: io ? io.engine.clientsCount : 0,
      rooms: io ? Array.from(io.sockets.adapter.rooms.keys())
        .filter(room => !room.match(/^[a-zA-Z0-9]{20}$/)) // Filter out socket IDs
        : [],
      namespaces: Object.keys(io?.nsps || {}),
      corsConfig: io?.corsConfig || io?._corsConfig || "Not available",
      transports: io?.opts?.transports || "Not available",
      path: io?.path || "Not available",
      serverInfo: {
        version: process.version,
        socketIOVersion: require('socket.io/package.json').version,
        env: process.env.NODE_ENV,
        port: PORT,
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
      }
    };
    
    res.json({
      success: true,
      message: "Socket.IO debug information",
      data: socketInfo
    });
  } catch (error) {
    console.error("Error generating Socket.IO debug info:", error);
    res.status(500).json({
      success: false,
      message: "Error generating debug info",
      error: error.message
    });
  }
});
