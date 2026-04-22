import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('接続中...');
  // Yjsのテキストオブジェクトを保持するためのRef
  const ytextRef = useRef(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('wss://yjs-travel-app.onrender.com', 'travel-room', ydoc);

    provider.on('status', event => {
      setStatus(event.status === 'connected' ? '🟢 接続済み' : '🔴 切断');
    });

    const ytext = ydoc.getText('content');
    ytextRef.current = ytext;

    // Yjsのデータが変更されたら、ReactのStateに反映
    ytext.observe(() => {
      setText(ytext.toString());
    });

    return () => {
      provider.disconnect();
      ydoc.destroy();
    };
  }, []);

  // テキストエリアが変更されたときの処理
  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText); // 画面をすぐ更新

    const ytext = ytextRef.current;
    if (ytext) {
      // 簡易的に差分ではなく全体を置き換えます（本格的なエディタでは差分のみを更新します）
      ytext.delete(0, ytext.length);
      ytext.insert(0, newText);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>✈️ 旅行プラン共同編集</h1>
      <p>ステータス: <strong>{status}</strong></p>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="みんなで旅行プランを書き込みましょう！"
        style={{ width: '100%', height: '300px', fontSize: '16px', padding: '10px' }}
      />
    </div>
  );
}

export default App;