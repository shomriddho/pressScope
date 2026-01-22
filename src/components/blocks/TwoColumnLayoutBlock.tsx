import PageContent from '@/components/layout/PageContent'

interface TwoColumnLayoutBlockProps {
  leftColumn: any[]
  rightColumn: any[]
  locale: string
}

export default function TwoColumnLayoutBlock({
  leftColumn,
  rightColumn,
  locale,
}: TwoColumnLayoutBlockProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-3">
      <div>
        <PageContent content={leftColumn} locale={locale} />
      </div>
      <div>
        <PageContent content={rightColumn} locale={locale} />
      </div>
    </div>
  )
}
