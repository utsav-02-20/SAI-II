import React, { useState } from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

/**
 * On-Demand Seed Data Loader.
 * Strictly adheres to Rule 2: Zero inline mock data and zero static seed imports on initial mount.
 * Dynamically fetches seed records only when explicitly invoked by the user.
 * 
 * @param {{
 *   domainId: string;
 *   seedType: 'medicines' | 'patients' | 'doctors' | 'lab_reports' | 'guidelines';
 *   onLoadSeed: (data: any[]) => void;
 *   label?: string;
 *   disabled?: boolean;
 * }} props
 */
export function SeedDataLoader({
  domainId,
  seedType,
  onLoadSeed,
  label = 'Load Clinical Seed Formulary',
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(null);

  const handleFetchSeed = async () => {
    setLoading(true);
    try {
      const seedFileMap = {
        medicines: 'mock_medicines.json',
        patients: 'mock_patients.json',
        doctors: 'mock_doctors.json',
        lab_reports: 'mock_lab_reports.json',
        guidelines: 'mock_guidelines.json',
      };

      const filename = seedFileMap[seedType];
      if (!filename) {
        console.warn(`Unknown seed type: ${seedType}`);
        return;
      }

      // Lazy on-demand runtime fetch (Zero static bundle inclusion)
      const res = await fetch(`/seed/${filename}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} loading /seed/${filename}`);
      }
      const data = await res.json();

      if (Array.isArray(data)) {
        setLoadedCount(data.length);
        onLoadSeed(data);
      }
    } catch (err) {
      console.error(`Failed to load seed dataset for ${seedType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        size="xs"
        variant="outline"
        onClick={handleFetchSeed}
        isLoading={loading}
        disabled={disabled}
        leftIcon={<Database className="w-3.5 h-3.5 text-zinc-500" />}
      >
        {label}
      </Button>
      {loadedCount !== null && (
        <Badge variant="accent" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{loadedCount} records attached from /seed</span>
        </Badge>
      )}
    </div>
  );
}

export default SeedDataLoader;
