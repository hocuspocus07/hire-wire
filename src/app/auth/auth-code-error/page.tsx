export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 rounded-xl bg-white shadow-sm border text-center">
        <h1 className="text-xl font-semibold text-red-600 mb-2">
          Authentication Failed
        </h1>
        <p className="text-gray-600">
          Something went wrong while completing your sign-in. Try again or request a new link.
        </p>
      </div>
    </div>
  )
}
