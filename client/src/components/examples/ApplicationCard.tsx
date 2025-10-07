import ApplicationCard from "../ApplicationCard";

export default function ApplicationCardExample() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <ApplicationCard
        id="1"
        jobTitle="Frontend Developer"
        company="Shoprite Digital"
        status="reviewing"
        appliedAt={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
      />
      <ApplicationCard
        id="2"
        jobTitle="Junior Software Engineer"
        company="MTN Group"
        status="interview"
        appliedAt={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)}
      />
      <ApplicationCard
        id="3"
        jobTitle="Customer Service Representative"
        company="Takealot"
        status="pending"
        appliedAt={new Date(Date.now() - 1 * 60 * 60 * 1000)}
      />
    </div>
  );
}
