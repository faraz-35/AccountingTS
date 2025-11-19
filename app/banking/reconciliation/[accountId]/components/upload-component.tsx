"use client";

import { useState } from "react";
import { Button, Card, CardContent } from "@/(common)/components/ui";
import { useAction } from "next-safe-action/hooks";
import { uploadBankStatement } from "../actions/upload";
import { formatCurrency } from "@/accounting/(common)/utils";

interface Props {
  accountId: string;
  accountName: string;
}

export default function UploadComponent({ accountId, accountName }: Props) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const uploadAction = useAction(uploadBankStatement, {
    onSuccess: (data) => {
      setResult(`Successfully imported ${data?.count || 0} transactions`);
      setUploading(false);
      // File input will be cleared automatically after successful upload
      const fileInput = document.getElementById(
        "csvFileInput",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
    onError: (error) => {
      setResult(error.serverError || "Upload failed");
      setUploading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      if (csvContent) {
        uploadAction.execute({
          accountId,
          csvContent,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Bank Statement</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select CSV File
            </label>
            <Input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>

          <div className="text-sm text-gray-500">
            Expected CSV format: Date, Amount, Description, Reference (optional)
          </div>

          {uploading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Uploading...</span>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-md ${result.includes("Successfully") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {result}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Quick Tips:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Make sure your CSV has headers: Date, Amount, Description</li>
            <li>
              • Amount should be positive for deposits, negative for withdrawals
            </li>
            <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
            <li>
              • The system will automatically detect different date formats
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
