import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Shield,
  Euro,
  Calendar,
  ArrowLeft,
  Grid3X3,
  Map as MapIcon,
  ChevronDown,
  X,
  Verified,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { supabase, type Company } from "../lib/supabase";

interface CompanyWithRating extends Company {
  average_rating: number | null;
  review_count: number | null;
}

interface CompanyListPageProps {
  selectedService?: string;
  onNavigateBack: () => void;
}

function CompanyListPage({ selectedService, onNavigateBack }: CompanyListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("best-match");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [companies, setCompanies] = useState<CompanyWithRating[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setErrorCompanies(null);

      let query = supabase
        .from("companies_with_rating")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (selectedService) {
        query = query.contains("services", [selectedService]);
      }

      const { data, error } = await query.returns<CompanyWithRating[]>();
      if (error) throw error;

      setCompanies(data ?? []);
    } catch (error: any) {
      console.error("Error loading companies:", error);
      setErrorCompanies(error.message || "Chyba pri načítavaní firiem");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const quickFilters = [
    { id: "verified", label: "Overené", icon: Shield },
    { id: "rating-4plus", label: "★ 4+", icon: Star },
    { id: "today", label: "Dnes", icon: Calendar },
    { id: "escrow", label: "Escrow", icon: Shield },
    { id: "budget-50", label: "Do 50 €", icon: Euro },
  ];

  const sortOptions = [
    { value: "best-match", label: "Najlepšie pre mňa (AI)" },
    { value: "rating", label: "Hodnotenie" },
    { value: "price", label: "Cena" },
    { value: "response-time", label: "Rýchlosť reakcie" },
    { value: "distance", label: "Vzdialenosť" },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filterId));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  const renderStars = (rating?: number | null) => {
    if (!rating || rating <= 0) return (
      <div className="flex items-center">
        <Star size={16} className="text-gray-300" />
        <span className="ml-1 text-gray-500 text-sm">Bez hodnotenia</span>
      </div>
    );

    const rounded = Math.round(rating);
    return (
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < rounded;
          return (
            <Star
              key={i}
              size={16}
              className={filled ? "text-yellow-400" : "text-gray-300"}
              // lucide ikona – nastavíme fill, aby sa hviezdy naozaj vyplnili
              fill={filled ? "currentColor" : "none"}
            />
          );
        })}
      </div>
    );
  };

  // jednoduché klientské filtrovanie názvu/ popisu podľa searchQuery (neovplyvňuje dotaz do DB)
  const filtered = companies.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q) ||
      (c.location ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {selectedService ? `${selectedService} - Zoznam firiem` : "Všetky služby"}
          </h1>
          <p className="text-xl text-blue-100">Nájdite si overených odborníkov vo vašom okolí</p>
        </div>
      </div>

      {/
