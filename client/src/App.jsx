import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

function App() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('接続中...');
    const ytextRef = useRef(null);

    // ユーザー情報のState
    const [myName, setMyName] = useState(localStorage.getItem('userName') || '');
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider('wss://yjs-travel-app.onrender.com', 'travel-room', ydoc);

        // --- 【追加】ユーザー名の設定 ---
        let currentName = myName;
        if (!currentName) {
            currentName = prompt('あなたの表示名を入力してください') || `ゲスト${Math.floor(Math.random() * 100)}`;
            setMyName(currentName);
            localStorage.setItem('userName', currentName);
        }

        // --- 【追加】自分の状態（名前と色）を他のユーザーに知らせる ---
        provider.awareness.setLocalStateField('user', {
            name: currentName,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16) // ランダムな色を割り当て
        });

        // --- 【追加】誰かが入室・退室・変更した時に実行される ---
        provider.awareness.on('change', () => {
            // 現在接続中の全員の状態を取得
            const states = Array.from(provider.awareness.getStates().values());
            // 'user' 情報を持っている人だけをリスト化してStateに入れる
            const users = states.map(s => s.user).filter(u => u !== undefined);
            setActiveUsers(users);
        });

        provider.on('status', event => {
            setStatus(event.status === 'connected' ? '🟢 接続済み' : '🔴 切断');
        });

        const ytext = ydoc.getText('content');
        ytextRef.current = ytext;

        ytext.observe(() => {
            setText(ytext.toString());
        });

        return () => {
            provider.disconnect();
            ydoc.destroy();
        };
    }, []); // 最初の1回だけ実行

    const handleChange = (event) => {
        const newText = event.target.value;
        setText(newText);
        const ytext = ytextRef.current;
        if (ytext) {
            ytext.delete(0, ytext.length);
            ytext.insert(0, newText);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1>✈️ 旅行プラン共同編集</h1>

            {/* --- 【追加】参加者一覧を表示するUI --- */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>参加中:</span>
                {activeUsers.map((user, i) => (
                    <div key={i} style={{
                        backgroundColor: user.color,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {user.name} {user.name === myName && '(自分)'}
                    </div>
                ))}
            </div>

            <p>ステータス: <strong>{status}</strong></p>
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="みんなで旅行プランを書き込みましょう！"
                style={{ width: '100%', height: '300px', fontSize: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />

            {/* 名前をリセットするボタン（動作確認用） */}
            <button
                onClick={() => { localStorage.removeItem('userName'); window.location.reload(); }}
                style={{ marginTop: '10px', fontSize: '10px', color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                名前を変更する
            </button>
        </div>
    );
}

export default App;