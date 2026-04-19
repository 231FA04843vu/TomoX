import { Link } from "react-router-dom";

export default function SupportHelpSteps() {
  return (
    <div className="support-help-steps bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Help - Quick Steps</h2>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        <li>Check your Orders page for live tracking and updates.</li>
        <li>Confirm your delivery address and phone number are correct.</li>
        <li>If a payment failed, wait 5 minutes and try again.</li>
        <li>For missing items, review the order details and contact the restaurant.</li>
        <li>Refunds can take 3-5 business days to appear in your account.</li>
      </ol>
      <p className="text-sm text-gray-600 mt-4">
        Need more help? Raise a ticket from the Support page.
      </p>
      <Link
        to="/support"
        className="inline-block mt-3 text-orange-600 underline font-medium hover:text-orange-700"
      >
        Go to Support
      </Link>
    </div>
  );
}
