import { useState, useEffect } from 'react';
import { chatWithAgent, chatWithAgentStream } from '../api/agentApi';

export const AgentChat = ({ agentId }: { agentId: string }) => {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [streamedReply, setStreamedReply] = useState('');

  const handleNonStreamingChat = async () => {
    try {
      const response = await chatWithAgent(agentId, message);
      setReply(response.reply);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const handleStreamingChat = () => {
    setStreamedReply('');
    const cleanup = chatWithAgentStream(
      agentId,
      message,
      (content) => setStreamedReply((prev) => prev + content),
      () => console.log('Stream done')
    );
    return cleanup; // Cleanup function to close EventSource
  };

  useEffect(() => {
    // Call handleStreamingChat when the component mounts or agentId/message changes
    if (message) { // Only start streaming if there's a message
      const cleanup = handleStreamingChat();
      return cleanup; // Return the cleanup function for useEffect
    }
  }, [agentId, message]); // Dependencies: re-run when agentId or message changes

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message agent"
      />
      <button onClick={handleNonStreamingChat}>Send (Non-Streaming)</button>
      <button onClick={handleStreamingChat}>Send (Streaming)</button>
      <p>Reply: {reply}</p>
      <p>Streamed Reply: {streamedReply}</p>
    </div>
  );
};