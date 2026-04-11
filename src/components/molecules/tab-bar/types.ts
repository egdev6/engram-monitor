export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}
