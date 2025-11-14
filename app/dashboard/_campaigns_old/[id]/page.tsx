"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SharedAIPanel from "@/components/shared-ai-panel";
import { useAIPanel } from "@/components/ai-panel-context";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Clock,
  Home,
  Euro,
  Code,
  Target,
  Users,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Phone,
  Linkedin,
  Loader2,
  Globe,
  X,
  GripVertical,
  Mail,
  Calendar,
  Star,
} from "lucide-react";

interface Campaign {
  campaign_id: string;
  created_at: string | null;
  updated_at: string | null;
  campaign_raw: string;
  job: {
    title: string;
    company: string;
    location: string;
    contract: string;
    seniority: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    description: string;
    work_mode: string;
    department: string | null;
    company_desc: string;
    skills: Array<{ name: string; mastery: string | null }>;
    benefits: string[];
    requirements: string[];
    responsibilities: string[];
  };
}

interface HasMatchRelationship {
  availabilityBonus: number;
  educationScore: number;
  experienceScore: number;
  languageScore: number;
  locationScore: number;
  rank: number;
  salaryAlignmentBonus: number;
  semanticScore: number;
  seniorityScore: number;
  skillsScore: number;
  totalScore: number;
  updatedAt: string;
}

interface MatchedCandidateWithScores {
  id: string;
  name: string;
  email: string;
  profile_url?: string;
  profile_pic_url?: string;
  phone?: string;
  status?: string;
  country?: string;
  role?: string;
  company?: string;
  matchScores: HasMatchRelationship;
}

interface ApplicationCandidate {
  id: string;
  name: string;
  email: string;
  profile_url?: string;
  profile_pic_url?: string;
  phone?: string;
  country?: string;
  role?: string;
  company?: string;
  totalScore: number;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';
  platform: 'LinkedIn' | 'Indeed' | 'Google' | 'Talent.com';
}

