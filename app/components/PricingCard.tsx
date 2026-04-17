import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: Array<{
    name: string
    included: boolean
  }>
  popular?: boolean
  buttonText?: string
  buttonHref?: string
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = 'Get started',
  buttonHref = '/pricing'
}: PricingCardProps) {
  return (
    <div className={`relative rounded-lg border p-6 ${popular ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-border'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-3xl font-bold mt-2">
            {price}
            {price !== 'Custom' && <span className="text-lg font-normal text-muted-foreground">/month</span>}
          </p>
          <p className="text-muted-foreground text-sm mt-2">{description}</p>
        </div>

        <Link
          href={buttonHref}
          className={`block w-full text-center px-4 py-2 rounded-md transition-colors font-medium ${
            popular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'border border-border hover:bg-muted'
          }`}
        >
          {buttonText}
        </Link>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}