// server.js
const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('./node_modules/y-websocket/bin/utils.js');

// HTTPサーバーを立ち上げる（WebSocketの土台）
const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Yjs Local Server is running\n');
});

// HTTPサーバーの上にWebSocketサーバーを乗せる
const wss = new WebSocket.Server({ server });

// クライアント（React）が接続してきたときの処理
wss.on('connection', (conn, req) => {
    console.log('✅ クライアントが接続しました');
    // Yjsのドキュメント同期を自動的にセットアップ
    setupWSConnection(conn, req, { gc: true });
});

// Renderが指定するポート番号、またはローカル用の1234番を使用する
const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
    console.log(`🚀 WebSocketサーバー起動: ポート ${PORT}`);
});