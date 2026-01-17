import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className={`${dmSans.className} text-4xl font-bold mb-4`}>Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that works for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className={dmSans.className}>Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className={`${dmSans.className} text-4xl font-bold`}>₹0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">2 free mock interviews</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">5 sample questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Basic feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">View last mock results</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button variant="outline" className={`${dmSans.className} w-full`}>Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Starter Plan */}
        <Card className="border-primary ring-2 ring-primary relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className={dmSans.className}>Starter</CardTitle>
            <CardDescription>For serious practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className={`${dmSans.className} text-4xl font-bold`}>₹299</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">10 mock interviews per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Access to 1000+ questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Advanced analytics & progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Detailed feedback reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Topic-wise recommendations</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button className={`${dmSans.className} w-full`}>Choose Starter</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card>
          <CardHeader>
            <CardTitle className={dmSans.className}>Pro</CardTitle>
            <CardDescription>Unlimited everything</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className={`${dmSans.className} text-4xl font-bold`}>₹499</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited mock interviews</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">All Starter features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">HR & behavioral prep</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">1 free resume review per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button variant="outline" className={`${dmSans.className} w-full`}>Choose Pro</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pay per Mock */}
      <Card className="mt-12 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className={dmSans.className}>Pay Per Mock</CardTitle>
          <CardDescription>Try individual mocks without a subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${dmSans.className} text-2xl font-bold`}>₹99</p>
              <p className="text-sm text-muted-foreground">per mock interview</p>
            </div>
            <Button className={dmSans.className}>Buy Now</Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className={`${dmSans.className} text-2xl font-bold mb-8 text-center`}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={`${dmSans.className} font-semibold mb-2`}>Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className={`${dmSans.className} font-semibold mb-2`}>What happens to my free mocks?</h3>
            <p className="text-sm text-muted-foreground">
              Your 2 free mocks are available immediately after signup and never expire. They're yours to use whenever you're ready.
            </p>
          </div>
          <div>
            <h3 className={`${dmSans.className} font-semibold mb-2`}>Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 7-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
