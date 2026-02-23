import { Project } from "@/hooks/useProjects";
import { Popup } from "@/hooks/usePopups";
import { DomainScrape, BrandingOverrides } from "@/hooks/useDomainBranding";
import { BrandingCard } from "./BrandingCard";
import { PopupsListView } from "./PopupsListView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectOverviewProps {
  project: Project;
  popups: Popup[] | undefined;
  domainScrape: DomainScrape | null | undefined;
  brandingOverrides: BrandingOverrides | null;
  onEditPopup: (popupId: string) => void;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  onPreviewPopup: (popupId: string) => void;
  onSaveBranding: (overrides: BrandingOverrides) => void;
  isSavingBranding: boolean;
}

export const ProjectOverview = ({
  project,
  popups,
  domainScrape,
  brandingOverrides,
  onEditPopup,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  onPreviewPopup,
  onSaveBranding,
  isSavingBranding,
}: ProjectOverviewProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.domain}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Branding Section */}
        <BrandingCard
          projectId={project.id}
          domain={project.domain}
          domainScrape={domainScrape}
          currentOverrides={brandingOverrides}
          onSave={onSaveBranding}
          isSaving={isSavingBranding}
        />

        {/* Popups Section */}
        <PopupsListView
          popups={popups}
          onEditPopup={onEditPopup}
          onCreatePopup={onCreatePopup}
          onToggleActive={onToggleActive}
          onDeletePopup={onDeletePopup}
          onPreviewPopup={onPreviewPopup}
        />
      </div>
    </div>
  );
};
