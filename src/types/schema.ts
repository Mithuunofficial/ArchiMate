export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  nullable?: boolean;
  references?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  description?: string;
  columns: ColumnDefinition[];
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
}
