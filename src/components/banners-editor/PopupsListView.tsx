import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Play,
  Trash2,
  LayoutPanelTop,
  Square,
  Layers
} from "lucide-react";
import { Popup } from "@/hooks/usePopups";

interface PopupsListViewProps {
  popups: Popup[] | undefined;
  onEditPopup: (popupId: string) => void;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  onPreviewPopup: (popupId: string) => void;
}

export const PopupsListView = ({
  popups,
  onEditPopup,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  onPreviewPopup,
}: PopupsListViewProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Popups
          </CardTitle>
          <Button onClick={onCreatePopup} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Create Popup
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!popups || popups.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Layers className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No popups created yet
            </p>
            <Button onClick={onCreatePopup} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Create your first popup
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {popups.map((popup) => (
              <div
                key={popup.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Type Icon */}
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    {popup.config.type === 'modal' ? (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <LayoutPanelTop className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Name and Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{popup.name}</span>
                      <Badge variant={popup.config.type === 'modal' ? 'secondary' : 'outline'} className="text-[10px]">
                        {popup.config.type === 'modal' ? 'Modal' : 'Banner'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {popup.rules.urlTargeting.mode === 'all'
                        ? 'All pages'
                        : popup.rules.urlTargeting.patterns.length > 0
                          ? `${popup.rules.urlTargeting.mode === 'include' ? 'Only:' : 'Except:'} ${popup.rules.urlTargeting.patterns.map(p => p.value).join(', ')}`
                          : 'All pages'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${popup.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {popup.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={popup.is_active}
                      onCheckedChange={() => onToggleActive(popup.id, popup.is_active)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onPreviewPopup(popup.id)}
                      title="Preview"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditPopup(popup.id)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => onDeletePopup(popup.id, e)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
