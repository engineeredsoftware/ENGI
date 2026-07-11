import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { log } from '@bitcode/logger';

interface NotionWorkspace {
  id: string;
  name: string;
  icon?: string;
  bot?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  owner_type: 'user' | 'workspace';
  connected_at: string;
}

interface NotionPage {
  id: string;
  title: string;
  type: 'page' | 'database';
  url: string;
  icon?: {
    type: 'emoji' | 'external' | 'file';
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
  last_edited_time: string;
  created_time: string;
  archived: boolean;
  parent: any;
}

interface NotionPickerProps {
  onSelectionChange?: (selectedPages: string[]) => void;
  initialSelection?: string[];
  multiSelect?: boolean;
  filter?: 'page' | 'database' | 'all';
  placeholder?: string;
}

interface PageTableProps {
  pages: NotionPage[];
  selectedPages: string[];
  onSelectionChange: (pageIds: string[]) => void;
  multiSelect: boolean;
}

const PageTable: React.FC<PageTableProps> = ({
  pages,
  selectedPages,
  onSelectionChange,
  multiSelect
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: 'title' | 'type' | 'last_edited_time';
    direction: 'ascending' | 'descending';
  }>({
    key: 'last_edited_time',
    direction: 'descending'
  });

  const ITEMS_PER_PAGE = 10;

  // Apply search filter
  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const lower = search.toLowerCase();
    return pages.filter(page => 
      page.title.toLowerCase().includes(lower) ||
      page.type.toLowerCase().includes(lower)
    );
  }, [pages, search]);

  // Apply sorting
  const sortedPages = useMemo(() => {
    const sorted = [...filteredPages];
    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortConfig.key === 'last_edited_time') {
        aVal = new Date(a.last_edited_time).getTime();
        bVal = new Date(b.last_edited_time).getTime();
      } else {
        aVal = a[sortConfig.key].toLowerCase();
        bVal = b[sortConfig.key].toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPages, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedPages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPages = sortedPages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const handlePageSelect = (pageId: string) => {
    if (multiSelect) {
      const newSelection = selectedPages.includes(pageId)
        ? selectedPages.filter(id => id !== pageId)
        : [...selectedPages, pageId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(selectedPages.includes(pageId) ? [] : [pageId]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getIcon = (page: NotionPage) => {
    if (page.icon?.emoji) return page.icon.emoji;
    if (page.icon?.external?.url) return '🖼️';
    if (page.icon?.file?.url) return '📁';
    return page.type === 'database' ? '🗃️' : '📄';
  };

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search pages and databases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-2 py-3">
                {multiSelect && (
                  <input
                    type="checkbox"
                    checked={selectedPages.length === pages.length && pages.length > 0}
                    indeterminate={selectedPages.length > 0 && selectedPages.length < pages.length}
                    onChange={(e) => {
                      onSelectionChange(e.target.checked ? pages.map(p => p.id) : []);
                    }}
                    className="rounded"
                  />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_edited_time')}
              >
                Last Edited {sortConfig.key === 'last_edited_time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPages.map((page) => (
              <tr 
                key={page.id} 
                className={`hover:bg-gray-50 ${selectedPages.includes(page.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="w-8 px-2 py-4">
                  <input
                    type={multiSelect ? "checkbox" : "radio"}
                    name={multiSelect ? undefined : "notion-page"}
                    checked={selectedPages.includes(page.id)}
                    onChange={() => handlePageSelect(page.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{getIcon(page)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {page.title || 'Untitled'}
                      </div>
                      {page.archived && (
                        <div className="text-xs text-gray-500">Archived</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    page.type === 'database' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {page.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(page.last_edited_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Open in Notion →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedPages.length)} of {sortedPages.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {filteredPages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {pages.length === 0 ? 'No pages found' : 'No pages match your search'}
        </div>
      )}
    </div>
  );
};

const NotionPicker: React.FC<NotionPickerProps> = ({
  onSelectionChange,
  initialSelection = [],
  multiSelect = true,
  filter = 'all',
  placeholder = 'Select Notion pages or databases'
}) => {
  const [connected, setConnected] = useState(false);
  const [workspace, setWorkspace] = useState<NotionWorkspace | null>(null);
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>(initialSelection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Load pages when connected
  useEffect(() => {
    if (connected) {
      loadWorkspaceInfo();
      loadPages();
    }
  }, [connected, filter]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedPages);
  }, [selectedPages, onSelectionChange]);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/notion/connection');
      const data = await response.json();

      if (data.connected && data.connection) {
        setConnected(true);
        setWorkspace({
          id: data.connection.workspace_id,
          name: data.connection.workspace_name,
          icon: data.connection.workspace_icon,
          owner_type: data.connection.owner_type,
          connected_at: data.connection.created_at
        });
      } else {
        setConnected(false);
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err: any) {
      log('[NotionPicker] Failed to check connection status', 'error', { error: err.message });
      setError('Failed to check Notion connection status');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceInfo = async () => {
    try {
      const response = await fetch('/api/integrations/notion/workspaces');
      const data = await response.json();

      if (data.workspace) {
        setWorkspace(data.workspace);
      }
    } catch (err: any) {
      log('[NotionPicker] Failed to load workspace info', 'error', { error: err.message });
    }
  };

  const loadPages = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100'
      });

      if (filter !== 'all') {
        params.set('filter', filter);
      }

      const response = await fetch(`/api/integrations/notion/pages?${params}`);
      const data = await response.json();

      if (data.pages) {
        setPages(data.pages.filter((page: NotionPage) => !page.archived));
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      log('[NotionPicker] Failed to load pages', 'error', { error: err.message });
      setError('Failed to load Notion pages');
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      // Get OAuth URL
      const response = await fetch('/api/integrations/notion/oauth');
      const data = await response.json();

      if (data.authorization_url) {
        // Redirect to Notion OAuth
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || 'Failed to initiate Notion connection');
      }
    } catch (err: any) {
      log('[NotionPicker] Failed to connect to Notion', 'error', { error: err.message });
      setError('Failed to connect to Notion');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/integrations/notion/connection', {
        method: 'DELETE'
      });

      if (response.ok) {
        setConnected(false);
        setWorkspace(null);
        setPages([]);
        setSelectedPages([]);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to disconnect from Notion');
      }
    } catch (err: any) {
      log('[NotionPicker] Failed to disconnect from Notion', 'error', { error: err.message });
      setError('Failed to disconnect from Notion');
    }
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedPages(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Checking Notion connection...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect to Notion
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your Notion workspace to access pages and databases.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              'Connect Notion'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {/* Workspace info */}
      {workspace && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">
                {workspace.icon || '📝'}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {workspace.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Connected {workspace.owner_type === 'workspace' ? 'to workspace' : 'as user'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Selection summary */}
      {selectedPages.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            {selectedPages.length} {multiSelect ? 'items' : 'item'} selected
          </div>
        </div>
      )}

      {/* Pages table */}
      <PageTable
        pages={pages}
        selectedPages={selectedPages}
        onSelectionChange={handleSelectionChange}
        multiSelect={multiSelect}
      />
    </div>
  );
};

export default NotionPicker;