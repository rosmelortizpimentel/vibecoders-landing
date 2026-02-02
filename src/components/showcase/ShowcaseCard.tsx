import { useState } from 'react';
import { ExternalLink, Linkedin, Twitter, Globe, User } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ShowcaseProject } from '@/hooks/useShowcase';

interface ShowcaseCardProps {
  project: ShowcaseProject;
}

export function ShowcaseCard({ project }: ShowcaseCardProps) {
  const [imageError, setImageError] = useState(false);

  const hasSocialLinks = project.author_linkedin || project.author_twitter || project.author_website;

  return (
    <article className="group bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-stone-400" />
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
      <div className="p-4">
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
              className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
            />
          )}
          
          {/* Title & Tagline */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#1c1c1c] group-hover/title:text-[#3D5AFE] transition-colors line-clamp-1">
              {project.project_title}
            </h3>
            <p className="mt-1 text-sm text-stone-600 line-clamp-2">
              {project.project_tagline}
            </p>
          </div>
        </a>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-stone-100" />

      {/* Footer - Author Info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {project.author_avatar ? (
              <AvatarImage src={project.author_avatar} alt={project.author_name} />
            ) : null}
            <AvatarFallback className="bg-stone-100 text-stone-600 text-xs">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-stone-700 truncate">
            {project.author_name}
          </span>
          <Badge className="text-[10px] bg-gray-100 text-gray-500 hover:bg-gray-100 rounded-full px-2 py-0.5 font-normal flex-shrink-0">
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
                className="p-1.5 text-stone-400 hover:text-[#0A66C2] transition-colors"
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
                className="p-1.5 text-stone-400 hover:text-[#1c1c1c] transition-colors"
                aria-label={`Twitter de ${project.author_name}`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {project.author_website && (
              <a
                href={project.author_website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-stone-400 hover:text-[#3D5AFE] transition-colors"
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
