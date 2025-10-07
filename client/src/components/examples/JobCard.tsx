import JobCard from "../JobCard";

export default function JobCardExample() {
  return (
    <JobCard
      id="1"
      title="Frontend Developer"
      company="Shoprite Digital"
      salary="R25,000 - R35,000"
      location="Cape Town, Western Cape"
      skills={["React", "TypeScript", "Tailwind CSS", "Node.js", "Git"]}
      description="Join our dynamic team building the next generation of e-commerce solutions for South Africa. We're looking for a passionate frontend developer with experience in modern web technologies."
      onSkip={() => console.log("Skipped job")}
      onApply={() => console.log("Applied to job")}
    />
  );
}
