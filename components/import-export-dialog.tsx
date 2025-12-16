"use client";

import { Download, FileText, Upload } from "lucide-react";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { exportPasswords, importPasswords } from "@/lib/tenant-import-export";

export function ImportExportDialog() {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("json");
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = async (format: "csv" | "json") => {
    try {
      const result = await exportPasswords(format);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Export failed",
          description: result.error,
        });
        return;
      }

      // Create download
      const blob = new Blob([result.data], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Passwords exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "An error occurred during export",
      });
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide import data",
      });
      return;
    }

    setImporting(true);
    try {
      const result = await importPasswords(importData, importFormat);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Import successful",
          description: `Imported ${result.imported} password(s)${
            result.errors ? ` with ${result.errors.length} errors` : ""
          }`,
        });
        if (result.errors && result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }
        setImportData("");
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "An error occurred during import",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      // Detect format from file extension
      if (file.name.endsWith(".csv")) {
        setImportFormat("csv");
      } else {
        setImportFormat("json");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import / Export Passwords</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Passwords</h3>
            <p className="text-sm text-muted-foreground">
              Download all your passwords in CSV or JSON format
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("json")} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Import Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Import Passwords</h3>
              <p className="text-sm text-muted-foreground">
                Import passwords from a CSV or JSON file
              </p>

              <div className="space-y-2">
                <Label htmlFor="import-format">Format</Label>
                <select
                  id="import-format"
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value as "csv" | "json")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">Upload File</Label>
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-data">Or Paste Data</Label>
                <textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={
                    importFormat === "json"
                      ? 'Paste JSON data here...\n[{"name": "Example", "username": "user", "password": "pass", ...}]'
                      : "Paste CSV data here...\nname,username,password\nExample,user,pass"
                  }
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button
                onClick={handleImport}
                disabled={importing || !importData.trim()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importing..." : "Import Passwords"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
