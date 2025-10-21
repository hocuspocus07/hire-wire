"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl text-center font-bold">Privacy Policy</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Last updated: October 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
          <p>
            HireWire ("we", "our", "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our AI-powered interview platform ("Service"). By using our Service, you agree to the practices described in this Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Account Information:</strong> Name, email, role (candidate/interviewer), and password.</li>
            <li><strong>Interview Data:</strong> Responses, recordings, performance metrics, AI feedback.</li>
            <li><strong>Usage Data:</strong> IP address, device info, browser type, pages visited, and interactions.</li>
            <li><strong>Cookies and Tracking:</strong> Session tokens, analytics cookies, and similar tracking technologies.</li>
          </ul>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and maintain the Service.</li>
            <li>To personalize and improve your experience.</li>
            <li>To send account-related updates and notifications.</li>
            <li>For security, fraud detection, and abuse prevention.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information in these cases:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>With service providers who help operate our platform.</li>
            <li>When required by law or to protect our rights.</li>
            <li>In connection with a business transfer, merger, or acquisition.</li>
            <li>Aggregated or anonymized data for analytics and research.</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Data Retention</h2>
          <p>We retain your data for as long as your account exists or as necessary to comply with legal obligations and enforce our agreements.</p>

          <h2 className="text-xl font-semibold">5. Your Privacy Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights including access, correction, deletion, objection to processing, and portability. Contact us at <a className="text-primary hover:underline" href="mailto:support@hirewire.ai">support@hirewire.ai</a> to exercise your rights.
          </p>

          <h2 className="text-xl font-semibold">6. Security</h2>
          <p>We use reasonable safeguards to protect your information, but no system is completely secure.</p>

          <h2 className="text-xl font-semibold">7. Cookies</h2>
          <p>We use cookies to enhance your experience, remember preferences, and analyze usage. You can control cookies through your browser settings.</p>

          <h2 className="text-xl font-semibold">8. International Users</h2>
          <p>By using the Service, you consent to the transfer of your data to countries with different data protection laws, including the US.</p>

          <h2 className="text-xl font-semibold">9. Children’s Privacy</h2>
          <p>The Service is not directed at children under 13 (or applicable age in your country). We do not knowingly collect information from children.</p>

          <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. Continued use of the Service constitutes acceptance of changes.</p>

          <h2 className="text-xl font-semibold">11. Contact Us</h2>
          <p>Questions or concerns? Contact: <a className="text-primary hover:underline" href="mailto:support@hirewire.ai">support@hirewire.ai</a></p>
        </CardContent>
      </Card>
    </div>
  )
}
