import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Home,
  Image as ImageIcon,
  Sparkles,
  PenTool,
  FolderOpen,
  Palette,
  Building2,
  BookOpen,
  Users,
  Mail,
  Link as LinkIcon,
  Brush,
  User,
  Settings,
  LogOut
} from 'lucide-react';

export type SidebarItem = {
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: SidebarItem[];
  sectionKey?: string;
  onClick?: () => void;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    sectionKey: 'dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    label: 'Home Page',
    sectionKey: 'home',
    icon: <Home className="h-4 w-4" />,
    children: [
      { label: 'Hero', path: '/admin/hero', icon: <ImageIcon className="h-4 w-4" /> },
      { label: 'Home Sections', path: '/admin/home/sections', icon: <Sparkles className="h-4 w-4" /> },
      { label: 'Home Masthead', path: '/admin/home/masthead', icon: <Sparkles className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Content Hub',
    sectionKey: 'contentHub',
    icon: <PenTool className="h-4 w-4" />,
    children: [
      { label: 'Blog Posts', path: '/admin/blog', icon: <PenTool className="h-4 w-4" /> },
      { label: 'Categories', path: '/admin/blog/categories', icon: <FolderOpen className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Museum',
    sectionKey: 'museum',
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { label: 'Paintings', path: '/admin/paintings', icon: <Palette className="h-4 w-4" /> },
      { label: 'Museum Collections / Setup', path: '/admin/museum', icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Editorial Pages',
    sectionKey: 'editorial',
    icon: <BookOpen className="h-4 w-4" />,
    children: [
      { label: 'Biography', path: '/admin/biography', icon: <User className="h-4 w-4" /> },
      { label: 'Terms & Conditions', path: '/admin/pages/terms', icon: <BookOpen className="h-4 w-4" /> },
      { label: 'Privacy Policy', path: '/admin/pages/privacy-policy', icon: <BookOpen className="h-4 w-4" /> },
      { label: 'Copyright', path: '/admin/pages/copyright', icon: <BookOpen className="h-4 w-4" /> },
      { label: 'Submit Your Writing', path: '/admin/pages/submit-writing', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Community',
    sectionKey: 'community',
    icon: <Users className="h-4 w-4" />,
    children: [
      { label: 'Users', path: '/admin/users', icon: <Users className="h-4 w-4" /> },
      { label: 'Submissions (User Write-ups)', path: '/admin/submissions', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Navigation & Branding',
    sectionKey: 'branding',
    icon: <LinkIcon className="h-4 w-4" />,
    children: [
      { label: 'Nav Links', path: '/admin/settings/nav-links', icon: <LinkIcon className="h-4 w-4" /> },
      { label: 'Brand', path: '/admin/brand', icon: <Brush className="h-4 w-4" /> },
    ],
  },
  {
    label: 'System',
    sectionKey: 'system',
    icon: <Settings className="h-4 w-4" />,
    children: [
      { label: 'Profile', path: '/admin/profile', icon: <User className="h-4 w-4" /> },
      { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
      { label: 'Logout', path: '/admin/logout', icon: <LogOut className="h-4 w-4" /> },
    ],
  },
];
