import React from 'react'
import { Menu, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface TopbarProps {
  active: string
  onOpenMobile: () => void
  onRefresh: () => void
  refreshed: boolean
  userInitials?: string
}

export function Topbar({
  active,
  onOpenMobile,
  onRefresh,
  refreshed,
  userInitials = 'AM',
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="eyebrow">PRIVATE CLOUD / LAB</div>
          <h1>{active}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="cluster-health">
          <span className="status-dot" /> <span>Cluster</span>{' '}
          <strong>Healthy</strong>
        </div>
        <button className="refresh-button" onClick={onRefresh}>
          <RefreshCw size={15} className={refreshed ? 'spin' : ''} />
          {refreshed ? 'Updated' : 'Refresh'}
        </button>
        <ThemeToggle />
        <div className="top-avatar">{userInitials}</div>
      </div>
    </header>
  )
}