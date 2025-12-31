import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/primitives/animate/tabs'

export default function ProfileLayout(props: any) {
  const { general, likes, dislikes, comments, children } = props
  return (
    <div>
      {children}
      <Tabs className="max-w-4xl mx-auto" defaultValue="general">
        <TabsHighlight className="bg-background absolute z-0 inset-0">
          <TabsList className="h-10 inline-flex p-1 bg-accent w-full">
            <TabsHighlightItem value="general" className="flex-1">
              <TabsTrigger value="general" className="h-full px-4 py-2 leading-0 w-full text-sm">
                General
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="comments" className="flex-1">
              <TabsTrigger value="comments" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Comments
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="likes" className="flex-1">
              <TabsTrigger value="likes" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Likes
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="dislikes" className="flex-1">
              <TabsTrigger value="dislikes" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Dislikes
              </TabsTrigger>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        <TabsContents className="bg-background p-3 border-4 border-accent border-t-0">
          <TabsContent value="general" className="space-y-4">
            {general}
          </TabsContent>
          <TabsContent value="comments" className="space-y-4">
            {comments}
          </TabsContent>
          <TabsContent value="likes" className="space-y-4">
            {likes}
          </TabsContent>
          <TabsContent value="dislikes" className="space-y-4">
            {dislikes}
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}
