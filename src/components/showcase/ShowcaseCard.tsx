import { useState } from 'react';
import { ExternalLink, Linkedin, Globe, User } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ShowcaseProject } from '@/hooks/useShowcase';

// X icon (Twitter/X current logo)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface ShowcaseCardProps {
  project: ShowcaseProject;
}

export function ShowcaseCard({ project }: ShowcaseCardProps) {
  const [imageError, setImageError] = useState(false);

  const hasSocialLinks = project.author_linkedin || project.author_twitter || project.author_website;

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md">
      {/* Project Image - Clickable */}
      <a
        href={project.project_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden"
        aria-label={`Ver proyecto ${project.project_title}`}
      >
        <AspectRatio ratio={16 / 9}>
          {imageError ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={project.project_thumbnail}
              alt={`Captura de ${project.project_title}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
        </AspectRatio>
      </a>

      {/* Body */}
      <div className="p-4 md:p-5">
        <a
          href={project.project_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 group/title"
        >
          {/* Logo */}
          {project.project_logo_url && (
            <img
              src={project.project_logo_url}
              alt={`Logo de ${project.project_title}`}
              className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
            />
          )}
          
          {/* Title & Tagline */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {project.project_title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {project.project_tagline}
            </p>
          </div>
        </a>
      </div>

      {/* Separator */}
      <div className="mx-4 md:mx-5 border-t border-border" />

      {/* Footer - Author Info */}
      <div className="p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {project.author_avatar ? (
              <AvatarImage src={project.author_avatar} alt={project.author_name} />
            ) : null}
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground truncate">
            {project.author_name}
          </span>
          <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0.5 font-normal flex-shrink-0">
            Creador
          </Badge>
        </div>

        {/* Social Icons */}
        {hasSocialLinks && (
          <div className="flex items-center gap-1">
            {project.author_linkedin && (
              <a
                href={project.author_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`LinkedIn de ${project.author_name}`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {project.author_twitter && (
              <a
                href={project.author_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Twitter de ${project.author_name}`}
              >
                <XIcon className="w-4 h-4" />
              </a>
            )}
            {project.author_website && (
              <a
                href={project.author_website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Sitio web de ${project.author_name}`}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
