"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  BarChart3,
  Bell,
  LogOut,
  User,
  Heart,
  Activity,
  Microscope,
  Baby,
  Filter,
  X,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface User {
  username: string;
  role: string;
  specialty?: string;
}

interface SearchResult {
  id: string;
  title: string;
  journal: string;
  publication_date: string;
  relevance_score: number;
  abstract: string;
  url?: string;
  authors: string[];
  source: string;
}

interface RiskAssessment {
  risk_score: number;
  risk_level: string;
  risk_factors: string[];
  confidence: number;
  method: string;
}

interface CostAnalysis {
  estimated_cost: number;
  cost_efficiency: string;
  cost_breakdown: {
    base_visit: number;
    procedures: number;
    complexity_factor: number;
  };
  method: string;
}

interface PopulationAnalysis {
  average_age: number;
  risk_distribution: { [key: string]: number };
  common_conditions: { [key: string]: any };
  timestamp: string;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    specialty: "",
    searchType: "literature",
    dateRange: "all",
  });

  // Analytics state
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [populationAnalysis, setPopulationAnalysis] =
    useState<PopulationAnalysis | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  const medicalSuggestions = [
    "heart failure treatment",
    "diabetes management",
    "hypertension guidelines",
    "cancer screening protocols",
    "pediatric vaccines",
    "mental health assessment",
    "stroke prevention",
    "chronic pain management",
    "infectious disease control",
    "cardiovascular risk factors",
    "oncology treatment options",
    "neurological disorders",
    "respiratory conditions",
    "gastrointestinal diseases",
    "endocrine disorders",
    "autoimmune diseases",
    "genetic disorders",
    "emergency medicine protocols",
    "surgical procedures",
    "pharmacological treatments",
    "diagnostic imaging",
    "laboratory tests",
    "patient monitoring",
    "quality of life measures",
  ];

  useEffect(() => {
    setIsClient(true);

    // Check authentication
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("currentUser");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(user));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const filtered = medicalSuggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const checkAPIHealth = async () => {
    try {
      console.log("🔍 Checking API health at http://localhost:5000/health");
      const response = await fetch("http://localhost:5000/health");
      const data = await response.json();
      console.log("🏥 API Health Check Response:", data);
      console.log("🏥 Response Status:", response.status);
      console.log(
        "🏥 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
      return response.ok;
    } catch (error) {
      console.error("❌ API Health Check Failed:");
      console.error("❌ Error type:", error.constructor.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Full error:", error);
      return false;
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query ?? searchQuery;
    // If there is no input and no tags, nothing to search
    if ((!searchTerm || !searchTerm.trim()) && searchTags.length === 0) return;

    setIsLoading(true);
    setShowSuggestions(false);

    // NOTE: we no longer mutate the visible input when tags are clicked.
    // Tags should be managed separately and included in the search payload below.

    try {
      // Check API health first
      const isAPIHealthy = await checkAPIHealth();
      if (!isAPIHealthy) {
        console.error(
          "❌ API is not responding. Please check if the backend is running on port 5001"
        );
        return;
      }

      // Build keywords and conditions from both the visible search input and tags
      const combinedTerms = [searchTerm, ...searchTags]
        .filter((t: string | undefined) => !!t && t.trim().length > 0)
        .map((t: string) => t.trim());

      const uniqueTerms = Array.from(new Set(combinedTerms));

      const keywords = uniqueTerms.flatMap((t: string) =>
        t.split(" ").filter((word: string) => word.length > 2)
      );

      const conditions = extractMedicalConditions(uniqueTerms.join(" "));

      console.log("🔍 Search parameters:", {
        searchTerm,
        keywords,
        conditions,
        filters,
      });

      // Check authentication
      const authToken = localStorage.getItem("authToken");
      console.log("🔐 Auth token present:", !!authToken);
      if (authToken) {
        console.log("🔐 Auth token length:", authToken.length);
      }

      // Fetch literature search
      const literatureResponse = await fetch(
        "http://localhost:5000/literature/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            specialty: filters.specialty || "General Medicine",
            keywords: keywords,
            patient_conditions: conditions,
            max_results: 10,
            enable_ai_analysis: true, // Explicitly enable AI analysis
            ai_model: "llama-3.1-8b-instant",
          }),
        }
      );

      if (literatureResponse.ok) {
        const literatureData = await literatureResponse.json();
        console.log("📚 Literature Search API Response:", literatureData);

        // Specifically log AI analysis
        if (literatureData.data && literatureData.data.ai_analysis) {
          console.log("🤖 AI ANALYSIS FOUND:", literatureData.data.ai_analysis);
          console.log(
            "🧠 AI Analysis Summary:",
            literatureData.data.ai_analysis.summary
          );
          console.log(
            "🔍 Key Findings:",
            literatureData.data.ai_analysis.key_findings
          );
          console.log(
            "⚕️ Clinical Implications:",
            literatureData.data.ai_analysis.clinical_implications
          );
          console.log(
            "📊 Confidence Score:",
            literatureData.data.ai_analysis.confidence_score
          );
        } else {
          console.log("❌ NO AI ANALYSIS in response");
          console.log(
            "📋 Available data keys:",
            Object.keys(literatureData.data || {})
          );
        }

        setSearchResults(
          literatureData.data?.studies || literatureData.studies || []
        );
      } else {
        console.error(
          "❌ Literature Search API Error:",
          await literatureResponse.text()
        );
        setSearchResults([]);
      }

      // Fetch analytics data
      await fetchAnalyticsData(uniqueTerms.join(" "), conditions);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async (query: string, conditions: string[]) => {
    try {
      console.log("🔍 Fetching analytics data for query:", query);
      console.log("🔍 Extracted conditions:", conditions);

      // Risk Assessment
      const riskResponse = await fetch(
        "http://localhost:5000/analytics/predict-risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            patient_data: {
              age: 65,
              systolic_bp: 150,
              glucose: 130,
              cholesterol: 260,
              bmi: 32,
              smoking: 1,
              conditions: conditions,
            },
            model_type: "risk",
          }),
        }
      );

      if (riskResponse.ok) {
        const riskData = await riskResponse.json();
        console.log("⚠️ Risk Assessment API Response:", riskData);
        setRiskAssessment(riskData);
      } else {
        console.error(
          "❌ Risk Assessment API Error:",
          await riskResponse.text()
        );
      }

      // Cost Analysis
      const costResponse = await fetch(
        "http://localhost:5000/analytics/predict-cost",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            patient_data: {
              age: 65,
              systolic_bp: 150,
              proposed_treatments: ["medication", "lab", "consultation"],
            },
            model_type: "cost",
          }),
        }
      );

      if (costResponse.ok) {
        const costData = await costResponse.json();
        console.log("💰 Cost Analysis API Response:", costData);
        setCostAnalysis(costData);
      } else {
        console.error("❌ Cost Analysis API Error:", await costResponse.text());
      }

      // Population Analysis
      const populationResponse = await fetch(
        "http://localhost:5000/analytics/population-trends",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            patients: [
              {
                age: 45,
                systolic_bp: 120,
                glucose: 100,
                conditions: conditions,
              },
              {
                age: 65,
                systolic_bp: 150,
                glucose: 130,
                conditions: conditions,
              },
              {
                age: 35,
                systolic_bp: 110,
                glucose: 90,
                conditions: conditions,
              },
              {
                age: 55,
                systolic_bp: 140,
                glucose: 115,
                conditions: conditions,
              },
            ],
          }),
        }
      );

      if (populationResponse.ok) {
        const populationData = await populationResponse.json();
        console.log("👥 Population Analysis API Response:", populationData);
        setPopulationAnalysis(populationData);
      } else {
        console.error(
          "❌ Population Analysis API Error:",
          await populationResponse.text()
        );
      }

      setShowAnalytics(true);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const extractMedicalConditions = (query: string) => {
    const medicalTerms = [
      "diabetes",
      "hypertension",
      "heart failure",
      "cancer",
      "stroke",
      "depression",
      "anxiety",
      "asthma",
      "copd",
      "arthritis",
      "obesity",
    ];
    return medicalTerms.filter((term: string) =>
      query.toLowerCase().includes(term)
    );
  };

  const removeSearchTag = (tag: string) => {
    setSearchTags(searchTags.filter((t: string) => t !== tag));
  };

  const quickActions = [
    { query: "heart failure treatment", icon: Heart, label: "Heart Failure" },
    { query: "diabetes management", icon: Activity, label: "Diabetes" },
    { query: "cancer screening", icon: Microscope, label: "Cancer Screening" },
    { query: "pediatric vaccines", icon: Baby, label: "Pediatric Care" },
  ];

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                HCP Engagement Platform
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentUser.role}
                {currentUser.specialty ? ` - ${currentUser.specialty}` : ""}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Search Interface */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI-Powered Medical Search
            </h2>
            <p className="text-gray-600">
              Search medical literature, get risk assessments, and find relevant
              studies
            </p>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  placeholder="Search for medical conditions, treatments, or research topics..."
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Add suggestion as a tag (do not replace visible input)
                          if (!searchTags.includes(suggestion)) {
                            setSearchTags((prev) => [...prev, suggestion]);
                          }
                          // Trigger search using input + tags
                          handleSearch();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  setFilters({ ...filters, specialty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Oncology">Oncology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <select
                value={filters.searchType}
                onChange={(e) =>
                  setFilters({ ...filters, searchType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="literature">Medical Literature</option>
                <option value="risk">Risk Assessment</option>
                <option value="cost">Cost Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="1year">Last Year</option>
                <option value="2years">Last 2 Years</option>
                <option value="5years">Last 5 Years</option>
              </select>
            </div>
          </div>

          {/* Search Tags */}
          {searchTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeSearchTag(tag)}
                    className="hover:text-indigo-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  // Add quick action query as a tag (do not replace visible input)
                  if (!searchTags.includes(action.query)) {
                    setSearchTags((prev) => [...prev, action.query]);
                  }
                  // Trigger search using input + tags
                  handleSearch();
                }}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl transition-colors"
              >
                <action.icon className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search Results
              </h3>
              <p className="text-gray-600">
                Found {searchResults.length} results
              </p>
            </div>
            <div className="space-y-6">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {result.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span>
                      <strong>Journal:</strong> {result.journal}
                    </span>
                    <span>
                      <strong>Date:</strong> {result.publication_date}
                    </span>
                    <span>
                      <strong>Source:</strong> {result.source}
                    </span>
                    <span>
                      <strong>Relevance:</strong>{" "}
                      {Math.round(result.relevance_score * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {result.abstract}
                  </p>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View Full Article
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics &&
          (riskAssessment || costAnalysis || populationAnalysis) && (
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  <BarChart3 className="inline w-6 h-6 mr-2" />
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600">
                  Risk factors, cost efficiency, and population analysis
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Assessment */}
                {riskAssessment && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Risk Assessment
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Risk Level
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            riskAssessment.risk_level === "high"
                              ? "bg-red-100 text-red-800"
                              : riskAssessment.risk_level === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {riskAssessment.risk_level.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Risk Score
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {Math.round((riskAssessment.risk_score || 0) * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Confidence
                        </span>
                        <span className="text-sm text-gray-900">
                          {Math.round((riskAssessment.confidence || 0) * 100)}%
                        </span>
                      </div>

                      {riskAssessment.risk_factors &&
                        riskAssessment.risk_factors.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-2">
                              Risk Factors
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {riskAssessment.risk_factors.map(
                                (factor, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                  >
                                    {factor}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Cost Analysis */}
                {costAnalysis && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Cost Analysis
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Estimated Cost
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          ${(costAnalysis.estimated_cost || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Cost Efficiency
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            costAnalysis.cost_efficiency === "high"
                              ? "bg-green-100 text-green-800"
                              : costAnalysis.cost_efficiency === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {costAnalysis.cost_efficiency.toUpperCase()}
                        </span>
                      </div>

                      {costAnalysis.cost_breakdown && (
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600 block">
                            Cost Breakdown
                          </span>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Base Visit:</span>
                              <span>
                                ${costAnalysis.cost_breakdown.base_visit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Procedures:</span>
                              <span>
                                ${costAnalysis.cost_breakdown.procedures}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Complexity Factor:</span>
                              <span>
                                {costAnalysis.cost_breakdown.complexity_factor}x
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Population Analysis */}
                {populationAnalysis && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Population Analysis
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Average Age
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {Math.round(populationAnalysis.average_age || 0)}{" "}
                          years
                        </span>
                      </div>

                      {populationAnalysis.risk_distribution && (
                        <div>
                          <span className="text-sm text-gray-600 block mb-2">
                            Risk Distribution
                          </span>
                          <div className="space-y-2">
                            {Object.entries(
                              populationAnalysis.risk_distribution
                            ).map(([level, count]) => (
                              <div
                                key={level}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm capitalize">
                                  {level} Risk
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{
                                        width: `${(Number(count) / 4) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Updated{" "}
                        {new Date(
                          populationAnalysis.timestamp
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Metrics */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Complexity Score
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {riskAssessment
                      ? Math.round((riskAssessment.risk_score || 0) * 100)
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Based on risk factors
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Efficiency Rating
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {costAnalysis
                      ? costAnalysis.cost_efficiency.toUpperCase()
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cost effectiveness
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Population Health
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {populationAnalysis
                      ? Math.round(populationAnalysis.average_age || 0)
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">Average age</div>
                </div>
              </div>
            </div>
          )}

        {/* Welcome Message */}
        {searchResults.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to AI-Powered Medical Search
            </h3>
            <p className="text-gray-600 mb-6">
              Start typing in the search box above to get intelligent
              suggestions and find relevant medical information.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(action.query);
                    handleSearch(action.query);
                  }}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl transition-colors"
                >
                  <action.icon className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
