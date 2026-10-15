import { EyeIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DemoModeBanner() {
  return (
    <Alert>
      <EyeIcon />
      <AlertTitle>Read-only demo</AlertTitle>
      <AlertDescription>
        You can explore every admin screen. Saving changes is disabled for the
        demo account.
      </AlertDescription>
    </Alert>
  )
}
