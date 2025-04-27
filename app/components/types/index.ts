import { ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface SelectProps<T> extends BaseProps {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}

export interface SearchProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
