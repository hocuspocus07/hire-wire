"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl text-center font-bold">Terms of Service</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Last updated: October 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
          <p>
            Welcome to HireWire. These Terms of Service ("Terms") govern your use of our AI-powered interview platform ("Service"). By accessing or using the Service, you agree to comply with these Terms.
          </p>

          <h2 className="text-xl font-semibold">1. Accounts</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You must provide accurate, complete information during registration.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>

          <h2 className="text-xl font-semibold">2. Use of Service</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>The Service is for lawful purposes only. You may not use it to harass, harm, or defraud others.</li>
            <li>You may not attempt to reverse-engineer, disrupt, or abuse the Service.</li>
            <li>The AI is a tool for interview practice and evaluation; results are not legally binding employment decisions.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. User Content</h2>
          <p>
            You retain ownership of content you submit (e.g., answers, recordings). By submitting, you grant HireWire a worldwide license to use, store, and process content to provide the Service.
          </p>

          <h2 className="text-xl font-semibold">4. Payments</h2>
          <p>Any paid features will be governed by separate agreements. Refunds are at our discretion.</p>

          <h2 className="text-xl font-semibold">5. Termination</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>We may suspend or terminate accounts for violations of these Terms.</li>
            <li>You may terminate your account at any time by contacting support.</li>
            <li>Termination does not relieve you of obligations accrued prior to termination.</li>
          </ul>

          <h2 className="text-xl font-semibold">6. Disclaimers</h2>
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee accuracy, reliability, or suitability for employment decisions.</p>

          <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, HireWire and its affiliates are not liable for indirect, incidental, or consequential damages arising from use of the Service.</p>

          <h2 className="text-xl font-semibold">8. Indemnification</h2>
          <p>You agree to indemnify HireWire against any claims, damages, or expenses arising from your violation of these Terms or misuse of the Service.</p>

          <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
          <p>We may update these Terms. Continued use constitutes acceptance of the revised Terms.</p>

          <h2 className="text-xl font-semibold">10. Governing Law</h2>
          <p>These Terms are governed by the laws of the state of [Your State], US, except where local law applies differently.</p>

          <h2 className="text-xl font-semibold">11. Contact</h2>
          <p>Questions? Contact <a className="text-primary hover:underline" href="mailto:support@hirewire.ai">support@hirewire.ai</a></p>
        </CardContent>
      </Card>
    </div>
  )
}
