import { DynamicPage } from "@/components/DynamicPage";
import { SubmissionForm } from "@/components/submit/SubmissionForm";

export const metadata = {
  title: "Submit Your Writing — Memshaheb",
};

export default function SubmitWritingPage() {
  return (
    <div className="space-y-12">
      <DynamicPage slug="submit-writing" />
      <SubmissionForm />
    </div>
  );
}
