import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-base' },
  xl: { container: 'w-20 h-20', text: 'text-xl' },
};

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps) {
  const s = sizes[size];
  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-gray-200 flex-shrink-0', s.container, className)}>
        <Image src={src} alt={`${firstName} ${lastName}`} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center flex-shrink-0',
        s.container, s.text, className,
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
