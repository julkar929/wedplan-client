'use client';
import * as React from 'react';
import * as S from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = S.Root;
const SelectValue = S.Value;
function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof S.Trigger>) {
  return (
    <S.Trigger className={cn('flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:truncate', className)} {...props}>
      {children}
      <S.Icon asChild><ChevronDown className="size-4 opacity-50" /></S.Icon>
    </S.Trigger>
  );
}
function SelectContent({ className, children, position = 'popper', ...props }: React.ComponentProps<typeof S.Content>) {
  return (
    <S.Portal>
      <S.Content position={position} className={cn('relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', position === 'popper' && 'data-[side=bottom]:translate-y-1', className)} {...props}>
        <S.Viewport className={cn('p-1', position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]')}>{children}</S.Viewport>
      </S.Content>
    </S.Portal>
  );
}
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof S.Item>) {
  return (
    <S.Item className={cn('relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center"><S.ItemIndicator><Check className="size-4" /></S.ItemIndicator></span>
      <S.ItemText>{children}</S.ItemText>
    </S.Item>
  );
}
export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
