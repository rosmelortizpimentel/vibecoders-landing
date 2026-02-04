import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UnfollowConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  isLoading?: boolean;
}

export function UnfollowConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading,
}: UnfollowConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="items-center text-center">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
            <AvatarFallback className="text-2xl font-bold bg-gray-100 text-gray-600">
              {user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <AlertDialogTitle className="text-lg">
            {user.name || 'Usuario'}
          </AlertDialogTitle>
          <p className="text-sm text-gray-500">@{user.username || 'usuario'}</p>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-center pt-2">
          ¿Dejar de seguir a @{user.username}?
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
          <AlertDialogCancel 
            className="flex-1 mt-0"
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Procesando...' : 'Dejar de Seguir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
