/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CreateTaskModal } from './components/CreateTaskModal';
import { Header } from './components/Header';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { ProgressOverview } from './components/ProgressOverview';
import { Sidebar } from './components/Sidebar';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { ToastBanner } from './components/ToastBanner';
import { Toolbar } from './components/Toolbar';
import { TaskProvider, useTasks } from './store/TaskContext';

function WorkspaceShell() {
  const { viewMode } = useTasks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-[#0B0E14] text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="max-w-[1440px] mx-auto space-y-5">
            <ProgressOverview />
            <Toolbar />
            {viewMode === 'list' ? <ListView /> : <KanbanView />}
          </div>
        </main>
      </div>

      <TaskDetailDrawer />
      <CreateTaskModal />
      <ToastBanner />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <WorkspaceShell />
    </TaskProvider>
  );
}
