export interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}
