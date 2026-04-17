import { ArrowLeft, Check, Zap, Mail, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PricingCard from '../components/PricingCard'

const tiers = [
  {
    title: 'Free',
    price: '$0',
    description: 'Perfect for testing and small personal projects',
    features: [
      { name: '100 requests per month', included: true },
      { name: 'Format conversion', included: true },
      { name: 'Contrast analysis', included: true },
      { name: 'Color harmony generation', included: true },
      { name: 'Color blindness simulation', included: true },
      { name: 'Color manipulation (tint/shade/tone)', included: true },
      { name: 'Palette extraction', included: false },
      { name: 'Priority support', included: false },
      { name: 'Commercial use', included: false }
    ],
    buttonText: 'Get started free',
    buttonHref: 'mailto:support@endpnt.dev?subject=Free API Key Request&body=Please provide me with a free API key for the Color API.'
  },
  {
    title: 'Starter',
    price: '$29',
    description: 'Great for growing applications and businesses',
    popular: true,
    features: [
      { name: '10,000 requests per month', included: true },
      { name: 'Format conversion', included: true },
      { name: 'Contrast analysis', included: true },
      { name: 'Color harmony generation', included: true },
      { name: 'Color blindness simulation', included: true },
      { name: 'Color manipulation (tint/shade/tone)', included: true },
      { name: 'Palette extraction', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Commercial use', included: true }
    ],
    buttonText: 'Start free trial',
    buttonHref: 'mailto:support@endpnt.dev?subject=Starter Plan Request&body=I would like to start a free trial of the Starter plan for the Color API.'
  },
  {
    title: 'Pro',
    price: '$99',
    description: 'For high-volume applications and enterprises',
    features: [
      { name: '100,000 requests per month', included: true },
      { name: 'Format conversion', included: true },
      { name: 'Contrast analysis', included: true },
      { name: 'Color harmony generation', included: true },
      { name: 'Color blindness simulation', included: true },
      { name: 'Color manipulation (tint/shade/tone)', included: true },
      { name: 'Palette extraction', included: true },
      { name: 'Priority support', included: true },
      { name: 'Commercial use', included: true }
    ],
    buttonText: 'Contact sales',
    buttonHref: 'mailto:support@endpnt.dev?subject=Pro Plan Inquiry&body=I am interested in the Pro plan for the Color API. Please contact me about pricing and setup.'
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large-scale implementations',
    features: [
      { name: 'Custom request limits', included: true },
      { name: 'All Color API features', included: true },
      { name: 'Dedicated infrastructure', included: true },
      { name: 'Custom endpoints', included: true },
      { name: 'SLA guarantees', included: true },
      { name: 'Direct technical support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Volume discounts', included: true },
      { name: 'Priority feature requests', included: true }
    ],
    buttonText: 'Contact sales',
    buttonHref: 'mailto:support@endpnt.dev?subject=Enterprise Plan Inquiry&body=I am interested in the Enterprise plan for the Color API. Please contact me to discuss custom requirements.'
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your <span className="text-primary-600">plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core color manipulation features
            with advanced palette extraction available on Starter and above.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-600" />
              <span>Instant setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-600" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-600" />
              <span>Email support</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => (
            <PricingCard key={tier.title} {...tier} />
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Feature comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold">Pro</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4">Monthly requests</td>
                  <td className="p-4 text-center">100</td>
                  <td className="p-4 text-center">10,000</td>
                  <td className="p-4 text-center">100,000</td>
                  <td className="p-4 text-center">Custom</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Format conversion</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Contrast analysis</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Color harmony</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Color blindness simulation</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Color manipulation</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border bg-muted/10">
                  <td className="p-4 font-medium">Palette extraction</td>
                  <td className="p-4 text-center text-muted-foreground">✗</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Support</td>
                  <td className="p-4 text-center">Community</td>
                  <td className="p-4 text-center">Email</td>
                  <td className="p-4 text-center">Priority</td>
                  <td className="p-4 text-center">Dedicated</td>
                </tr>
                <tr>
                  <td className="p-4">Commercial use</td>
                  <td className="p-4 text-center text-muted-foreground">✗</td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-primary-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">What's included in the Free tier?</h3>
              <p className="text-muted-foreground">
                The Free tier includes 100 requests per month with access to all core features:
                format conversion, contrast analysis, color harmony, color blindness simulation,
                and color manipulation. Perfect for testing and small personal projects.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What is palette extraction?</h3>
              <p className="text-muted-foreground">
                Palette extraction analyzes images to identify dominant colors using k-means clustering.
                This feature is ideal for building design systems, analyzing brand colors, or creating
                themed interfaces. It's available on Starter tier and above.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can change your plan at any time. Contact support@endpnt.dev to upgrade
                or downgrade. Changes take effect at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied
                with the service, contact us within 30 days for a full refund.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What happens if I exceed my request limit?</h3>
              <p className="text-muted-foreground">
                If you exceed your monthly request limit, additional requests will return a rate limit
                error. You can upgrade your plan or wait until the next billing cycle resets your limit.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is there an SLA for uptime?</h3>
              <p className="text-muted-foreground">
                Pro and Enterprise plans include SLA guarantees. We maintain 99.9% uptime for all
                production services with monitoring and alerting systems in place.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-muted/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to start building?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join developers and designers using the Color API for accessibility tools,
            design systems, and creative applications.
          </p>
          <Link
            href="mailto:support@endpnt.dev?subject=API Key Request&body=I would like to get started with the Color API. Please provide me with an API key."
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium text-lg"
          >
            <Mail className="h-5 w-5" />
            Get your API key
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}