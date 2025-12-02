import { Separator } from "@/components/ui/separator"
import { useAppSelector } from "@/hooks"
export function SiteHeader() {

        const User = useAppSelector(state =>state.user.user)

  return (
    <header className="md:mt-20 mt-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className=" md:text-2xl font-medium">Hello<span className="text-pink-500  font-bold" > {User?.Username}</span>, Welcome to your dashboard</h1>
      </div>
    </header>
  )
}
