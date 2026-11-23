'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

const DropdownMenu = D.Root;
const DropdownMenuTrigger = D.Trigger;
function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Content sideOffset={sideOffset} className={cn('z-50 min-w-56 overflow-hidden rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...props} />
    </D.Portal>
  );
}
const DropdownMenuItem = ({ className, ...p }: React.ComponentProps<typeof D.Item>) => (
  <D.Item className={cn("relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none select-none focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground", className)} {...p} />
);
const DropdownMenuLabel = ({ className, ...p }: React.ComponentProps<typeof D.Label>) => <D.Label className={cn('px-2.5 py-2 text-sm font-medium', className)} {...p} />;
const DropdownMenuSeparator = ({ className, ...p }: React.ComponentProps<typeof D.Separator>) => <D.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...p} />;
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
