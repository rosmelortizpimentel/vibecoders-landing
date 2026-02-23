import { Settings2, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { DesignTab } from "./DesignTab";
import { RulesTab } from "./RulesTab";
import { type PopupConfig, type PopupRules } from "@/hooks/usePopups";

type LayoutType = "modal" | "bar";

interface EditorRightSidebarProps {
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
  defaultLogoUrl?: string | null;
  projectDomain?: string;
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
}

export const EditorRightSidebar = ({
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  designConfig,
  setDesignConfig,
  layoutType,
  handleLayoutChange,
  rulesConfig,
  setRulesConfig,
  defaultLogoUrl,
  projectDomain,
  width = 300,
  onStartResize,
}: EditorRightSidebarProps) => {
  const { t } = useLanguage();

  return (
    <aside
      className="bg-surface border-l border-border flex flex-col relative"
      style={{ width, minWidth: 300 }}
    >
      {/* Resize Handle */}
      {onStartResize && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-10"
          onMouseDown={onStartResize}
        />
      )}

      <Tabs defaultValue="design" className="flex flex-col h-full">
        <div className="border-b border-border">
          <TabsList className="w-full h-10 bg-transparent rounded-none p-0">
            <TabsTrigger
              value="design"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              <Settings2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              {t('editor.design')}
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              <Target className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Rules
            </TabsTrigger>
          </TabsList>
        </div>

        {/* DESIGN TAB */}
        <TabsContent value="design" className="flex-1 overflow-auto m-0">
          <DesignTab
            popupName={popupName}
            setPopupName={setPopupName}
            isActive={isActive}
            setIsActive={setIsActive}
            designConfig={designConfig}
            setDesignConfig={setDesignConfig}
            layoutType={layoutType}
            handleLayoutChange={handleLayoutChange}
            defaultLogoUrl={defaultLogoUrl}
          />
        </TabsContent>

        {/* RULES TAB */}
        <TabsContent value="rules" className="flex-1 overflow-auto m-0">
          <RulesTab
            rulesConfig={rulesConfig}
            setRulesConfig={setRulesConfig}
            projectDomain={projectDomain}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
};
