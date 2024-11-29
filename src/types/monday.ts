export interface MondayBoard {
  id: string;
  name: string;
  description?: string;
  items_count: number;
}

export interface MondayWorkspace {
  id: string;
  name: string;
  description?: string;
}

export interface MondayConfig {
  apiKey: string;
  defaultBoardId?: string;
  workspaceId?: string;
}