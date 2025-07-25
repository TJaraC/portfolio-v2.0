export interface HeaderMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ProjectCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
}

export interface ContactInfo {
  email?: string;
  linkedin?: string;
  instagram?: string;
}