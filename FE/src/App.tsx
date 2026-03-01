import { WorkReportForm } from "./components/work-report"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <div className="flex min-h-svh w-full items-top justify-center p-6 md:p-10 bg-slate-100">
        <div className="w-full max-w-md">
          <WorkReportForm />
        </div>
      </div>
    </QueryClientProvider>
  )
}
