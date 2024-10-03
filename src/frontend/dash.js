import React, { useState } from 'react';
import './CodeEditorInterface.css'; // Assuming you have a CSS file for styles

const CodeEditorInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRepo1Open, setIsRepo1Open] = useState(false);
  const [isRepo2Open, setIsRepo2Open] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChatSend = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, { text: chatMessage, timestamp: new Date().toLocaleTimeString() }]);
      setChatMessage('');
    }
  };

  return (
    <div className="code-editor-interface">
      <div className="row">
        <div className="left-section">
          <div className="project-header">
            <h2>Project Name</h2>
            <button className="dropdown-button">Config</button>
          </div>
          <input
            type="text"
            placeholder="Type here to filter list"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <div className="collapsible-tree">
            <div onClick={() => setIsRepo1Open(!isRepo1Open)} className="tree-label">Sample Repository</div>
            {isRepo1Open && (
              <div className="tree-branches">
                <div>Branch 1</div>
                <div>Branch 2</div>
                <div>Sub-branch 1</div>
              </div>
            )}
          </div>
          <div className="collapsible-tree">
            <div onClick={() => setIsRepo2Open(!isRepo2Open)} className="tree-label">Sample Repository_2</div>
            {isRepo2Open && (
              <div className="tree-branches">
                <div>Branch A</div>
                <div>Branch B</div>
              </div>
            )}
          </div>
        </div>

        <div className="center-section">
          <div className="command-bar">
            <h3>What would you like me to do for you?</h3>
            <div className="command-buttons">
              <button>Make</button>
              <button>Modify</button>
              <button>Test</button>
              <button>Document</button>
            </div>
          </div>
          <div className="code-editor">
            {/* Code editor component with syntax highlighting */}
            <textarea placeholder="Write your code here..." />
          </div>
        </div>

        <div className="right-section">
          <div className="chat-interface">
            <h3>Group Chat</h3>
            <div className="date-label">Nov. 11, 2023</div>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <div className="avatar">👤</div>
                  <div className="message-content">
                    <span className="user-name">User</span>
                    <span className="timestamp">{msg.timestamp}</span>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              className="chat-input"
            />
          </div>
        </div>
      </div>

      <div className="footer">
        <h4>Status messages</h4>
      </div>
    </div>
  );
};

export default CodeEditorInterface;