import { ArrowLeft, Monitor, Tablet, Smartphone, Eye, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDomainScrape, getProjectLogoUrl } from "@/hooks/useDomainBranding";
import { useUpdateProject } from "@/hooks/useProjects";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type DeviceType = "desktop" | "tablet" | "mobile";

interface EditorHeaderProps {
  projectId: string | undefined;
  projectName: string | undefined;
  projectDomain: string | undefined;
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  handleSave: () => void;
  isSaving: boolean;
  selectedPopupId: string | null;
}

// Get favicon URL from stored images or branding
const getProjectFaviconUrl = (
  storedImages: { favicon?: string } | null | undefined,
  branding: { images?: { favicon?: string } } | null | undefined
): string | null => {
  if (storedImages?.favicon) {
    return storedImages.favicon;
  }
  if (branding?.images?.favicon) {
    return branding.images.favicon;
  }
  return null;
}

export const EditorHeader = ({
  projectId,
  projectName,
  projectDomain,
  device,
  setDevice,
  handleSave,
  isSaving,
  selectedPopupId,
}: EditorHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const updateProject = useUpdateProject();

  const { data: domainScrape } = useDomainScrape(projectDomain);
  const faviconUrl = getProjectFaviconUrl(domainScrape?.stored_images, domainScrape?.branding);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName || "");

  useEffect(() => {
    if (projectName) {
      setTempName(projectName);
    }
  }, [projectName]);

  const handleSaveName = async () => {
    if (!projectId || !tempName.trim()) return;
    try {
      await updateProject.mutateAsync({ id: projectId, name: tempName.trim() });
      setIsEditingName(false);
      toast.success("Project name updated");
    } catch (error) {
      toast.error("Failed to update project name");
    }
  };

  return (
    <header className="h-11 bg-card border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="toolbar-btn"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            className="w-4 h-4 object-contain border-none outline-none shadow-none ring-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        {isEditingName ? (
          <div className="flex items-center gap-1">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="h-6 w-[200px] text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setTempName(projectName || "");
                  setIsEditingName(false);
                }
              }}
            />
            <button onClick={handleSaveName} className="p-1 hover:bg-accent rounded-md text-green-500">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => {
              setTempName(projectName || "");
              setIsEditingName(false);
            }} className="p-1 hover:bg-accent rounded-md text-destructive">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-xs font-medium text-foreground">{projectName || "Project"}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Device Toggle */}
      <div className="flex items-center gap-1 bg-surface rounded-[4px] p-0.5">
        <button
          onClick={() => setDevice("desktop")}
          className={`toolbar-btn ${device === "desktop" ? "toolbar-btn-active" : ""}`}
        >
          <Monitor className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setDevice("tablet")}
          className={`toolbar-btn ${device === "tablet" ? "toolbar-btn-active" : ""}`}
        >
          <Tablet className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`toolbar-btn ${device === "mobile" ? "toolbar-btn-active" : ""}`}
        >
          <Smartphone className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="toolbar-btn"
          onClick={() => window.open(`/preview/${projectId}`, '_blank')}
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
          <span>{t('editor.preview')}</span>
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !selectedPopupId}
          className="h-7 px-3 text-xs font-medium rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : t('editor.save')}
        </button>
      </div>
    </header>
  );
};
