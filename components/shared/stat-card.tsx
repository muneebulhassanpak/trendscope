import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {value}
        </CardTitle>
        {detail && (
          <div className="text-sm text-muted-foreground">{detail}</div>
        )}
      </CardHeader>
    </Card>
  )
}
