import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeSelector } from "@/features/settings/components/theme-selector"

export function AppearanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Saved in this browser. System follows your OS setting.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ThemeSelector />
        <p className="text-muted-foreground">
          Tip: press{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            D
          </kbd>{" "}
          anywhere to toggle light and dark.
        </p>
      </CardContent>
    </Card>
  )
}