interface CampaignDetailProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedCandidatesWithScores, setMatchedCandidatesWithScores] =
    useState<MatchedCandidateWithScores[]>([]);
  const [sortedCandidates, setSortedCandidates] = useState<MatchedCandidateWithScores[]>([]);
  const [expandedScores, setExpandedScores] = useState<
    Record<string, string | null>
  >({});
  const [descriptionTexts, setDescriptionTexts] = useState<
    Record<string, { candidateDescription: string; jobDescription: string }>
  >({});
  const [applications, setApplications] = useState<ApplicationCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [hasMatches, setHasMatches] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [showJobBoardModal, setShowJobBoardModal] = useState(false);
  const [selectedJobBoards, setSelectedJobBoards] = useState<string[]>([]);

  const router = useRouter();

  // AI Panel context
  const {
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    selectedContextCandidate,
    setSelectedContextCandidate,
    selectedContextCampaign,
    setSelectedContextCampaign,
    selectedProfileView,
    setSelectedProfileView,
    selectedCampaignView,
    setSelectedCampaignView,
    campaigns: rightPanelCampaigns,
    candidates: rightPanelCandidates,
  } = useAIPanel();

  // Resolve the params Promise to get the campaign ID
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setCampaignId(resolvedParams.id);
      } catch (err) {
        console.error("Error resolving params:", err);
        setError("Failed to load campaign parameters");
      }
    };
    resolveParams();
  }, [params]);

  // Fetch data when campaignId is available
  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      checkForMatches();
    }
  }, [campaignId]);



  const fetchCampaignDetails = async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/campaigns-proxy", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const foundCampaign = result.data.find(
          (c: Campaign) => c.campaign_id === campaignId
        );
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          setError("Campaign not found");
        }
      } else {
        setError(result.error || "Failed to fetch campaign details");
      }
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkForMatches = async () => {
    if (!campaignId) return;

    try {
      const apiUrl = `/api/campaigns/matches?campaignId=${campaignId}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (response.ok) {
        const result = await response.json();
        setHasMatches(result.hasMatches);
        
        if (result.hasMatches && result.candidates && result.candidates.length > 0) {
          // Sort candidates by rank immediately
          const sorted = [...result.candidates].sort((a, b) => a.matchScores.rank - b.matchScores.rank);
          setMatchedCandidatesWithScores(sorted);
          setSortedCandidates(sorted);
          
          // Create applications immediately
          const platforms: ('LinkedIn' | 'Indeed' | 'Google' | 'Talent.com')[] = ['LinkedIn', 'Indeed', 'Google', 'Talent.com'];
          const newApplications: ApplicationCandidate[] = sorted.map((candidate, index) => ({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            profile_url: candidate.profile_url,
            profile_pic_url: candidate.profile_pic_url,
            phone: candidate.phone,
            country: candidate.country,
            role: candidate.role || 'Software Engineer',
            company: candidate.company || 'Tech Company',
            totalScore: candidate.matchScores.totalScore,
            status: 'Applied',
            platform: platforms[index % platforms.length] || 'LinkedIn'
          }));
          setApplications(newApplications);
          
          setDebugInfo(
            `Found ${result.candidates.length} matched candidates for this campaign`
          );
          setActiveTab("candidates");
        } else {
          setMatchedCandidatesWithScores([]);
          setSortedCandidates([]);
          setApplications([]);
          setDebugInfo("No HAS_MATCH relationships found for this campaign");
        }
      } else {
        console.error("Failed to check for matches:", response.status);
        setHasMatches(false);
        setMatchedCandidatesWithScores([]);
        setSortedCandidates([]);
        setApplications([]);
        setDebugInfo("Failed to check HAS_MATCH relationships");
      }
    } catch (err) {
      console.error("Error checking for matches:", err);
      setHasMatches(false);
      setMatchedCandidatesWithScores([]);
      setSortedCandidates([]);
      setApplications([]);
      setDebugInfo("Error checking HAS_MATCH relationships");
    }
  };

  const handleMatchCandidates = async () => {
    if (!campaignId) return;
    try {
      setCandidatesLoading(true);
      setCandidatesError(null);
      const response = await fetch(
        `/api/candidates/match-external?campaignId=${campaignId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (response.ok) {
        await checkForMatches();
      } else {
        setCandidatesError("Failed to match candidates");
      }
    } catch (err) {
      console.error("Error during candidate matching:", err);
      setCandidatesError("Error during candidate matching");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleRematch = async () => {
    if (!campaignId) return;
    try {
      setCandidatesLoading(true);
      setCandidatesError(null);
      const response = await fetch(
        `/api/candidates/match-external?campaignId=${campaignId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (response.ok) {
        await checkForMatches();
      } else {
        setCandidatesError("Failed to rematch candidates");
      }
    } catch (err) {
      console.error("Error during candidate rematching:", err);
      setCandidatesError("Error during candidate rematching");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handlePublishToJobBoards = () => {
    setShowJobBoardModal(true);
  };

  const handleJobBoardToggle = (jobBoard: string) => {
    setSelectedJobBoards(prev => 
      prev.includes(jobBoard) 
        ? prev.filter(board => board !== jobBoard)
        : [...prev, jobBoard]
    );
  };

  const handlePublishSelected = () => {
    console.log("Publishing to selected job boards:", selectedJobBoards);
    // Here you would implement the actual publishing logic
    setShowJobBoardModal(false);
    setSelectedJobBoards([]);
  };

  const handleStatusChange = (candidateId: string, newStatus: ApplicationCandidate['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === candidateId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationCandidate['status']) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    handleStatusChange(candidateId, targetStatus);
  };

  const handleShortlist = async (candidateId: string) => {
    // Toggle shortlist status in applications
    setApplications(prev => {
      const updated = prev.map(app => 
        app.id === candidateId 
          ? { 
              ...app, 
              status: app.status === 'Shortlisted' ? ('Applied' as const) : ('Shortlisted' as const)
            } 
          : app
      );
      return updated;
    });
  };

  /**
   * When the Semantic score is expanded for a candidate, we fetch:
   * - Candidate.description_text by profile_url
   * - Job.description_text via the campaignId -> Job relation
   * API: GET /api/campaigns/description-texts?campaignId=<id>&candidateProfileUrl=<url>
   */
  const handleScoreClick = async (candidateId: string, scoreType: string) => {
    const newExpandedScore =
      expandedScores[candidateId] === scoreType ? null : scoreType;

    setExpandedScores((prev) => ({
      ...prev,
      [candidateId]: newExpandedScore,
    }));

    if (
      newExpandedScore === "semantic" &&
      !descriptionTexts[candidateId]
    ) {
      try {
        const candidate = matchedCandidatesWithScores.find(
          (c) => c.id === candidateId
        );
        if (!candidate?.profile_url || !campaignId) return;

        const qs = new URLSearchParams({
          campaignId,
          candidateProfileUrl: candidate.profile_url,
        }).toString();

        const resp = await fetch(`/api/campaigns/description-texts?${qs}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (resp.ok) {
          const data = await resp.json();
          setDescriptionTexts((prev) => ({
            ...prev,
            [candidateId]: {
              candidateDescription: data.candidateDescription ?? "Not available",
              jobDescription: data.jobDescription ?? "Not available",
            },
          }));
        } else {
          console.error("Failed to fetch description texts:", resp.status);
          setDescriptionTexts((prev) => ({
            ...prev,
            [candidateId]: {
              candidateDescription: "Not available",
              jobDescription: "Not available",
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching description texts:", error);
        setDescriptionTexts((prev) => ({
          ...prev,
          [candidateId]: {
            candidateDescription: "Not available",
            jobDescription: "Not available",
          },
        }));
      }
    }
  };

  const getScoreDetails = (
    scoreType: string,
    candidate: MatchedCandidateWithScores
  ) => {
    switch (scoreType) {
      case "total":
        return {
          title: "Total Score Breakdown",
          breakdown: [
            {
              label: "Skills",
              score: candidate.matchScores.skillsScore,
              weight: 0.3,
              contribution: candidate.matchScores.skillsScore * 0.3,
            },
            {
              label: "Language",
              score: candidate.matchScores.languageScore,
              weight: 0.1,
              contribution: candidate.matchScores.languageScore * 0.1,
            },
            {
              label: "Seniority",
              score: candidate.matchScores.seniorityScore,
              weight: 0.15,
              contribution: candidate.matchScores.seniorityScore * 0.15,
            },
            {
              label: "Experience",
              score: candidate.matchScores.experienceScore,
              weight: 0.15,
              contribution: candidate.matchScores.experienceScore * 0.15,
            },
            {
              label: "Education",
              score: candidate.matchScores.educationScore,
              weight: 0.05,
              contribution: candidate.matchScores.educationScore * 0.05,
            },
            {
              label: "Location",
              score: candidate.matchScores.locationScore,
              weight: 0.05,
              contribution: candidate.matchScores.locationScore * 0.05,
            },
            {
              label: "Semantic",
              score: candidate.matchScores.semanticScore,
              weight: 0.2,
              contribution: candidate.matchScores.semanticScore * 0.2,
            },
          ],
        };
      case "skills":
        return {
          title: "Skills Analysis",
          candidateDetails: "Candidate skills and expertise",
          jobRequirements: "Job skill requirements",
        };
      case "language":
        return {
          title: "Language Analysis",
          candidateDetails: "Candidate languages",
          jobRequirements: "Job language requirements",
        };
      case "seniority":
        return {
          title: "Seniority Analysis",
          candidateDetails: "Candidate seniority level",
          jobRequirements: "Job seniority requirements",
        };
      case "experience":
        return {
          title: "Experience Analysis",
          candidateDetails: "Candidate work experience",
          jobRequirements: "Job experience requirements",
        };
      case "education":
        return {
          title: "Education Analysis",
          candidateDetails: "Candidate education background",
          jobRequirements: "Job education requirements",
        };
      case "location":
        return {
          title: "Location Analysis",
          candidateDetails: "Candidate location",
          jobRequirements: "Job location requirements",
        };
      case "semantic":
        return {
          title: "Semantic Analysis",
          candidateDetails:
            descriptionTexts[candidate.id]?.candidateDescription ||
            "Loading candidate description...",
          jobRequirements:
            descriptionTexts[candidate.id]?.jobDescription ||
            "Loading job description...",
        };
      default:
        return null;
    }
  };

  const getExpandedScoreColor = (scoreType: string) => {
    switch (scoreType) {
      case "total":
        return "bg-blue-50 border-blue-200";
      case "semantic":
        return "bg-green-50 border-green-200";
      case "skills":
        return "bg-purple-50 border-purple-200";
      case "experience":
        return "bg-orange-50 border-orange-200";
      case "education":
        return "bg-red-50 border-red-200";
      case "seniority":
        return "bg-yellow-50 border-yellow-200";
      case "location":
        return "bg-indigo-50 border-indigo-200";
      case "language":
        return "bg-pink-50 border-pink-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatSalary = (
    salaryMin: number | null,
    salaryMax: number | null,
    currency: string
  ): string => {
    if (!salaryMin && !salaryMax) return "not specified";
    const currencySymbol = currency === "EUR" ? "€" : currency || "€";
    if (salaryMin && salaryMax) {
      return `${currencySymbol}${salaryMin.toLocaleString()} - ${currencySymbol}${salaryMax.toLocaleString()}`;
    } else if (salaryMin) {
      return `${currencySymbol}${salaryMin.toLocaleString()}+`;
    } else if (salaryMax) {
      return `Up to ${currencySymbol}${salaryMax.toLocaleString()}`;
    }
    return "not specified";
  };

  // ---------------- Tabs ----------------

  const DetailsTab = ({
    campaign,
    onPublishToJobBoards,
  }: {
    campaign: Campaign;
    onPublishToJobBoards: () => void;
  }) => {
    const skillsCount = campaign.job.skills.length;
    const requirementsCount = campaign.job.requirements.length;

    return (
      <div className="space-y-8">
        {/* Processing Complete Header */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-green-800">
              Processing Complete
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {skillsCount}
              </div>
              <div className="text-xl text-gray-600">Skills Identified</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {requirementsCount}
              </div>
              <div className="text-xl text-gray-600">
                Requirements Extracted
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
              onClick={handleMatchCandidates}
              disabled={candidatesLoading}
            >
              {candidatesLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Target className="w-5 h-5 mr-2" />
              )}
              {candidatesLoading
                ? "Matching Candidates..."
                : hasMatches
                ? "Rematch"
                : "Start Candidate Matching"}
            </Button>
          </div>
        </div>

        {/* Extracted Job Information */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Extracted Job Information
            </h2>
            <Button
              variant="outline"
              onClick={onPublishToJobBoards}
              className="bg-black hover:bg-gray-800 text-white border-black"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish to Job Boards
            </Button>
          </div>

          {/* Job Title and Company */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              {campaign.job.title}
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700">
              {campaign.job.company}
            </h2>

            {/* Info Bubbles */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="outline" className="px-4 py-2 text-base">
                <MapPin className="w-4 h-4 mr-2" />
                {campaign.job.location}
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Clock className="w-4 h-4 mr-2" />
                {campaign.job.contract}
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Home className="w-4 h-4 mr-2" />
                {campaign.job.work_mode}
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Euro className="w-4 h-4 mr-2" />
                {formatSalary(
                  campaign.job.salary_min,
                  campaign.job.salary_max,
                  campaign.job.salary_currency
                )}
              </Badge>
            </div>
          </div>

          {/* Skills */}
          {campaign.job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Code className="h-6 w-6 text-purple-600" />
                  Skills
                </CardTitle>
                <p className="text-gray-600">
                  Technical and professional skills
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {campaign.job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-base"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {campaign.job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {campaign.job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {campaign.job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {campaign.job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-lg">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-3 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {campaign.job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-yellow-600" />
                  Benefits & Perks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {campaign.job.benefits.map((item, index) => (
                    <Badge
                      key={index}
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-4 py-2 text-base"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Core Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                Core Information
              </CardTitle>
              <p className="text-gray-600">Essential job details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Job title:
                  </span>
                  <div className="text-base">{campaign.job.title}</div>
                </div>
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Company name:
                  </span>
                  <div className="text-base">{campaign.job.company}</div>
                </div>
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Location:
                  </span>
                  <div className="text-base">{campaign.job.location}</div>
                </div>
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Contract type:
                  </span>
                  <div className="text-base">{campaign.job.contract}</div>
                </div>
                {campaign.job.seniority && (
                  <div>
                    <span className="font-semibold text-lg text-gray-700">
                      Seniority level:
                    </span>
                    <div className="text-base">{campaign.job.seniority}</div>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Salary range:
                  </span>
                  <div className="text-base">
                    {formatSalary(
                      campaign.job.salary_min,
                      campaign.job.salary_max,
                      campaign.job.salary_currency
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-lg text-gray-700">
                    Work mode:
                  </span>
                  <div className="text-base">{campaign.job.work_mode}</div>
                </div>
                {campaign.job.department && (
                  <div>
                    <span className="font-semibold text-lg text-gray-700">
                      Department:
                    </span>
                    <div className="text-base">{campaign.job.department}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          {campaign.job.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg leading-relaxed whitespace-pre-wrap">
                  {campaign.job.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Description */}
          {campaign.job.company_desc && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  About {campaign.job.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{campaign.job.company_desc}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const MatchedCandidatesWithScoresTab = ({
    candidates,
    onRefresh,
    expandedScores,
    onScoreClick,
    getScoreDetails,
    onShortlist,
  }: {
    candidates: MatchedCandidateWithScores[];
    onRefresh: () => void;
    expandedScores: Record<string, string | null>;
    onScoreClick: (candidateId: string, scoreType: string) => void;
    getScoreDetails: (
      scoreType: string,
      candidate: MatchedCandidateWithScores
    ) => any;
    onShortlist: (candidateId: string) => void;
  }) => {
    if (candidatesLoading) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Matched Candidates
            </h2>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={candidatesLoading}
              className="bg-black hover:bg-gray-800 text-white border-black"
            >
              {candidatesLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {candidatesLoading ? "Rematching..." : "Rematch"}
            </Button>
          </div>

          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-500" />
            <p className="text-lg text-gray-600">
              Finding the best candidates for your campaign...
            </p>
          </div>
        </div>
      );
    }

    if (candidatesError) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Matched Candidates
            </h2>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="bg-black hover:bg-gray-800 text-white border-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rematch
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {candidatesError}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (candidates.length === 0) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Matched Candidates
            </h2>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="bg-black hover:bg-gray-800 text-white border-black"
            >
              <Target className="w-4 h-4 mr-2" />
              Start Candidate Matching
            </Button>
          </div>

          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No candidates matched yet
            </h3>
            <p className="text-gray-500">
              Start the candidate matching process to find the best candidates
              for your campaign.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            Matched Candidates
          </h2>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={candidatesLoading}
            className="bg-black hover:bg-gray-800 text-white border-black"
          >
            {candidatesLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {candidatesLoading ? "Rematching..." : "Rematch"}
          </Button>
        </div>

        <div className="space-y-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className={`overflow-hidden transition-all duration-200 ${
              applications.find(app => app.id === candidate.id)?.status === 'Shortlisted'
                ? 'bg-yellow-50 border-yellow-200 shadow-md'
                : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={candidate.profile_pic_url || ""}
                      alt={candidate.name}
                    />
                    <AvatarFallback className="text-sm font-semibold">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {candidate.name}
                        </h3>
                        <p className="text-gray-600">{candidate.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShortlist(candidate.id)}
                          className={`transition-all duration-200 hover:scale-105 ${
                            applications.find(app => app.id === candidate.id)?.status === 'Shortlisted'
                              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600 shadow-lg font-semibold'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300'
                          }`}
                          title={applications.find(app => app.id === candidate.id)?.status === 'Shortlisted' 
                            ? 'Click to remove from shortlist' 
                            : 'Click to add to shortlist'
                          }
                        >
                          <Star className={`w-4 h-4 mr-1 ${
                            applications.find(app => app.id === candidate.id)?.status === 'Shortlisted'
                              ? 'text-white'
                              : 'text-yellow-600'
                          }`} />
                          {applications.find(app => app.id === candidate.id)?.status === 'Shortlisted' ? 'Shortlisted ✓' : 'Shortlist +'}
                        </Button>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            #{candidate.matchScores.rank}
                          </div>
                          <div className="text-sm text-gray-500">Rank</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      {candidate.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {candidate.phone}
                        </div>
                      )}
                      {candidate.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {candidate.country}
                        </div>
                      )}
                      {candidate.profile_url && (
                        <a
                          href={candidate.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <Linkedin className="w-4 h-4" />
                            Profile
                          </span>
                        </a>
                      )}
                    </div>

                    {/* Match Scores Grid */}
                    <div className="space-y-4">
                      {/* Upper Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div
                          className={`text-center p-3 bg-blue-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "total"
                              ? "ring-2 ring-blue-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "total")}
                        >
                          <div className="text-lg font-bold text-blue-600">
                            {candidate.matchScores.totalScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Score
                          </div>
                        </div>

                        <div
                          className={`text-center p-3 bg-green-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-green-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "semantic"
                              ? "ring-2 ring-green-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "semantic")}
                        >
                          <div className="text-lg font-bold text-green-600">
                            {candidate.matchScores.semanticScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">Semantic</div>
                        </div>

                        <div
                          className={`text-center p-3 bg-purple-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-purple-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "skills"
                              ? "ring-2 ring-purple-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "skills")}
                        >
                          <div className="text-lg font-bold text-purple-600">
                            {candidate.matchScores.skillsScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">Skills</div>
                        </div>

                        <div
                          className={`text-center p-3 bg-orange-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-orange-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "experience"
                              ? "ring-2 ring-orange-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() =>
                            onScoreClick(candidate.id, "experience")
                          }
                        >
                          <div className="text-lg font-bold text-orange-600">
                            {candidate.matchScores.experienceScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Experience
                          </div>
                        </div>
                      </div>

                      {/* Expanded (upper row) */}
                      {expandedScores[candidate.id] &&
                        ["total", "semantic", "skills", "experience"].includes(
                          expandedScores[candidate.id]!
                        ) && (
                          <div
                            className={`p-4 rounded-lg border transition-all duration-300 ease-in-out transform origin-top ${getExpandedScoreColor(
                              expandedScores[candidate.id]!
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {
                                  getScoreDetails(
                                    expandedScores[candidate.id]!,
                                    candidate
                                  )?.title
                                }
                              </h4>
                              <button
                                onClick={() =>
                                  onScoreClick(
                                    candidate.id,
                                    expandedScores[candidate.id]!
                                  )
                                }
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="h-48 overflow-y-auto">
                              {expandedScores[candidate.id] === "total" ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {getScoreDetails(
                                      expandedScores[candidate.id]!,
                                      candidate
                                    )?.breakdown.map(
                                      (item: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center p-2 bg-white rounded border"
                                        >
                                          <span className="text-sm font-medium">
                                            {item.label}
                                          </span>
                                          <div className="text-right">
                                            <div className="text-sm font-bold">
                                              {item.score.toFixed(2)} ×{" "}
                                              {item.weight}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              = {item.contribution.toFixed(2)}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-4 h-full">
                                  <div className="bg-white p-3 rounded border overflow-y-auto">
                                    <h5 className="font-medium text-gray-900 mb-2">
                                      Candidate Details
                                    </h5>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {
                                        getScoreDetails(
                                          expandedScores[candidate.id]!,
                                          candidate
                                        )?.candidateDetails
                                      }
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded border overflow-y-auto">
                                    <h5 className="font-medium text-gray-900 mb-2">
                                      Job Requirements
                                    </h5>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {
                                        getScoreDetails(
                                          expandedScores[candidate.id]!,
                                          candidate
                                        )?.jobRequirements
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Lower Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div
                          className={`text-center p-3 bg-red-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-red-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "education"
                              ? "ring-2 ring-red-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "education")}
                        >
                          <div className="text-lg font-bold text-red-600">
                            {candidate.matchScores.educationScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Education
                          </div>
                        </div>

                        <div
                          className={`text-center p-3 bg-yellow-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-yellow-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "seniority"
                              ? "ring-2 ring-yellow-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "seniority")}
                        >
                          <div className="text-lg font-bold text-yellow-600">
                            {candidate.matchScores.seniorityScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Seniority
                          </div>
                        </div>

                        <div
                          className={`text-center p-3 bg-indigo-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-indigo-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "location"
                              ? "ring-2 ring-indigo-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "location")}
                        >
                          <div className="text-lg font-bold text-indigo-600">
                            {candidate.matchScores.locationScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Location
                          </div>
                        </div>

                        <div
                          className={`text-center p-3 bg-pink-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-pink-100 hover:shadow-md ${
                            expandedScores[candidate.id] === "language"
                              ? "ring-2 ring-pink-300 shadow-lg"
                              : ""
                          }`}
                          onClick={() => onScoreClick(candidate.id, "language")}
                        >
                          <div className="text-lg font-bold text-pink-600">
                            {candidate.matchScores.languageScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Language
                          </div>
                        </div>
                      </div>

                      {/* Expanded (lower row) */}
                      {expandedScores[candidate.id] &&
                        ["education", "seniority", "location", "language"].includes(
                          expandedScores[candidate.id]!
                        ) && (
                          <div
                            className={`p-4 rounded-lg border transition-all duration-300 ease-in-out transform origin-top ${getExpandedScoreColor(
                              expandedScores[candidate.id]!
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {
                                  getScoreDetails(
                                    expandedScores[candidate.id]!,
                                    candidate
                                  )?.title
                                }
                              </h4>
                              <button
                                onClick={() =>
                                  onScoreClick(
                                    candidate.id,
                                    expandedScores[candidate.id]!
                                  )
                                }
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="h-48 overflow-y-auto">
                              <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="bg-white p-3 rounded border overflow-y-auto">
                                  <h5 className="font-medium text-gray-900 mb-2">
                                    Candidate Details
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {
                                      getScoreDetails(
                                        expandedScores[candidate.id]!,
                                        candidate
                                      )?.candidateDetails
                                    }
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded border overflow-y-auto">
                                  <h5 className="font-medium text-gray-900 mb-2">
                                    Job Requirements
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {
                                      getScoreDetails(
                                        expandedScores[candidate.id]!,
                                        candidate
                                      )?.jobRequirements
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Extras */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-semibold text-gray-700">
                          {candidate.matchScores.availabilityBonus.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Availability</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-semibold text-gray-700">
                          {candidate.matchScores.salaryAlignmentBonus.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Salary Align
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 text-right">
                      Updated:{" "}
                      {new Date(
                        candidate.matchScores.updatedAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const ApplicationsTab = () => {
    const statuses: ApplicationCandidate['status'][] = ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];
    
    const getStatusColor = (status: ApplicationCandidate['status']) => {
      switch (status) {
        case 'Applied': return 'bg-blue-50 border-blue-200';
        case 'Shortlisted': return 'bg-yellow-50 border-yellow-200';
        case 'Interview': return 'bg-purple-50 border-purple-200';
        case 'Hired': return 'bg-green-50 border-green-200';
        case 'Rejected': return 'bg-red-50 border-red-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    };

    const getStatusTextColor = (status: ApplicationCandidate['status']) => {
      switch (status) {
        case 'Applied': return 'text-blue-600';
        case 'Shortlisted': return 'text-yellow-600';
        case 'Interview': return 'text-purple-600';
        case 'Hired': return 'text-green-600';
        case 'Rejected': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    const getPlatformIcon = (platform: ApplicationCandidate['platform']) => {
      switch (platform) {
        case 'LinkedIn': return <Linkedin className="w-3 h-3 text-blue-600" />;
        case 'Indeed': return <Briefcase className="w-3 h-3 text-indigo-600" />;
        case 'Google': return <Globe className="w-3 h-3 text-red-600" />;
        case 'Talent.com': return <Users className="w-3 h-3 text-green-600" />;
        default: return <Globe className="w-3 h-3 text-gray-600" />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Applications</h2>
        </div>

        <div className="grid grid-cols-5 gap-4 h-[calc(100vh-300px)] overflow-hidden">
          {statuses.map((status) => (
            <div
              key={status}
              className={`p-3 rounded-lg border-2 border-dashed ${getStatusColor(status)} min-h-full`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-base ${getStatusTextColor(status)}`}>
                  {status}
                </h3>
                <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded-full">
                  {applications.filter(app => app.status === status).length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto h-[calc(100%-60px)]">
                {applications
                  .filter(app => app.status === status)
                  .map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-move hover:shadow-lg transition-all duration-200 border-2"
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                    >
                      <CardContent className="p-3 min-h-[160px]">
                        <div className="relative">
                          {/* Platform logo in corner */}
                          <div className="absolute top-1 right-1 z-10">
                            {getPlatformIcon(app.platform)}
                          </div>
                          
                          <div className="flex items-start gap-2">
                            {/* Candidate photo */}
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage
                                src={app.profile_pic_url || ""}
                                alt={app.name}
                              />
                              <AvatarFallback className="text-xs font-semibold bg-gray-100">
                                {app.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Candidate details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-xs text-gray-900 flex-1 pr-8">
                                  {app.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                                    {app.totalScore.toFixed(1)}
                                  </div>
                                  <GripVertical className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 leading-tight">
                                {app.email}
                              </p>
                              
                              <div className="text-xs text-gray-700 font-medium">
                                {app.role}
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                {app.company}
                              </div>
                              
                              {app.country && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Globe className="w-3 h-3" />
                                  {app.country}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative h-screen">
        <div className={`absolute inset-0 ${isRightPanelCollapsed ? 'right-12' : 'right-80'} overflow-auto transition-all duration-300`}>
          <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
              <Skeleton className="h-10 w-32 mb-4" />
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8 text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-6" />
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <Skeleton className="h-16 w-16 mx-auto mb-2" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-16 w-16 mx-auto mb-2" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </div>
              </div>
              <Skeleton className="h-12 w-48 mx-auto" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-8 w-64" />
              <div className="text-center space-y-4">
                <Skeleton className="h-12 w-96 mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full">
          <SharedAIPanel
            isCollapsed={isRightPanelCollapsed}
            onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            selectedContextCandidate={selectedContextCandidate}
            setSelectedContextCandidate={setSelectedContextCandidate}
            selectedContextCampaign={selectedContextCampaign}
            setSelectedContextCampaign={setSelectedContextCampaign}
            selectedProfileView={selectedProfileView}
            setSelectedProfileView={setSelectedProfileView}
            selectedCampaignView={selectedCampaignView}
            setSelectedCampaignView={setSelectedCampaignView}
            campaigns={rightPanelCampaigns}
            candidates={rightPanelCandidates}
          />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="relative h-screen">
        <div className={`absolute inset-0 ${isRightPanelCollapsed ? 'right-12' : 'right-80'} overflow-auto transition-all duration-300`}>
          <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Campaign not found"}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCampaignDetails()}
                  className="ml-2 bg-transparent"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full">
          <SharedAIPanel
            isCollapsed={isRightPanelCollapsed}
            onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            selectedContextCandidate={selectedContextCandidate}
            setSelectedContextCandidate={setSelectedContextCandidate}
            selectedContextCampaign={selectedContextCampaign}
            setSelectedContextCampaign={setSelectedContextCampaign}
            selectedProfileView={selectedProfileView}
            setSelectedProfileView={setSelectedProfileView}
            selectedCampaignView={selectedCampaignView}
            setSelectedCampaignView={setSelectedCampaignView}
            campaigns={rightPanelCampaigns}
            candidates={rightPanelCandidates}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className={`absolute inset-0 ${isRightPanelCollapsed ? 'right-12' : 'right-80'} overflow-auto transition-all duration-300`}>
        <div className="container mx-auto py-8 px-2 max-w-7xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              {debugInfo}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="candidates">Matched Candidates</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <DetailsTab
                campaign={campaign}
                onPublishToJobBoards={handlePublishToJobBoards}
              />
            </TabsContent>

            <TabsContent value="candidates">
              <MatchedCandidatesWithScoresTab
                candidates={sortedCandidates}
                onRefresh={() => checkForMatches()}
                expandedScores={expandedScores}
                onScoreClick={handleScoreClick}
                getScoreDetails={getScoreDetails}
                onShortlist={handleShortlist}
              />
            </TabsContent>

            <TabsContent value="applications">
              <ApplicationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Panel - fixed with spacer */}
      <div className={`hidden md:block flex-shrink-0 ${isRightPanelCollapsed ? 'w-12' : 'w-80'}`}></div>
      {/* <div className="hidden md:block fixed right-0 top-0 h-screen z-30"> */}
      <div className="hidden md:block fixed right-0 top-0 bottom-0 z-30"></div>
        <SharedAIPanel
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          selectedContextCandidate={selectedContextCandidate}
          setSelectedContextCandidate={setSelectedContextCandidate}
          selectedContextCampaign={selectedContextCampaign}
          setSelectedContextCampaign={setSelectedContextCampaign}
          selectedProfileView={selectedProfileView}
          setSelectedProfileView={setSelectedProfileView}
          selectedCampaignView={selectedCampaignView}
          setSelectedCampaignView={setSelectedCampaignView}
          campaigns={rightPanelCampaigns}
          candidates={rightPanelCandidates}
        />
      </div>

      {/* Job Board Modal */}
      <Dialog open={showJobBoardModal} onOpenChange={setShowJobBoardModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Publish to Job Boards</DialogTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                Preview
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-lg">
                Choose which job boards to publish your job posting to
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* LinkedIn */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('LinkedIn')
                    ? 'bg-blue-100 border-blue-400 shadow-lg'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                }`}
                onClick={() => handleJobBoardToggle('LinkedIn')}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Linkedin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">LinkedIn</h3>
                <p className="text-sm text-blue-700">Professional network</p>
                <p className="text-xs text-blue-600 mt-2">Premium candidates</p>
                {selectedJobBoards.includes('LinkedIn') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Indeed */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('Indeed')
                    ? 'bg-indigo-100 border-indigo-400 shadow-lg'
                    : 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                }`}
                onClick={() => handleJobBoardToggle('Indeed')}
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-indigo-900 mb-2">Indeed</h3>
                <p className="text-sm text-indigo-700">Job search giant</p>
                <p className="text-xs text-indigo-600 mt-2">High volume</p>
                {selectedJobBoards.includes('Indeed') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Google Jobs */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('Google Jobs')
                    ? 'bg-red-100 border-red-400 shadow-lg'
                    : 'bg-red-50 border-red-200 hover:border-red-300'
                }`}
                onClick={() => handleJobBoardToggle('Google Jobs')}
              >
                <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-red-900 mb-2">Google Jobs</h3>
                <p className="text-sm text-red-700">Search integration</p>
                <p className="text-xs text-red-600 mt-2">Wide reach</p>
                {selectedJobBoards.includes('Google Jobs') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Talent.com */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('Talent.com')
                    ? 'bg-green-100 border-green-400 shadow-lg'
                    : 'bg-green-50 border-green-200 hover:border-green-300'
                }`}
                onClick={() => handleJobBoardToggle('Talent.com')}
              >
                <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">Talent.com</h3>
                <p className="text-sm text-green-700">Global platform</p>
                <p className="text-xs text-green-600 mt-2">International</p>
                {selectedJobBoards.includes('Talent.com') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowJobBoardModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                className="bg-black hover:bg-gray-800 text-white px-6"
                onClick={handlePublishSelected}
                disabled={selectedJobBoards.length === 0}
              >
                Publish Selected ({selectedJobBoards.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
