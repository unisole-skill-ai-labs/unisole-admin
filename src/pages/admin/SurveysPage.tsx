import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSurveysQuery } from "../../store";
import {
  ClipboardList,
  ArrowRight,
  ExternalLink,
  Users,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getSurveyPublicUrl } from "../../utils/surveyUrl";

export default function SurveysPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const navigate = useNavigate();

  const { data: surveysRes, isLoading, error, refetch } = useGetSurveysQuery(baseUrl);
  const surveys = surveysRes?.data || [];

  const totalResponses = surveys.reduce(
    (acc: number, s: any) => acc + (Number(s.responseCount) || 0),
    0
  );
  const activeCount = surveys.filter((s: any) => s.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Campus Intake & Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Student Surveys & Diagnoses
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Interactive student diagnostic questionnaires, career interest surveys, and automated
            lead and learner intake pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <a
            href={getSurveyPublicUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Survey</span>
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400">
              Total Surveys
            </p>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {surveys.length}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-violet-500" />
              <span>Configured forms</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400">
              Active Campaigns
            </p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {activeCount}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Receiving submissions</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400">
              Total Responses
            </p>
            <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {totalResponses}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-500" />
              <span>Syncing to Leads & Learners</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Survey List Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>Configured Survey Catalog</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {surveys.length}
          </span>
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-violet-500" />
            <p className="text-sm font-semibold">Loading surveys...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400">
            <p className="font-bold">Failed to load surveys</p>
            <p className="text-xs mt-1">Please ensure the backend engine is running.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 border-rose-300 text-rose-700"
            >
              Retry
            </Button>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
              No Surveys Configured Yet
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Run the seed script `npm run db:seed:survey` in unisole-engine to seed the student skills survey.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {surveys.map((survey: any) => {
              const questionsCount = survey.schema?.questions?.length || 0;
              return (
                <div
                  key={survey.id}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-violet-500/50 dark:hover:border-violet-500/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {survey.title}
                          </h3>
                        </div>
                        <p className="text-xs font-mono text-zinc-400">
                          slug: <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{survey.slug}</span>
                        </p>
                      </div>

                      {survey.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {survey.description || "Student skills and career diagnostic questionnaire."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{survey.responseCount || 0} Submissions</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{questionsCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated {new Date(survey.updatedAt || survey.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/surveys/${survey.slug}?tab=schema`)}
                        className="text-xs font-semibold"
                      >
                        Edit Questions
                      </Button>
                      <a
                        href={getSurveyPublicUrl(survey.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Open Live Survey Form"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/surveys/${survey.slug}`)}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold"
                    >
                      <span>View Responses</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
