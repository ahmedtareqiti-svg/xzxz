import { CompetitionHeader } from "@/components/competition-header"
import { SearchSection } from "@/components/search-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { StatsDialog } from "@/components/stats-dialog"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <ThemeToggle />
      <StatsDialog />
      <div className="container mx-auto px-4 py-12">
        <CompetitionHeader />
        <SearchSection />
      </div>
    </div>
  );
};

export default Index;
