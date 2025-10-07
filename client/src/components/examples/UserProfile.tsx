import UserProfile from "../UserProfile";

export default function UserProfileExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <UserProfile
        name="Thabo Mokoena"
        email="thabo.mokoena@example.com"
        location="Johannesburg, Gauteng"
        skills={[
          "JavaScript",
          "React",
          "Node.js",
          "TypeScript",
          "Git",
          "Customer Service",
        ]}
        languages={["English", "Zulu", "Afrikaans"]}
        nqfLevel={6}
        experience={[
          {
            role: "Junior Developer",
            company: "Tech Startup SA",
            duration: "2022 - Present",
          },
          {
            role: "IT Support Specialist",
            company: "Local Business",
            duration: "2020 - 2022",
          },
        ]}
        onEdit={() => console.log("Edit profile clicked")}
      />
    </div>
  );
}
