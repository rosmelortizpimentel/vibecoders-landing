import { PopupRenderer, type PopupConfig as EnginePopupConfig } from "@/components/popup-engine";
import { type PopupConfig } from "@/hooks/usePopups";

type DeviceType = "desktop" | "tablet" | "mobile";

interface EditorCanvasProps {
  device: DeviceType;
  designConfig: PopupConfig;
  selectedPopupId: string | null;
  getEngineConfig: () => EnginePopupConfig;
}

export const EditorCanvas = ({
  device,
  designConfig,
  selectedPopupId,
  getEngineConfig,
}: EditorCanvasProps) => {
  const getDeviceWidth = () => {
    switch (device) {
      case "tablet": return "768px";
      case "mobile": return "375px";
      default: return "100%";
    }
  };

  const getDeviceHeight = () => {
    switch (device) {
      case "tablet": return "600px";
      case "mobile": return "667px";
      default: return "500px";
    }
  };

  return (
    <div className="flex-1 canvas-dots overflow-auto flex items-center justify-center p-8">
      <div
        className="transition-all duration-300 ease-out relative bg-card border border-border overflow-hidden"
        style={{
          width: getDeviceWidth(),
          maxWidth: device === "desktop" ? "800px" : getDeviceWidth(),
          height: getDeviceHeight(),
          borderRadius: device === "desktop" ? "8px" : device === "tablet" ? "16px" : "24px",
        }}
      >
        {/* Simulated page content */}
        <div className="absolute inset-0 p-4 opacity-30">
          <div className="h-4 w-32 bg-muted rounded mb-4" />
          <div className="h-3 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-3/4 bg-muted rounded mb-2" />
          <div className="h-3 w-5/6 bg-muted rounded mb-4" />
          <div className="h-20 w-full bg-muted rounded mb-4" />
          <div className="h-3 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
        
        {/* Popup Preview - Using Engine PopupRenderer */}
        {selectedPopupId && (
          <div className={`absolute inset-0 z-10 ${
            designConfig.type === 'modal' 
              ? 'flex items-center justify-center' 
              : 'flex flex-col items-stretch'
          }`}>
            {designConfig.type === 'modal' && (
              <div 
                className="absolute inset-0" 
                style={{ backgroundColor: designConfig.colors.overlay }}
              />
            )}
            <PopupRenderer 
              config={getEngineConfig()}
              isPreview={true}
              onClose={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};
