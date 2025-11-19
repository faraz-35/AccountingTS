"use client";

import { Button, Input, Card, CardContent } from "@/(common)/components/ui";
import { useAction } from "next-safe-action/hooks";
import { matchTransaction, createAndMatchTransaction, findPotentialMatches } from "../actions/match";
import { useState, useEffect } from "react";
import { formatBankAmount, getBankTransactionColor } from "@/banking/(common)/types";

interface Props {
  bankTx: any;
  candidates?: any[];
  coa: any[];
}

export function ReconciliationRow({ bankTx, candidates = [], coa = [] }: Props) {
  const [mode, setMode] = useState<"MATCH" | "CREATE">("MATCH");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const matchAction = useAction(matchTransaction);
  const createAction = useAction(createAndMatchTransaction);
  const findCandidatesAction = useAction(findPotentialMatches);

  const handleMatch = () => {
    if (selectedMatchId) {
      matchAction.execute({
        bankTransactionId: bankTx.id,
        journalEntryId: selectedMatchId
      });
    }
  };

  const handleCreate = () => {
    if (selectedCategoryId) {
      createAction.execute({
        bankTransactionId: bankTx.id,
        accountId: selectedCategoryId,
        description: bankTx.description || "Bank transaction"
      });
    }
  };

  const handleFindCandidates = () => {
    findCandidatesAction.execute({
      bankTransactionId: bankTx.id
    });
  };

  const amountColor = getBankTransactionColor(bankTx.amount);
  const statusColor = bankTx.status === 'MATCHED' ? { bg: "bg-green-50", text: "text-green-800" } :
                       bankTx.status === 'UNMATCHED' ? { bg: "bg-yellow-50", text: "text-yellow-800" } :
                       { bg: "bg-gray-50", text: "text-gray-800" };

  if (bankTx.status === 'MATCHED') {
    return (
      <div className={`border-l-4 ${statusColor.bg} bg-white p-4`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-semibold text-gray-900">{bankTx.date}</div>
                <div className="text-sm text-gray-600">{bankTx.description}</div>
                {bankTx.external_id && (
                  <div className="text-xs text-gray-500">Ref: {bankTx.external_id}</div>
                )}
              </div>
              <div className={`font-bold text-lg ${amountColor.text}`}>
                {formatBankAmount(bankTx.amount)}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}>
              {bankTx.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div
          className={`border-l-4 ${statusColor.bg} p-4 cursor-pointer transition-colors hover:bg-gray-50`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{bankTx.date}</div>
                  <div className="text-sm text-gray-600">{bankTx.description}</div>
                  {bankTx.external_id && (
                    <div className="text-xs text-gray-500">Ref: {bankTx.external_id}</div>
                  )}
                </div>
                <div className={`font-bold text-lg ${amountColor.text}`}>
                  {formatBankAmount(bankTx.amount)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}>
                {bankTx.status}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t mt-4 pt-4">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <Button
                  variant={mode === "MATCH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("MATCH")}
                >
                  Find Match
                </Button>
                <Button
                  variant={mode === "CREATE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("CREATE")}
                >
                  Quick Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFindCandidates}
                >
                  Find Candidates
                </Button>
              </div>

              {mode === "MATCH" && (
                <div className="flex gap-2 items-end flex-1">
                  <div className="flex-1">
                    <Input
                      placeholder="Select or search matching entry..."
                      value={selectedMatchId}
                      onChange={(e) => setSelectedMatchId(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleMatch}
                    disabled={matchAction.status === 'executing' || !selectedMatchId}
                  >
                    {matchAction.status === 'executing' ? 'Matching...' : 'Confirm Match'}
                  </Button>
                </div>
              )}

              {mode === "CREATE" && (
                <div className="flex gap-2 items-end flex-1">
                  <div className="flex-1">
                    <select
                      className="w-full border rounded-md p-2 h-10 text-sm"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="">Select Category (Account)...</option>
                      {coa.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={createAction.status === 'executing' || !selectedCategoryId}
                  >
                    {createAction.status === 'executing' ? 'Creating...' : 'Create Entry'}
                  </Button>
                </div>
              )}
            </div>

            {/* Show candidates if found */}
            {candidates && candidates.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Potential Matches:</h4>
                <div className="space-y-1">
                  {candidates.slice(0, 5).map(candidate => (
                    <button
                      key={candidate.id}
                      onClick={() => setSelectedMatchId(candidate.id)}
                      className="w-full text-left p-2 text-sm hover:bg-white border rounded transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{candidate.description}</span>
                        <span className="text-xs text-gray-500">{candidate.date}</span>
                      </div>
                    </button>
                  ))}
                  {candidates.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      ... and {candidates.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
