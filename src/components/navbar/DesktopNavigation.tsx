import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { NavigationItem } from "@/lib/types"

type DesktopNavigationProps = {
  items: NavigationItem[]
  ariaLabel: string
  disabledLabel: string
}

export default function DesktopNavigation({
  items,
  ariaLabel,
  disabledLabel,
}: DesktopNavigationProps) {
  return (
    <div aria-label={ariaLabel} className="hidden w-1/2 justify-center lg:flex">
      <ul className="flex items-center gap-6">
        {items.map((item) => (
          <li key={item.id}>
            {item.disabled ? (
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({
                    variant: "link",
                  }),
                  "cursor-not-allowed text-center capitalize opacity-40"
                )}
              >
                {item.title}

                <span className="sr-only"> ({disabledLabel})</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: "link",
                  }),
                  "text-center capitalize"
                )}
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
