// shadcn/ui Sonner (Toast), unstyled for now: restyled to the API Contract in roadmap Step 4.
// Takes `theme` as a prop instead of reading next-themes, so no extra dependency.
import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ theme = 'light', ...props }: ToasterProps) {
  return <Sonner theme={theme} className="toaster group" {...props} />
}

export { Toaster }
