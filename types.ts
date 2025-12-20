
import React from 'react';
import { Node, Edge } from 'reactflow';

export enum NodeType {
  // Pages
  LANDING_PAGE = 'LANDING_PAGE',
  OPTIN_PAGE = 'OPTIN_PAGE',
  CHECKOUT = 'CHECKOUT',
  ORDER_PAGE = 'ORDER_PAGE',
  VSL = 'VSL',
  UPSELL = 'UPSELL',
  DOWNSELL = 'DOWNSELL',
  THANK_YOU = 'THANK_YOU',
  WEBINAR = 'WEBINAR',
  LIVE_WEBINAR = 'LIVE_WEBINAR',
  BLOG = 'BLOG',
  QUIZ = 'QUIZ',
  MEMBERSHIP_AREA = 'MEMBERSHIP_AREA',
  DOWNLOAD_PAGE = 'DOWNLOAD_PAGE',
  CALENDAR_PAGE = 'CALENDAR_PAGE',
  GENERIC_PAGE = 'GENERIC_PAGE',
  POPUP = 'POPUP',
  SYSTEM_PAGE = 'SYSTEM_PAGE',
  ECOMMERCE_PAGE = 'ECOMMERCE_PAGE',

  // Traffic
  META_ADS = 'META_ADS',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
  GOOGLE_ADS = 'GOOGLE_ADS',
  GOOGLE_SEARCH = 'GOOGLE_SEARCH',
  BING_ADS = 'BING_ADS',
  TIKTOK_ADS = 'TIKTOK_ADS',
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
  PINTEREST = 'PINTEREST',
  KWAI = 'KWAI',
  TWITCH = 'TWITCH',
  ORGANIC_SOCIAL = 'ORGANIC_SOCIAL',

  // Communication
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  CALL = 'CALL',
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  TELEGRAM = 'TELEGRAM',
  DISCORD = 'DISCORD',

  // Internal / Operations
  NOTE = 'NOTE',
  SUBSCRIBER = 'SUBSCRIBER',
  ADD_TO_CART = 'ADD_TO_CART',
  ADD_TO_LIST = 'ADD_TO_LIST',
  CRM_PIPELINE = 'CRM_PIPELINE',
  MEETING = 'MEETING',
  LEAD = 'LEAD',
  REVENUE = 'REVENUE',

  // Actions
  PURCHASE_SUB = 'PURCHASE_SUB',
  AB_TEST = 'AB_TEST',
}

export interface FunnelNodeData {
  label: string;
  type: NodeType;
  description?: string;
  onConnectAction?: (nodeId: string, handleType: 'source' | 'target' | 'start-auto' | 'end-auto', handleId?: string) => void;
  onSwapType?: (nodeId: string, newType: NodeType) => void;
  isConnectSource?: boolean;
  isPresentationMode?: boolean;
  showNotes?: boolean;
  isTransparent?: boolean;
  isConnectionActive?: boolean;
  userPlan?: UserPlan;
}

export enum AppMode {
  BUILDER = 'BUILDER',
  PRESENTATION = 'PRESENTATION',
}

export interface Project {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt: Date;
  ownerId?: string;
}

export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Template {
  id: string;
  labelKey?: string;
  customLabel?: string;
  descriptionKey?: string;
  customDescription?: string;
  icon: React.ReactNode;
  nodes: Node[];
  edges: Edge[];
  isPro?: boolean;
  isCustom?: boolean;
  // Marketplace fields
  status?: TemplateStatus;
  rating?: number;
  ratingCount?: number;
  downloads?: number;
  authorId?: string;
  authorName?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  isReported?: boolean;
  reportCount?: number;
  createdAt?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export type UserPlan = string;
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: UserStatus;
  lastLogin: Date;
  avatarUrl?: string;
  isSystemAdmin?: boolean;
}

export interface PlanConfig {
  id: string;
  label: string;
  priceMonthly: number;
  priceYearly: number;
  projectLimit: number;
  nodeLimit: number;
  features: string[];
  isPopular?: boolean;
  teamLimit?: number; // Added for dynamic team limits
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  isActive: boolean;
  createdAt: Date;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  allowSignups: boolean;
  announcements: Announcement[];
  debugMode: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'PENDING';
  avatarUrl?: string;
}

export type Language = 'pt' | 'en' | 'es';

export type AppPage = 'PROJECTS' | 'BUILDER' | 'SETTINGS' | 'TEAM' | 'MARKETPLACE';

export type AppView = 'LANDING' | 'AUTH' | 'APP' | 'ROADMAP' | 'ADMIN' | 'GALLERY' | 'ICONS' | 'SHARED';

export type FeedbackType = 'FEATURE' | 'BUG' | 'IMPROVEMENT' | 'OTHER';
export type FeedbackStatus = 'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface FeedbackComment {
  id: string;
  text: string;
  authorName: string;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  votes: number;
  votedUserIds: string[];
  authorName: string;
  createdAt: Date;
  comments: FeedbackComment[];
}
