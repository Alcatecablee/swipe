import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X, MapPin, Languages, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";
import { SA_PROVINCES, SA_MAJOR_CITIES, NQF_LEVELS, SA_LANGUAGES, SA_WORK_AUTH } from "@shared/sa-constants";

const SECTORS = [
  "Tech & IT",
  "Hospitality",
  "E-commerce",
  "Renewable Energy",
  "Healthcare",
  "Finance",
  "Retail",
  "Agriculture",
];

const SKILLS = [
  "JavaScript",
  "React",
  "Python",
  "Node.js",
  "Customer Service",
  "Sales",
  "Marketing",
  "Data Analysis",
  "Project Management",
  "Design",
];

export default function FilterDrawer() {
  const [open, setOpen] = useState(false);
  const [sector, setSector] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState([0, 100000]);
  const [nqfLevel, setNqfLevel] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [workAuth, setWorkAuth] = useState<string>("");

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city)
        ? prev.filter((c) => c !== city)
        : [...prev, city]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const handleApply = () => {
    console.log("Filters applied:", {
      sector,
      province,
      selectedCities,
      selectedSkills,
      salaryRange,
      nqfLevel,
      selectedLanguages,
      workAuth,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSector("");
    setProvince("");
    setSelectedCities([]);
    setSelectedSkills([]);
    setSalaryRange([0, 100000]);
    setNqfLevel("");
    setSelectedLanguages([]);
    setWorkAuth("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          data-testid="button-filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Jobs</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger id="sector" data-testid="select-sector">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Province
            </Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger data-testid="select-province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {SA_PROVINCES.map((prov) => (
                  <SelectItem key={prov.value} value={prov.value}>
                    {prov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Major Cities</Label>
            <div className="flex flex-wrap gap-2">
              {SA_MAJOR_CITIES.map((city) => (
                <Badge
                  key={city.value}
                  variant={selectedCities.includes(city.value) ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => toggleCity(city.value)}
                  data-testid={`badge-city-${city.value}`}
                >
                  {city.label}
                  {selectedCities.includes(city.value) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => toggleSkill(skill)}
                  data-testid={`badge-skill-${skill}`}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Salary Range (ZAR)</Label>
              <span className="text-sm text-muted-foreground">
                R{salaryRange[0].toLocaleString()} - R
                {salaryRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              value={salaryRange}
              onValueChange={setSalaryRange}
              min={0}
              max={100000}
              step={5000}
              className="w-full"
              data-testid="slider-salary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nqf" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              NQF Level (Education)
            </Label>
            <Select value={nqfLevel} onValueChange={setNqfLevel}>
              <SelectTrigger id="nqf" data-testid="select-nqf">
                <SelectValue placeholder="Select NQF level" />
              </SelectTrigger>
              <SelectContent>
                {NQF_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Languages
            </Label>
            <div className="flex flex-wrap gap-2">
              {SA_LANGUAGES.map((lang) => (
                <Badge
                  key={lang.value}
                  variant={selectedLanguages.includes(lang.value) ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => toggleLanguage(lang.value)}
                  data-testid={`badge-language-${lang.value}`}
                >
                  {lang.label}
                  {selectedLanguages.includes(lang.value) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-auth" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Authorization
            </Label>
            <Select value={workAuth} onValueChange={setWorkAuth}>
              <SelectTrigger id="work-auth" data-testid="select-work-auth">
                <SelectValue placeholder="Select work authorization" />
              </SelectTrigger>
              <SelectContent>
                {SA_WORK_AUTH.map((auth) => (
                  <SelectItem key={auth.value} value={auth.value}>
                    {auth.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-2 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReset}
            data-testid="button-reset-filters"
          >
            Reset
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={handleApply}
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
