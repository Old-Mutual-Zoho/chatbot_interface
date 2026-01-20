import { Outlet } from 'react-router-dom';
import { ChatWidget } from '../chat/components/ChatWidget';
import './AppShell.css';
import '../styles/pages.css';

export default function AppShell() {
  return (
    <div className="app-shell om-chat-background">
      <main className="app-shell__main">
        <Outlet />
      </main>

      <ChatWidget defaultOpen={false} defaultView="landing" />
    </div>
  );
}
