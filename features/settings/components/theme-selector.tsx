"use client"

import { useSyncExternalStore } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

const noopSubscribe = () => () => {}

/** True after hydration; the stored theme is unknown during SSR. */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const hydrated = useHydrated()

  return (
    <ToggleGroup
      variant="outline"
      value={hydrated && theme ? [theme] : []}
      onValueChange={(value) => value[0] && setTheme(value[0])}
      aria-label="Theme"
      className="w-full sm:w-fit"
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="flex-1 sm:flex-none sm:px-4"
        >
          <Icon aria-hidden />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
